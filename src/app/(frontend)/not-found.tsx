import Link from 'next/link'

import { Icon } from '@/components/site/Icon'

export default function NotFound() {
  return (
    <section className="section" style={{ paddingTop: 'calc(var(--header-h) + 96px)', minHeight: '70vh' }}>
      <div className="container container--narrow center">
        <span className="eyebrow">Page not found</span>
        <h1>We couldn’t find that page</h1>
        <p className="lead">It may have moved when we updated our website.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
          <Link href="/" className="btn">Back to home <Icon name="arrow" /></Link>
          <Link href="/contact" className="btn btn--outline">Contact us</Link>
        </div>
      </div>
    </section>
  )
}
