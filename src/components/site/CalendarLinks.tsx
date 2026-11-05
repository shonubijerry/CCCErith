import { googleCalendarUrl } from '@/lib/calendar'
import type { Event } from '@/payload-types'

import { Icon } from './Icon'

const SITE = process.env.NEXT_PUBLIC_SERVER_URL || 'https://cccerithparish.co.uk'

export function CalendarLinks({ event, compact }: { event: Event; compact?: boolean }) {
  return (
    <div className="cal-links">
      <a href={`/events/${event.slug}/ics`} className={`btn btn--sm ${compact ? 'btn--outline' : 'btn--purple'}`} download>
        <Icon name="calendar" size={15} /> Add to calendar
      </a>
      <a href={googleCalendarUrl(event, SITE)} className="btn btn--sm btn--outline" target="_blank" rel="noopener noreferrer">
        Google Calendar
      </a>
    </div>
  )
}
