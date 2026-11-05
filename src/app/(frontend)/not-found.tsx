import Link from 'next/link'

import { Icon } from '@/components/site/Icon'

export default function NotFound() {
  return (
    <section className="section" style={{ paddingTop: 'calc(var(--header-h) + 96px)', minHeight: '70vh' }}>
      <div className="container container--narrow center">
        <svg className="dove-float" viewBox="0 0 64 48" fill="none" aria-hidden="true">
          <path d="M4 30c8 1 14-1 19-6l3-11c1-4 6-6 9-4l4 2-5 3c3 7 1 15-5 20l-6 5c-5 4-11 6-17 6h-2l8-8c-4-1-7-4-8-7Z" fill="currentColor" opacity=".12" />
          <path d="M4 30c8 1 14-1 19-6l3-11c1-4 6-6 9-4l4 2-5 3c3 7 1 15-5 20l-6 5c-5 4-11 6-17 6h-2l8-8c-4-1-7-4-8-7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M26 16c6-9 18-13 34-12-6 6-14 10-24 12" stroke="#e80000" strokeWidth="2" strokeLinecap="round" />
          <circle cx="33" cy="11" r="1.4" fill="currentColor" />
        </svg>
        <span className="eyebrow">Page not found</span>
        <h1>We couldn’t find <em className="grad-text">that page</em></h1>
        <p className="lead">It may have moved when we updated our website.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
          <Link href="/" className="btn">Back to home <Icon name="arrow" /></Link>
          <Link href="/contact" className="btn btn--outline">Contact us</Link>
        </div>
      </div>
    </section>
  )
}
