import { icsFor } from '@/lib/calendar'
import { findBySlug } from '@/lib/payload'

const SITE = process.env.NEXT_PUBLIC_SERVER_URL || 'https://cccerithparish.co.uk'

/** "Add to calendar" download (Apple Calendar, Outlook, etc.). */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await findBySlug('events', slug)
  if (!event) return new Response('Not found', { status: 404 })
  return new Response(icsFor(event, SITE), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slug}.ics"`,
    },
  })
}
