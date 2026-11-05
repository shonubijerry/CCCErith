import { getCloudflareContext } from '@opennextjs/cloudflare'
import { headers } from 'next/headers'

import { isAdminUser } from '@/access'
import { runBackup } from '@/lib/backup'
import { getPayloadClient } from '@/lib/payload'

/** Admin-only: POST /api/backup to create a restore point now (the nightly job does this automatically). */
export async function POST() {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  if (!isAdminUser(user as { role?: string } | null)) return Response.json({ error: 'Admins only' }, { status: 403 })

  const { env } = await getCloudflareContext({ async: true })
  try {
    const result = await runBackup(env as unknown as Parameters<typeof runBackup>[0], { forcePoint: true })
    return Response.json(result)
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
