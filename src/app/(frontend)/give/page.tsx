import type { Metadata } from 'next'
import Link from 'next/link'

import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { CopyButton } from '@/components/site/CopyButton'
import { Icon } from '@/components/site/Icon'
import { PageHero } from '@/components/site/PageHero'
import { getSiteSettings } from '@/lib/payload'

export const metadata: Metadata = { title: 'Give', description: 'Support the ministry and community work of CCC Erith Parish.' }

export default async function GivePage() {
  const s = await getSiteSettings()
  const bank = s.bank ?? {}
  const rows = [
    { label: 'Account name', value: bank.accountName },
    { label: 'Sort code', value: bank.sortCode },
    { label: 'Account number', value: bank.accountNumber },
    { label: 'Reference', value: bank.reference },
  ].filter((r): r is { label: string; value: string } => Boolean(r.value))

  return (
    <>
      <PageHero eyebrow="Generosity" title="Support the work of God" intro={s.givingIntro} />
      <section className="section">
        <div className="container">
          <Stagger className="give-options">
            {rows.length ? (
              <StaggerItem className="give-card give-card--featured">
                <span className="give-card__icon"><Icon name="bank" size={26} /></span>
                <h3>Bank transfer</h3>
                <p style={{ margin: 0 }}>The simplest way to give — no fees, so every penny reaches the church.</p>
                <div>
                  {rows.map((r) => (
                    <div key={r.label} className="bank-row">
                      <div>
                        <small>{r.label}</small>
                        <strong>{r.value}</strong>
                      </div>
                      <CopyButton value={r.value} label={r.label.toLowerCase()} />
                    </div>
                  ))}
                </div>
              </StaggerItem>
            ) : null}
            {s.paypalUrl ? (
              <StaggerItem className="give-card">
                <span className="give-card__icon"><Icon name="heart" size={26} /></span>
                <h3>Give online</h3>
                <p style={{ margin: 0, color: 'var(--muted)' }}>Give securely by card or PayPal account. One-off or regular gifts are welcome.</p>
                <div style={{ marginTop: 'auto' }}>
                  <a href={s.paypalUrl} className="btn" target="_blank" rel="noopener noreferrer">
                    Give with PayPal <Icon name="external" size={16} />
                  </a>
                </div>
              </StaggerItem>
            ) : null}
            <StaggerItem className="give-card">
              <span className="give-card__icon"><Icon name="hand" size={26} /></span>
              <h3>Give in person</h3>
              <p style={{ margin: 0, color: 'var(--muted)' }}>{s.inPersonText}</p>
              <div style={{ marginTop: 'auto' }}>
                <Link href="/events" className="text-link">Service times <Icon name="arrow" size={15} /></Link>
              </div>
            </StaggerItem>
          </Stagger>
          {s.charityNumber ? (
            <Reveal className="mt-lg center">
              <p style={{ color: 'var(--muted)', maxWidth: 640, margin: '0 auto' }}>
                <Icon name="shield" size={16} style={{ display: 'inline', verticalAlign: '-3px', color: 'var(--purple)' }} />{' '}
                {s.churchName} is a registered charity in England &amp; Wales (no. {s.charityNumber}). Thank you for your generosity.
              </p>
            </Reveal>
          ) : null}
        </div>
      </section>
    </>
  )
}
