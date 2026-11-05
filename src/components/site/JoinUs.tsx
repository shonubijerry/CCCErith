import Link from 'next/link'

import { Reveal } from '@/components/motion/Reveal'
import { WordReveal } from '@/components/motion/WordReveal'

import { Icon } from './Icon'

export function JoinUs() {
  return (
    <section className="section">
      <div className="container">
        <Reveal className="give-banner">
          <span className="eyebrow eyebrow--light">New here?</span>
          <WordReveal as="h2" text="Join us this Sunday" accentLast light />
          <p>Come as you are. Worship with us at 33 Bexley Road, Erith — we would love to welcome you and your family.</p>
          <div className="give-banner__actions">
            <Link href="/events" className="btn btn--white">Service times <Icon name="arrow" /></Link>
            <Link href="/contact" className="btn btn--ghost-light">Plan your visit</Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
