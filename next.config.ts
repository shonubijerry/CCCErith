import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

// Old WordPress addresses -> new pages, so existing links and search results keep working.
const legacyRedirects: [string, string][] = [
  ['/contacts', '/contact'],
  ['/our-ministries', '/ministries'],
  ['/latest-sermons', '/sermons'],
  ['/events-page', '/events'],
  ['/refund_returns', '/cookie-policy'],
  ['/donation-page', '/give'],
  ['/donation-confirmation', '/give'],
  ['/donation-confirmation-2', '/give'],
  ['/donation-failed', '/give'],
  ['/donation-failed-2', '/give'],
  ['/donor-dashboard', '/give'],
  ['/donor-dashboard-2', '/give'],
  ['/donor-dashboard-2-2', '/give'],
  ['/blog-page', '/'],
  ['/shop', '/'],
  ['/cart', '/'],
  ['/checkout', '/'],
  ['/my-account', '/'],
]

const nextConfig: NextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
    deviceSizes: [640, 1080, 1600, 2048],
    imageSizes: [96, 256, 384],
  },
  async redirects() {
    return [
      ...legacyRedirects.map(([source, destination]) => ({ source, destination, permanent: true })),
      { source: '/wp-admin/:path*', destination: '/admin', permanent: false },
      { source: '/wp-login.php', destination: '/admin', permanent: false },
    ]
  },
  async headers() {
    return [
      {
        source: '/api/media/file/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
      {
        source: '/brand/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ]
  },
  // Packages with Cloudflare Workers (workerd) specific code
  // Read more: https://opennext.js.org/cloudflare/howtos/workerd
  serverExternalPackages: ['jose', 'pg-cloudflare'],
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
