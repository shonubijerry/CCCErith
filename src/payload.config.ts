import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'

import { Albums } from './collections/Albums'
import { ContactMessages } from './collections/ContactMessages'
import { Events } from './collections/Events'
import { Media } from './collections/Media'
import { Ministries } from './collections/Ministries'
import { Pages } from './collections/Pages'
import { Sermons } from './collections/Sermons'
import { Departments, TeamMembers } from './collections/Team'
import { Users } from './collections/Users'
import { WeeklyServices } from './collections/WeeklyServices'
import { AboutPage } from './globals/AboutPage'
import { CommunityPage } from './globals/CommunityPage'
import { HomePage } from './globals/HomePage'
import { Navigation } from './globals/Navigation'
import { SiteSettings } from './globals/SiteSettings'
import { cloudflareEmailAdapter, type EmailBinding } from './lib/cloudflareEmail'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const realpath = (value: string) => {
  try {
    return fs.existsSync(value) ? fs.realpathSync(value) : undefined
  } catch {
    return undefined
  }
}

const isCLI = process.argv.some((value) => {
  const resolved = realpath(value)
  if (!resolved) return false
  return (
    resolved.endsWith(path.join('payload', 'bin.js')) ||
    resolved.endsWith(path.join('next', 'dist', 'bin', 'next'))
  )
})
const isProduction = process.env.NODE_ENV === 'production'
// `next build` only needs the config shape (pages are rendered per request), so use local
// stand-in bindings there instead of connecting to the live database.
const isBuild = process.env.PAYLOAD_LOCAL_BINDINGS === '1' || process.env.NEXT_PHASE === 'phase-production-build'

const createLog =
  (level: string, fn: typeof console.log) => (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === 'string') {
      fn(JSON.stringify({ level, msg: objOrMsg }))
    } else {
      fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
    }
  }

const cloudflareLogger = {
  level: process.env.PAYLOAD_LOG_LEVEL || 'info',
  trace: createLog('trace', console.debug),
  debug: createLog('debug', console.debug),
  info: createLog('info', console.log),
  warn: createLog('warn', console.warn),
  error: createLog('error', console.error),
  fatal: createLog('fatal', console.error),
  silent: () => {},
} as any // Use PayloadLogger type when it's exported

const cloudflare =
  isCLI || isBuild || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · CCC Erith Parish',
      icons: [{ rel: 'icon', type: 'image/png', url: '/brand/icon.png' }],
    },
    components: {
      graphics: {
        Logo: '/components/admin/AdminLogo#AdminLogo',
        Icon: '/components/admin/AdminLogo#AdminIcon',
      },
    },
  },
  collections: [
    Pages,
    Sermons,
    Events,
    WeeklyServices,
    Ministries,
    Albums,
    Departments,
    TeamMembers,
    Media,
    ContactMessages,
    Users,
  ],
  globals: [HomePage, AboutPage, CommunityPage, SiteSettings, Navigation],
  // Cloudflare Workers allow at most 100,000 PBKDF2 iterations for password hashing.
  auth: { passwordHashIterations: 100000 },
  email: cloudflareEmailAdapter(() => (cloudflare.env as unknown as { EMAIL?: EmailBinding }).EMAIL),
  graphQL: { disable: true },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteD1Adapter({
    binding: cloudflare.env.D1,
  }),
  logger: isProduction ? cloudflareLogger : undefined,
  plugins: [
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
  ],
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: isProduction && !isBuild,
      } satisfies GetPlatformProxyOptions),
  )
}
