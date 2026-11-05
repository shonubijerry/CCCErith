import type { Metadata } from 'next'

import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { WordReveal } from '@/components/motion/WordReveal'
import { Icon, type IconName } from '@/components/site/Icon'
import { PageHero } from '@/components/site/PageHero'
import { getSiteSettings } from '@/lib/payload'

import { ContactForm } from './ContactForm'

export const metadata: Metadata = { title: 'Contact', description: 'Visit or get in touch with CCC Erith Parish, 33 Bexley Road, Erith, Kent DA8 1SH.' }

// Map pin for 33 Bexley Road, Erith (OpenStreetMap: no cookies, no API key).
const MAP = 'https://www.openstreetmap.org/export/embed.html?bbox=0.1715%2C51.4775%2C0.1855%2C51.4838&layer=mapnik&marker=51.48069%2C0.17839'

export default async function ContactPage() {
  const s = await getSiteSettings()
  const cards: { icon: IconName; label: string; value: string; href?: string; external?: boolean }[] = [
    { icon: 'pin', label: 'Visit us', value: s.address.replace(/\n/g, ', '), href: s.mapsUrl ?? undefined, external: true },
    { icon: 'mail', label: 'Email', value: s.email, href: `mailto:${s.email}` },
    ...(s.phone ? [{ icon: 'phone' as const, label: 'Phone', value: s.phone, href: `tel:${s.phone.replace(/\s/g, '')}` }] : []),
    ...(s.officeHours ? [{ icon: 'clock' as const, label: 'Open', value: s.officeHours }] : []),
  ]

  return (
    <>
      <PageHero eyebrow="Plan your visit" title="Get in touch" intro="We would love to hear from you — whether you are planning your first visit, need prayer, or have a question." className="page-hero--tall" curve={false} />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container contact-overlap">
          <Stagger className="contact-cards">
            {cards.map((c) => (
              <StaggerItem key={c.label} className="contact-card">
                <span className="contact-list__icon"><Icon name={c.icon} size={22} /></span>
                <small>{c.label}</small>
                {c.href ? (
                  <a href={c.href} target={c.external ? '_blank' : undefined} rel={c.external ? 'noopener noreferrer' : undefined}>{c.value}</a>
                ) : (
                  <span>{c.value}</span>
                )}
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        <div className="container contact-grid mt-lg">
          <Reveal direction="left">
            <span className="eyebrow">Find us</span>
            <WordReveal as="h2" text="Visit us in Erith" accentLast />
            <p style={{ color: 'var(--muted)' }}>Our church is on Bexley Road in Northumberland Heath, a short bus ride from Erith and Bexleyheath stations.</p>
            <div className="map">
              <iframe src={MAP} title="Map showing 33 Bexley Road, Erith" loading="lazy" />
            </div>
          </Reveal>
          <Reveal direction="right" className="form-card">
            <h3>Send us a message</h3>
            <p style={{ color: 'var(--muted)' }}>Fill in the form and someone from the church will reply as soon as possible.</p>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  )
}
