// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { runBackup } from '@/lib/backup'

/** Minimal in-memory stand-in for an R2 bucket (only what backup.ts uses). */
class FakeBucket {
  store = new Map<string, { body: Uint8Array; etag: string }>()
  ops = { put: 0, get: 0, delete: 0, list: 0 }

  async put(key: string, value: ArrayBuffer | ReadableStream | string) {
    this.ops.put++
    const body = new Uint8Array(await new Response(value as BodyInit).arrayBuffer())
    this.store.set(key, { body, etag: `etag-${body.length}-${body[0] ?? 0}` })
  }
  async get(key: string) {
    this.ops.get++
    const o = this.store.get(key)
    if (!o) return null
    return { body: new Response(o.body).body!, httpMetadata: {}, json: async () => JSON.parse(new TextDecoder().decode(o.body)) }
  }
  async delete(keys: string | string[]) {
    this.ops.delete++
    for (const k of Array.isArray(keys) ? keys : [keys]) this.store.delete(k)
  }
  async list({ prefix = '', delimiter }: { prefix?: string; delimiter?: string; cursor?: string; limit?: number }) {
    this.ops.list++
    const keys = [...this.store.keys()].filter((k) => k.startsWith(prefix)).sort()
    if (delimiter) {
      const prefixes = new Set<string>()
      const objects = []
      for (const k of keys) {
        const rest = k.slice(prefix.length)
        const i = rest.indexOf(delimiter)
        if (i >= 0) prefixes.add(prefix + rest.slice(0, i + 1))
        else objects.push(this.obj(k))
      }
      return { objects, delimitedPrefixes: [...prefixes], truncated: false }
    }
    return { objects: keys.map((k) => this.obj(k)), delimitedPrefixes: [], truncated: false }
  }
  private obj(key: string) {
    const o = this.store.get(key)!
    return { key, etag: o.etag, size: o.body.length }
  }
}

const sunday = (day: number) => new Date(Date.UTC(2026, 10, day, 2)) // Nov 2026: 1, 8, 15, 22 are Sundays

describe('backup', () => {
  let media: FakeBucket
  let backups: FakeBucket
  let env: Parameters<typeof runBackup>[0]

  beforeEach(async () => {
    media = new FakeBucket()
    backups = new FakeBucket()
    await media.put('photo-a.webp', 'AAAA')
    await media.put('photo-b.webp', 'BBBBBB')
    env = { R2: media as unknown as R2Bucket, BACKUPS: backups as unknown as R2Bucket, CF_ACCOUNT_ID: 'acc', D1_DATABASE_ID: 'db', CF_API_TOKEN: 'tok' }
    // Fake D1 export API: complete on first poll, dump download returns some SQL.
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/export')) {
          return Response.json({ success: true, result: { status: 'complete', at_bookmark: 'b', result: { signed_url: 'https://dump/x.sql' } } })
        }
        return new Response('CREATE TABLE pages (id integer);\n'.repeat(20))
      }),
    )
  })
  afterEach(() => vi.unstubAllGlobals())

  const points = () => [...new Set([...backups.store.keys()].filter((k) => k.startsWith('points/')).map((k) => k.split('/')[1]))].sort()
  const mirrored = () => [...backups.store.keys()].filter((k) => k.startsWith('media/')).sort()

  it('on weekdays only mirrors new media, without making a restore point', async () => {
    await runBackup(env, { now: new Date(Date.UTC(2026, 10, 4, 2)) }) // Wednesday
    expect(points()).toEqual([])
    expect(mirrored()).toHaveLength(2)
  })

  it('copies each media file only once', async () => {
    await runBackup(env, { now: sunday(1) })
    const puts = backups.ops.put
    await runBackup(env, { now: new Date(Date.UTC(2026, 10, 2, 2)) })
    expect(backups.ops.put).toBe(puts) // nothing new to copy on Monday
  })

  it('keeps only the latest 2 restore points', async () => {
    await runBackup(env, { now: sunday(1) })
    await runBackup(env, { now: sunday(8) })
    await runBackup(env, { now: sunday(15) })
    await runBackup(env, { now: sunday(22) })
    expect(points()).toEqual(['2026-11-15', '2026-11-22'])
    expect(backups.store.get('points/2026-11-22/database.sql.gz')!.body.length).toBeGreaterThan(20)
  })

  it('removes mirrored media only when no kept point needs it', async () => {
    await runBackup(env, { now: sunday(1) })
    await media.delete('photo-a.webp') // an editor deletes a photo
    await runBackup(env, { now: sunday(8) })
    // Point of the 1st still references photo-a, so it must survive.
    expect(mirrored().some((k) => k.endsWith('/photo-a.webp'))).toBe(true)
    await runBackup(env, { now: sunday(15) })
    // Now neither kept point (8th, 15th) has photo-a.
    expect(mirrored().some((k) => k.endsWith('/photo-a.webp'))).toBe(false)
    expect(mirrored().some((k) => k.endsWith('/photo-b.webp'))).toBe(true)
  })

  it('keeps existing backups if the database export fails', async () => {
    await runBackup(env, { now: sunday(1) })
    await runBackup(env, { now: sunday(8) })
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ success: false, errors: [{ message: 'boom' }] })))
    await expect(runBackup(env, { now: sunday(15) })).rejects.toThrow()
    expect(points()).toEqual(['2026-11-01', '2026-11-08'])
  })
})
