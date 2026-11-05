import type { Metadata } from 'next'
import Link from 'next/link'

import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { CalendarLinks } from '@/components/site/CalendarLinks'
import { Icon } from '@/components/site/Icon'
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
      <PageHero eyebrow="Come as you are" title="Services & Events" intro="Join us for worship, prayer and fellowship throughout the week at 33 Bexley Road, Erith. All times are UK time." className="band">
        <div className="mt-lg">
          <Reveal>
            <span className="eyebrow eyebrow--light">Every week</span>
            <h2 style={{ marginBottom: 32 }}>Weekly <em className="grad-text-light">timetable</em></h2>
          </Reveal>
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
      </PageHero>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Mark your calendar" title={<>Special <em className="grad-text">events</em></>} />
          {events.length ? (
            <Stagger className="event-list">
              {events.map((e) => (
                <StaggerItem key={e.id} className="event-row">
                  <div className="date-block">
                    <strong>{formatDate(e.startDate, { day: 'numeric' })}</strong>
                    <small>{formatDate(e.startDate, { month: 'short', year: 'numeric' })}</small>
                  </div>
                  <div>
                    <div className="event-row__meta">
                      <span><Icon name="clock" size={14} />{formatDate(e.startDate, { weekday: 'long' })} · {formatTimeOfDate(e.startDate)}</span>
                      {e.venue ? <span><Icon name="pin" size={14} />{e.venue}</span> : null}
                    </div>
                    <h3><Link href={`/events/${e.slug}`}>{e.title}</Link></h3>
                    {e.summary ? <p>{e.summary}</p> : null}
                  </div>
                  <div className="event-row__actions">
                    <CalendarLinks event={e} compact />
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <Reveal className="empty">
              <h3>No special events just now</h3>
              <p>Our weekly services continue as usual. Check back soon for programmes, anniversaries and celebrations.</p>
            </Reveal>
          )}
        </div>
      </section>
    </>
  )
}
