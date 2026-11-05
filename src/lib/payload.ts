import 'server-only'

import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import { resolveFooter, resolveHeader, type RawFooterColumn, type RawNavItem } from '@/components/site/nav'

export const getPayloadClient = cache(async () => getPayload({ config }))

export const getSiteSettings = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', depth: 0 })
})

export const getNavigation = cache(async () => {
  const payload = await getPayloadClient()
  // depth 1 fills in linked pages so their slugs are available.
  const nav = await payload.findGlobal({ slug: 'navigation', depth: 1 })
  return { header: resolveHeader(nav.headerItems as RawNavItem[]), footer: resolveFooter(nav.footerColumns as RawFooterColumn[]) }
})

export const getHomePage = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'home-page', depth: 1 })
})

export const getAboutPage = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'about-page', depth: 1 })
})

export const getCommunityPage = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'community-page', depth: 1 })
})

export const getPageBySlug = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 1 })
  return res.docs[0] ?? null
})

export const getWeeklyServices = cache(async () => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'weekly-services', limit: 100, depth: 0, pagination: false })
  return sortServices(res.docs)
})

export const getUpcomingEvents = cache(async (limit = 50) => {
  const payload = await getPayloadClient()
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const res = await payload.find({
    collection: 'events',
    where: {
      or: [
        { startDate: { greater_than_equal: startOfToday.toISOString() } },
        { endDate: { greater_than_equal: startOfToday.toISOString() } },
      ],
    },
    sort: 'startDate',
    limit,
    depth: 1,
  })
  return res.docs
})

export const getMinistries = cache(async () => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'ministries', sort: '_order', limit: 100, depth: 1, pagination: false })
  return res.docs
})

const yearRange = (year?: number) =>
  year ? [{ date: { greater_than_equal: `${year}-01-01T00:00:00.000Z` } }, { date: { less_than: `${year + 1}-01-01T00:00:00.000Z` } }] : []

export const getSermons = cache(async ({ page = 1, limit = 12, q, year }: { page?: number; limit?: number; q?: string; year?: number } = {}) => {
  const payload = await getPayloadClient()
  const and: Where[] = [...yearRange(year)]
  if (q) and.push({ or: [{ title: { like: q } }, { preacher: { like: q } }, { passage: { like: q } }] })
  return payload.find({ collection: 'sermons', sort: '-date', page, limit, depth: 0, where: and.length ? { and } : undefined })
})

/** Years that have at least one item, newest first (for filter chips). */
export const getYears = cache(async (collection: 'sermons' | 'albums') => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection, limit: 2000, pagination: false, depth: 0, select: { date: true } })
  return [...new Set(res.docs.map((d) => new Date(d.date).getUTCFullYear()))].sort((a, b) => b - a)
})

export const getFeaturedSermons = cache(async () => {
  const payload = await getPayloadClient()
  const featured = await payload.find({ collection: 'sermons', where: { featured: { equals: true } }, sort: '-date', limit: 3, depth: 0 })
  if (featured.docs.length) return featured.docs
  return (await payload.find({ collection: 'sermons', sort: '-date', limit: 3, depth: 0 })).docs
})

export const getAlbums = cache(async (year?: number) => {
  const payload = await getPayloadClient()
  const and = yearRange(year)
  const res = await payload.find({ collection: 'albums', sort: '-date', limit: 200, depth: 1, pagination: false, where: and.length ? { and } : undefined })
  return res.docs
})

export const getTeam = cache(async () => {
  const payload = await getPayloadClient()
  const [departments, members] = await Promise.all([
    payload.find({ collection: 'departments', sort: '_order', limit: 200, pagination: false, depth: 0 }),
    payload.find({ collection: 'team-members', sort: '_order', limit: 1000, pagination: false, depth: 1 }),
  ])
  return { departments: departments.docs, members: members.docs }
})

export const findBySlug = cache(async <T extends 'ministries' | 'events' | 'sermons' | 'albums'>(collection: T, slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 2 })
  return res.docs[0] ?? null
})

const DAY_ORDER = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export function sortServices<T extends { day: string; startTime?: string | null; allDay?: boolean | null }>(docs: T[]) {
  return [...docs].sort(
    (a, b) =>
      DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) ||
      (a.allDay ? '00:00' : a.startTime || '99').localeCompare(b.allDay ? '00:00' : b.startTime || '99'),
  )
}
