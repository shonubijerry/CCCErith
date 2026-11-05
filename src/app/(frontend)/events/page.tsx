import type { Metadata } from 'next'
import Link from 'next/link'

import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { Icon } from '@/components/site/Icon'
import { MediaImage } from '@/components/site/MediaImage'
import { PageHero } from '@/components/site/PageHero'
import { SectionHead } from '@/components/site/SectionHead'
import { capitalise, formatDate, formatTimeOfDate, timeRange } from '@/lib/format'
import { getUpcomingEvents, getWeeklyServices } from '@/lib/payload'
import { londonNow } from '@/lib/schedule'

export const metadata: Metadata = { title: 'Services & Events', description: 'Weekly service times and upcoming special events at CCC Erith Parish.' }

const WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export default async function EventsPage() {
  const [services, events] = await Promise.all([getWeeklyServices(), getUpcomingEvents()])
  const today = londonNow().weekday
  const days = WEEK.map((day) => ({ day, items: services.filter((s) => s.day === day) })).filter((d) => d.items.length)

  return (
    <>
      <PageHero eyebrow="Come as you are" title="Services & Events" intro="Join us for worship, prayer and fellowship throughout the week at 33 Bexley Road, Erith. All times are UK time." />

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Every week" title="Weekly timetable" />
          <Stagger className="schedule">
            {days.map(({ day, items }) => (
              <StaggerItem key={day} className={`schedule__day${day === today ? ' schedule__day--today' : ''}`}>
                <div className="schedule__dayname">
                  {capitalise(day)}
                  {day === today ? <span className="schedule__today">Today</span> : null}
                </div>
                {items.map((s) => (
                  <div key={s.id} className={`schedule__item${s.highlight ? ' schedule__item--highlight' : ''}`}>
                    <span className="schedule__title">{s.title}</span>
                    <span className="schedule__time">
                      <Icon name="clock" size={14} />
                      {s.allDay ? 'All day' : timeRange(s.startTime, s.endTime)}
                      {s.note ? ` · ${s.note}` : ''}
                    </span>
                  </div>
                ))}
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <SectionHead eyebrow="Mark your calendar" title="Special events" />
          {events.length ? (
            <Stagger className="grid grid--3">
              {events.map((e) => (
                <StaggerItem key={e.id}>
                  <article className="card">
                    <div className="card__media">
                      {e.image ? <MediaImage media={e.image} sizes="(max-width: 700px) 100vw, 33vw" /> : null}
                    </div>
                    <div className="card__body">
                      <span className="card__kicker">
                        {formatDate(e.startDate, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })} · {formatTimeOfDate(e.startDate)}
                      </span>
                      <h3 className="card__title">
                        <Link href={`/events/${e.slug}`} className="card__link">{e.title}</Link>
                      </h3>
                      {e.summary ? <p className="card__text">{e.summary}</p> : null}
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <div className="empty">
              <h3>No special events just now</h3>
              <p>Our weekly services continue as usual. Check back soon for programmes, anniversaries and celebrations.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
