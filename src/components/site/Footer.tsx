import Image from 'next/image'

import type { SiteSetting } from '@/payload-types'

import { Icon, type IconName } from './Icon'
import type { FooterColumn } from './nav'
import { NavAnchor } from './NavAnchor'

export function Footer({ settings, columns }: { settings: SiteSetting; columns: FooterColumn[] }) {
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
          {columns.map((col, i) => (
            <div key={i}>
              <h4>{col.heading}</h4>
              <ul>
                {col.links.map((l, j) => (
                  <li key={j}>
                    <NavAnchor href={l.href} newTab={l.newTab}>{l.label}</NavAnchor>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
