/**
 * Worker entry: the OpenNext (Next.js + Payload) app, plus a nightly scheduled backup.
 * See src/lib/backup.ts.
 */
// @ts-ignore `.open-next/worker.js` is generated at build time
import { default as handler } from './.open-next/worker.js'

import { runBackup } from './src/lib/backup'

export default {
  fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext) {
    const url = new URL(request.url)
    if (url.hostname === 'www.cccerithparish.co.uk') {
      url.hostname = 'cccerithparish.co.uk'
      return Response.redirect(url.toString(), 301)
    }
    return handler.fetch(request, env, ctx)
  },
  async scheduled(_controller: ScheduledController, env: CloudflareEnv, ctx: ExecutionContext) {
    ctx.waitUntil(
      runBackup(env as unknown as Parameters<typeof runBackup>[0]).catch((err) => {
        console.error(JSON.stringify({ level: 'error', msg: '[backup] failed', error: String(err) }))
        throw err
      }),
    )
  },
} satisfies ExportedHandler<CloudflareEnv>
