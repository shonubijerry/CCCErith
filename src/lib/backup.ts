/**
 * Backups to a separate R2 bucket (binding BACKUPS), keeping only the latest 2 restore points.
 *
 * Layout in the backup bucket:
 *   points/<YYYY-MM-DD>/database.sql.gz   full D1 export (gzipped)
 *   points/<YYYY-MM-DD>/manifest.json     which media files existed at that moment
 *   media/<etag>/<key>                    each distinct uploaded file, stored once and shared by points
 *
 * Cost: media is copied incrementally (only new or changed files), so a typical run is a handful of
 * R2 operations — far inside the free tier. Nothing is deleted until a new point has been written.
 */

type Env = {
  R2: R2Bucket
  BACKUPS: R2Bucket
  CF_ACCOUNT_ID?: string
  D1_DATABASE_ID?: string
  CF_API_TOKEN?: string
}

type Manifest = { createdAt: string; media: { key: string; etag: string; size: number }[] }

const KEEP = 2
/** Stay well under Workers' per-invocation subrequest limit; the rest is picked up next night. */
const MAX_COPIES_PER_RUN = 400

const mirrorKey = (etag: string, key: string) => `media/${etag}/${key}`

async function listAll(bucket: R2Bucket, prefix?: string, delimiter?: string) {
  const objects: R2Object[] = []
  const prefixes: string[] = []
  let cursor: string | undefined
  do {
    const page = await bucket.list({ prefix, delimiter, cursor, limit: 1000 })
    objects.push(...page.objects)
    prefixes.push(...(page.delimitedPrefixes ?? []))
    cursor = page.truncated ? page.cursor : undefined
  } while (cursor)
  return { objects, prefixes }
}

/** Copy new/changed media into the backup bucket. Returns true when everything is mirrored. */
export async function mirrorMedia(env: Env, log: (msg: string) => void) {
  const [{ objects: source }, { objects: mirrored }] = await Promise.all([listAll(env.R2), listAll(env.BACKUPS, 'media/')])
  const have = new Set(mirrored.map((o) => o.key))
  const missing = source.filter((o) => !have.has(mirrorKey(o.etag, o.key)))
  const batch = missing.slice(0, MAX_COPIES_PER_RUN)
  for (const o of batch) {
    const obj = await env.R2.get(o.key)
    if (!obj) continue
    await env.BACKUPS.put(mirrorKey(o.etag, o.key), obj.body, { httpMetadata: obj.httpMetadata })
  }
  log(`media: ${source.length} files, copied ${batch.length} new, ${missing.length - batch.length} left for next run`)
  return { complete: batch.length === missing.length, source }
}

async function cfApi<T>(env: Env, path: string, body: unknown): Promise<T> {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/d1/database/${env.D1_DATABASE_ID}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.CF_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = (await res.json()) as { success: boolean; result: T; errors?: unknown }
  if (!json.success) throw new Error(`D1 API ${path} failed: ${JSON.stringify(json.errors)}`)
  return json.result
}

/** Uses D1's export API (polling mode) and returns the SQL dump as a stream. */
async function exportDatabase(env: Env): Promise<ReadableStream<Uint8Array>> {
  if (!env.CF_ACCOUNT_ID || !env.D1_DATABASE_ID || !env.CF_API_TOKEN) {
    throw new Error('Backup needs CF_ACCOUNT_ID, D1_DATABASE_ID and the CF_API_TOKEN secret')
  }
  type ExportResult = { at_bookmark?: string; status?: string; error?: string; result?: { signed_url?: string } }
  let bookmark: string | undefined
  for (let attempt = 0; attempt < 60; attempt++) {
    const r: ExportResult = await cfApi(env, '/export', { output_format: 'polling', current_bookmark: bookmark })
    if (r.error) throw new Error(`D1 export error: ${r.error}`)
    bookmark = r.at_bookmark ?? bookmark
    if (r.status === 'complete' && r.result?.signed_url) {
      const dump = await fetch(r.result.signed_url)
      if (!dump.ok || !dump.body) throw new Error(`Downloading D1 export failed: ${dump.status}`)
      return dump.body
    }
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }
  throw new Error('D1 export timed out')
}

async function prune(env: Env, log: (msg: string) => void) {
  const { prefixes } = await listAll(env.BACKUPS, 'points/', '/')
  const points = prefixes.sort().reverse() // newest first (dates sort naturally)
  const keep = points.slice(0, KEEP)
  const drop = points.slice(KEEP)

  for (const p of drop) {
    const { objects } = await listAll(env.BACKUPS, p)
    if (objects.length) await env.BACKUPS.delete(objects.map((o) => o.key))
  }

  // Remove mirrored media that no remaining point refers to.
  const referenced = new Set<string>()
  for (const p of keep) {
    const m = await env.BACKUPS.get(`${p}manifest.json`)
    if (!m) return log('prune: a kept point has no manifest; skipping media cleanup to be safe')
    for (const f of ((await m.json()) as Manifest).media) referenced.add(mirrorKey(f.etag, f.key))
  }
  const { objects: mirrored } = await listAll(env.BACKUPS, 'media/')
  const orphans = mirrored.map((o) => o.key).filter((k) => !referenced.has(k))
  for (let i = 0; i < orphans.length; i += 1000) await env.BACKUPS.delete(orphans.slice(i, i + 1000))
  log(`prune: kept ${keep.length} points, removed ${drop.length} points and ${orphans.length} unused media copies`)
}

/**
 * Nightly job. Mirrors new media every night; on Sundays (or when forced) also writes a full
 * restore point and prunes to the latest 2.
 */
export async function runBackup(env: Env, opts: { forcePoint?: boolean; now?: Date } = {}) {
  const lines: string[] = []
  const log = (msg: string) => {
    lines.push(msg)
    console.log(JSON.stringify({ level: 'info', msg: `[backup] ${msg}` }))
  }
  const now = opts.now ?? new Date()

  const { complete, source } = await mirrorMedia(env, log)
  const isSunday = now.getUTCDay() === 0
  if (!opts.forcePoint && !isSunday) return { ok: true, log: lines }
  if (!complete) {
    log('restore point postponed: media copy not finished yet (continues tomorrow)')
    return { ok: true, log: lines }
  }

  const stamp = now.toISOString().slice(0, 10)
  const base = `points/${stamp}/`
  // Buffered: R2 needs a known length, and church-sized dumps are only a few MB at most.
  const sql = await new Response(await exportDatabase(env)).arrayBuffer()
  if (sql.byteLength < 100) throw new Error('Database export looks empty; keeping old backups')
  const body = await new Response(new Blob([sql]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()
  await env.BACKUPS.put(`${base}database.sql.gz`, body, { httpMetadata: { contentType: 'application/gzip' } })

  const manifest: Manifest = { createdAt: now.toISOString(), media: source.map((o) => ({ key: o.key, etag: o.etag, size: o.size })) }
  await env.BACKUPS.put(`${base}manifest.json`, JSON.stringify(manifest, null, 1), { httpMetadata: { contentType: 'application/json' } })
  log(`point ${stamp}: database ${(body.byteLength / 1024).toFixed(1)} KB gz, ${source.length} media files`)

  await prune(env, log)
  return { ok: true, log: lines }
}
