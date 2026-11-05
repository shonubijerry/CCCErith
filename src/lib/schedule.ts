import type { Event, WeeklyService } from '@/payload-types'

const DAY_INDEX: Record<string, number> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 }

/** Current date/time parts in UK time, regardless of where the server runs. */
export function londonNow(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long',
      hour12: false,
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  )
  return {
    y: Number(parts.year),
    m: Number(parts.month),
    d: Number(parts.day),
    hhmm: `${parts.hour}:${parts.minute}`,
    weekday: String(parts.weekday).toLowerCase(),
  }
}

export type Occurrence = {
  key: string
  title: string
  /** Calendar date in UK time, as a UTC-midnight Date (safe for display with timeZone: 'UTC'). */
  date: Date
  start?: string | null
  end?: string | null
  allDay?: boolean | null
  href?: string
  special?: boolean
}

/** The next `limit` meetings, mixing the weekly timetable with one-off events. */
export function nextOccurrences(services: WeeklyService[], events: Event[], limit = 5): Occurrence[] {
  const now = londonNow()
  const todayIdx = DAY_INDEX[now.weekday]
  const today = Date.UTC(now.y, now.m - 1, now.d)
  const out: Occurrence[] = []

  for (let offset = 0; offset < 14; offset++) {
    const dayIdx = (todayIdx + offset) % 7
    for (const s of services) {
      if (DAY_INDEX[s.day] !== dayIdx) continue
      if (offset === 0 && !s.allDay && (s.endTime || s.startTime || '00:00') < now.hhmm) continue
      out.push({
        key: `${s.id}-${offset}`,
        title: s.title,
        date: new Date(today + offset * 86400000),
        start: s.startTime,
        end: s.endTime,
        allDay: s.allDay,
      })
    }
  }

  for (const e of events) {
    const d = new Date(e.startDate)
    const p = londonNow(d)
    out.push({
      key: `event-${e.id}`,
      title: e.title,
      date: new Date(Date.UTC(p.y, p.m - 1, p.d)),
      start: p.hhmm,
      href: `/events/${e.slug}`,
      special: true,
    })
  }

  return out
    .sort((a, b) => a.date.getTime() - b.date.getTime() || (a.allDay ? '00:00' : a.start || '').localeCompare(b.allDay ? '00:00' : b.start || ''))
    .slice(0, limit)
}
