/** Menu data as the site uses it, built from the Navigation global (or the defaults below). */
export type NavLink = { label: string; href: string; newTab?: boolean }
export type NavItem = { label: string; href?: string; newTab?: boolean; children?: NavLink[] }
export type FooterColumn = { heading: string; links: NavLink[] }

/** A link as stored in Payload. `page` is a populated page, or just its id at depth 0. */
export type RawLink = {
  label?: string | null
  linkType?: 'url' | 'page' | 'none' | null
  url?: string | null
  page?: number | { slug?: string | null } | null
  newTab?: boolean | null
}
export type RawNavItem = RawLink & { children?: RawLink[] | null }
export type RawFooterColumn = { heading?: string | null; links?: RawLink[] | null }

/** Turns a stored link into a usable one, or null when it has no label or nowhere valid to go. */
export function resolveLink(raw: RawLink): NavLink | null {
  const label = raw.label?.trim()
  if (!label) return null
  let href: string | undefined
  if (raw.linkType === 'page') {
    const slug = typeof raw.page === 'object' ? raw.page?.slug : undefined
    href = slug ? `/${slug}` : undefined
  } else if (raw.linkType === 'url' || !raw.linkType) {
    href = raw.url?.trim() || undefined
  }
  return href ? { label, href, ...(raw.newTab ? { newTab: true } : {}) } : null
}

export function resolveHeader(items: RawNavItem[] | null | undefined): NavItem[] {
  if (!items?.length) return DEFAULT_HEADER
  return items.flatMap((item) => {
    const label = item.label?.trim()
    if (!label) return []
    const children = (item.children ?? []).map(resolveLink).filter((c): c is NavLink => c !== null)
    const self = item.linkType === 'none' ? null : resolveLink(item)
    // Nothing to click and nothing to open: hide it.
    if (!self && !children.length) return []
    return [{ label, ...(self ? { href: self.href, ...(self.newTab ? { newTab: true } : {}) } : {}), ...(children.length ? { children } : {}) }]
  })
}

export function resolveFooter(columns: RawFooterColumn[] | null | undefined): FooterColumn[] {
  if (!columns?.length) return DEFAULT_FOOTER
  return columns.flatMap((col) => {
    const heading = col.heading?.trim()
    const links = (col.links ?? []).map(resolveLink).filter((l): l is NavLink => l !== null)
    return heading && links.length ? [{ heading, links }] : []
  })
}

/** Links to anywhere other than a path on this site get a plain <a>. */
export const isExternal = (href: string) => !href.startsWith('/')

export const DEFAULT_HEADER: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about-us',
    children: [
      { label: 'About Us', href: '/about-us' },
      { label: 'Our Team', href: '/our-team' },
      { label: 'Community Service', href: '/community-service' },
      { label: 'Safeguarding', href: '/safeguarding-policy' },
    ],
  },
  { label: 'Ministries', href: '/ministries' },
  { label: 'Services & Events', href: '/events' },
  { label: 'Sermons', href: '/sermons' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
]

export const DEFAULT_FOOTER: FooterColumn[] = [
  {
    heading: 'Explore',
    links: [
      { label: 'About Us', href: '/about-us' },
      { label: 'Our Team', href: '/our-team' },
      { label: 'Ministries', href: '/ministries' },
      { label: 'Services & Events', href: '/events' },
      { label: 'Sermons', href: '/sermons' },
      { label: 'Gallery', href: '/gallery' },
    ],
  },
  {
    heading: 'Church',
    links: [
      { label: 'Give', href: '/give' },
      { label: 'Community Service', href: '/community-service' },
      { label: 'Safeguarding', href: '/safeguarding-policy' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Cookie Policy', href: '/cookie-policy' },
    ],
  },
]

/** The defaults in the shape Payload stores, for seeding the Navigation global. */
const toRaw = (l: NavLink) => ({ label: l.label, linkType: 'url' as const, url: l.href, newTab: Boolean(l.newTab) })
export const DEFAULT_NAVIGATION_DATA = {
  headerItems: DEFAULT_HEADER.map((item) => ({
    ...(item.href ? toRaw({ label: item.label, href: item.href }) : { label: item.label, linkType: 'none' as const }),
    children: (item.children ?? []).map(toRaw),
  })),
  footerColumns: DEFAULT_FOOTER.map((col) => ({ heading: col.heading, links: col.links.map(toRaw) })),
}
