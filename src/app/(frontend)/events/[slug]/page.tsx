import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Reveal } from '@/components/motion/Reveal'
import { Icon } from '@/components/site/Icon'
import { PageHero } from '@/components/site/PageHero'
import { RichText } from '@/components/site/RichText'
import { formatDate, formatTimeOfDate } from '@/lib/format'
import { findBySlug } from '@/lib/payload'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = await findBySlug('events', (await params).slug)
  return e ? { title: e.title, description: e.summary ?? undefined } : {}
}

export default async function EventPage({ params }: Props) {
  const event = await findBySlug('events', (await params).slug)
  if (!event) notFound()
  const sameDay = event.endDate && formatDate(event.endDate) === formatDate(event.startDate)

  return (
    <>
      <PageHero eyebrow="Special event" title={event.title} intro={event.summary} image={event.image} crumbs={[{ label: 'Events', href: '/events' }]} />
      <section className="section">
        <div className="container detail">
          <Reveal>
            {event.description ? <RichText data={event.description} /> : <p className="lead">{event.summary}</p>}
          </Reveal>
          <Reveal direction="right" className="detail__aside">
            <div className="panel">
              <h3>Details</h3>
              <dl>
                <div>
                  <dt>Date</dt>
                  <dd>
                    {formatDate(event.startDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    {event.endDate && !sameDay ? ` – ${formatDate(event.endDate, { weekday: 'long', day: 'numeric', month: 'long' })}` : ''}
                  </dd>
                </div>
                <div>
                  <dt>Time</dt>
                  <dd>
                    {formatTimeOfDate(event.startDate)}
                    {event.endDate ? ` – ${formatTimeOfDate(event.endDate)}` : ''}
                  </dd>
                </div>
                {event.venue ? (
                  <div>
                    <dt>Venue</dt>
                    <dd>{event.venue}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
            <Link href="/events" className="text-link"><Icon name="arrow" size={15} style={{ transform: 'rotate(180deg)' }} /> All services &amp; events</Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
