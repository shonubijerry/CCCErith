import type { Event } from '@/payload-types'

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (c) => `\\${c}`)

const endOf = (e: Event) => (e.endDate ? new Date(e.endDate) : new Date(new Date(e.startDate).getTime() + 2 * 3600 * 1000))

export function googleCalendarUrl(e: Event, siteUrl: string) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${stamp(new Date(e.startDate))}/${stamp(endOf(e))}`,
    details: `${e.summary ?? ''}\n\n${siteUrl}/events/${e.slug}`.trim(),
    location: e.venue ?? '33 Bexley Road, Erith, Kent DA8 1SH',
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

export function icsFor(e: Event, siteUrl: string) {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CCC Erith Parish//Website//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:event-${e.id}@cccerithparish.co.uk`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(new Date(e.startDate))}`,
    `DTEND:${stamp(endOf(e))}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(e.summary ?? '')}`,
    `LOCATION:${esc(e.venue ?? '33 Bexley Road, Erith, Kent DA8 1SH')}`,
    `URL:${siteUrl}/events/${e.slug}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}
