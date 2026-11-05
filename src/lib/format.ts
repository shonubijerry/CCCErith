const TZ = 'Europe/London'

export const formatDate = (iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  iso ? new Intl.DateTimeFormat('en-GB', { timeZone: TZ, ...opts }).format(new Date(iso)) : ''

export const formatTimeOfDate = (iso: string | null | undefined) =>
  iso ? new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso)).replace(':00', '').replace(' ', '') : ''

/** "19:00" -> "7pm", "09:30" -> "9:30am" */
export const formatClock = (hhmm: string | null | undefined) => {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 === 0 ? 12 : h % 12
  return m ? `${hour}:${String(m).padStart(2, '0')}${suffix}` : `${hour}${suffix}`
}

export const timeRange = (start?: string | null, end?: string | null) =>
  [formatClock(start), formatClock(end)].filter(Boolean).join(' – ')

export const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const youtubeId = (url: string | null | undefined) => {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/)
  return m ? m[1] : null
}
