import type { Metadata } from 'next'

import { Reveal } from '@/components/motion/Reveal'
import { Icon } from '@/components/site/Icon'
import { PageHero } from '@/components/site/PageHero'
import { getSiteSettings } from '@/lib/payload'

import { ContactForm } from './ContactForm'

export const metadata: Metadata = { title: 'Contact', description: 'Visit or get in touch with CCC Erith Parish, 33 Bexley Road, Erith, Kent DA8 1SH.' }

// Map pin for 33 Bexley Road, Erith (OpenStreetMap: no cookies, no API key).
const MAP = 'https://www.openstreetmap.org/export/embed.html?bbox=0.1715%2C51.4775%2C0.1855%2C51.4838&layer=mapnik&marker=51.48069%2C0.17839'

export default async function ContactPage() {
  const s = await getSiteSettings()
  return (
    <>
      <PageHero eyebrow="Plan your visit" title="Get in touch" intro="We would love to hear from you — whether you are planning your first visit, need prayer, or have a question." />
      <section className="section">
        <div className="container contact-grid">
          <Reveal direction="left">
            <span className="eyebrow">Contact information</span>
            <h2>Visit us in Erith</h2>
            <ul className="contact-list">
              <li>
                <span className="contact-list__icon"><Icon name="pin" size={22} /></span>
                <div>
                  <small>Address</small>
                  {s.mapsUrl ? <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ whiteSpace: 'pre-line' }}>{s.address}</a> : <span style={{ whiteSpace: 'pre-line' }}>{s.address}</span>}
                </div>
              </li>
              <li>
                <span className="contact-list__icon"><Icon name="mail" size={22} /></span>
                <div><small>Email</small><a href={`mailto:${s.email}`}>{s.email}</a></div>
              </li>
              {s.phone ? (
                <li>
                  <span className="contact-list__icon"><Icon name="phone" size={22} /></span>
                  <div><small>Phone</small><a href={`tel:${s.phone.replace(/\s/g, '')}`}>{s.phone}</a></div>
                </li>
              ) : null}
              {s.officeHours ? (
                <li>
                  <span className="contact-list__icon"><Icon name="clock" size={22} /></span>
                  <div><small>Open</small>{s.officeHours}</div>
                </li>
              ) : null}
            </ul>
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
