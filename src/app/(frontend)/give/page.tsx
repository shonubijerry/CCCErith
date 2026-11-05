import type { Metadata } from 'next'
import Link from 'next/link'

import { Reveal } from '@/components/motion/Reveal'
import { Icon } from '@/components/site/Icon'
import { PageHero } from '@/components/site/PageHero'
import { getSiteSettings } from '@/lib/payload'

export const metadata: Metadata = { title: 'Give', description: 'Support the ministry and community work of CCC Erith Parish.' }

export default async function GivePage() {
  const s = await getSiteSettings()
  return (
    <>
      <PageHero eyebrow="Generosity" title="Support the work of God" intro={s.givingIntro} />
      <section className="section">
        <div className="container give-layout">
          <Reveal className="give-hero-card">
            <div className="give-hero-card__icon"><Icon name="heart" size={30} /></div>
            <span className="eyebrow eyebrow--light">Give online</span>
            <h2>Give securely with PayPal</h2>
            <p>Give by card or with your PayPal account. One-off and regular gifts are both welcome — thank you for supporting the ministry and outreach of our parish.</p>
            <div style={{ marginTop: 28 }}>
              {s.paypalUrl ? (
                <a href={s.paypalUrl} className="btn btn--white" target="_blank" rel="noopener noreferrer">
                  Give with PayPal <Icon name="external" size={16} />
                </a>
              ) : (
                <span className="give-hero-card__soon">Online giving coming soon</span>
              )}
            </div>
          </Reveal>
          <Reveal className="give-card" delay={0.15}>
            <span className="give-card__icon"><Icon name="hand" size={26} /></span>
            <h3>Give in person</h3>
            <p style={{ margin: 0, color: 'var(--muted)' }}>{s.inPersonText}</p>
            <div style={{ marginTop: 'auto' }}>
              <Link href="/events" className="text-link">Service times <Icon name="arrow" size={15} /></Link>
            </div>
          </Reveal>
        </div>
        {s.charityNumber ? (
          <Reveal className="container mt-lg center">
            <p style={{ color: 'var(--muted)', maxWidth: 640, margin: '0 auto' }}>
              <Icon name="shield" size={16} style={{ display: 'inline', verticalAlign: '-3px', color: 'var(--purple)' }} />{' '}
              {s.churchName} is a registered charity in England &amp; Wales (no. {s.charityNumber}). Thank you for your generosity.
            </p>
          </Reveal>
        ) : null}
      </section>
    </>
  )
}
