import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import Script from 'next/script'
import type { ReactNode } from 'react'

import { MotionProvider } from '@/components/motion/MotionProvider'
import { SmoothScroll } from '@/components/motion/SmoothScroll'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { getSiteSettings } from '@/lib/payload'

import './globals.css'

// Pages read live content from the database on each request, so edits show immediately.
export const dynamic = 'force-dynamic'

const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600', '700'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' })
const body = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://cccerithparish.co.uk'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Celestial Church of Christ Noah’s Ark Erith Parish',
    template: '%s · CCC Erith Parish',
  },
  description:
    'Celestial Church of Christ Noah’s Ark Erith Parish — CCC Kent Regional Headquarters UK. A home of worship, prayer, holiness and spiritual transformation at 33 Bexley Road, Erith.',
  openGraph: { type: 'website', siteName: 'CCC Erith Parish', locale: 'en_GB' },
  icons: { apple: '/brand/apple-touch-icon.png' },
}

export const viewport: Viewport = { themeColor: '#300070', colorScheme: 'light' }

export default async function RootLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings()
  const analyticsToken = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN
  return (
    <html lang="en-GB" className={`${display.variable} ${body.variable}`}>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <MotionProvider>
          <SmoothScroll />
          <Header email={settings.email} phone={settings.phone} />
          <main id="main">{children}</main>
          <Footer settings={settings} />
        </MotionProvider>
        {analyticsToken ? (
          <Script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: analyticsToken })}
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  )
}
