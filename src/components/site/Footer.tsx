import Image from 'next/image'
import Link from 'next/link'

import type { SiteSetting } from '@/payload-types'

import { Icon, type IconName } from './Icon'

export function Footer({ settings }: { settings: SiteSetting }) {
  const socials = (['facebook', 'instagram', 'youtube', 'tiktok'] as const).filter((k) => settings[k])
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Image src="/brand/logo.webp" alt="CCC Erith Parish" width={320} height={145} unoptimized />
            <p>{settings.tagline}</p>
            {socials.length ? (
              <div className="footer__social">
                {socials.map((k) => (
                  <a key={k} href={settings[k] as string} target="_blank" rel="noopener noreferrer" aria-label={k}>
                    <Icon name={k as IconName} size={18} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link href="/about-us">About Us</Link></li>
              <li><Link href="/our-team">Our Team</Link></li>
              <li><Link href="/ministries">Ministries</Link></li>
              <li><Link href="/events">Services &amp; Events</Link></li>
              <li><Link href="/sermons">Sermons</Link></li>
              <li><Link href="/gallery">Gallery</Link></li>
            </ul>
          </div>
          <div>
            <h4>Church</h4>
            <ul>
              <li><Link href="/give">Give</Link></li>
              <li><Link href="/community-service">Community Service</Link></li>
              <li><Link href="/safeguarding-policy">Safeguarding</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/cookie-policy">Cookie Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4>Visit us</h4>
            <ul>
              <li style={{ whiteSpace: 'pre-line' }}>
                {settings.mapsUrl ? (
                  <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer">{settings.address}</a>
                ) : (
                  settings.address
                )}
              </li>
              <li><a href={`mailto:${settings.email}`}>{settings.email}</a></li>
              {settings.phone ? <li><a href={`tel:${settings.phone.replace(/\s/g, '')}`}>{settings.phone}</a></li> : null}
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {year} {settings.churchName}. All rights reserved.</span>
          {settings.charityNumber ? <span>Registered charity in England &amp; Wales no. {settings.charityNumber}</span> : null}
        </div>
      </div>
    </footer>
  )
}
