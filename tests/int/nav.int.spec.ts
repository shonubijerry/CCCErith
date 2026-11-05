// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { DEFAULT_FOOTER, DEFAULT_HEADER, DEFAULT_NAVIGATION_DATA, resolveFooter, resolveHeader, resolveLink } from '@/components/site/nav'
import { validateUrl } from '@/fields/link'

describe('resolveLink', () => {
  it('builds page links from the slug', () => {
    expect(resolveLink({ label: 'Safeguarding', linkType: 'page', page: { slug: 'safeguarding-policy' } })).toEqual({ label: 'Safeguarding', href: '/safeguarding-policy' })
  })
  it('drops page links whose page is gone or not populated', () => {
    expect(resolveLink({ label: 'Gone', linkType: 'page', page: null })).toBeNull()
    expect(resolveLink({ label: 'Id only', linkType: 'page', page: 4 })).toBeNull()
  })
  it('keeps custom URLs and the new-tab flag', () => {
    expect(resolveLink({ label: 'YouTube', linkType: 'url', url: ' https://youtube.com/x ', newTab: true })).toEqual({ label: 'YouTube', href: 'https://youtube.com/x', newTab: true })
  })
  it('drops links with no label or no URL', () => {
    expect(resolveLink({ label: ' ', linkType: 'url', url: '/a' })).toBeNull()
    expect(resolveLink({ label: 'Empty', linkType: 'url', url: '' })).toBeNull()
  })
})

describe('resolveHeader', () => {
  it('falls back to the default menu when nothing is saved', () => {
    expect(resolveHeader([])).toBe(DEFAULT_HEADER)
    expect(resolveHeader(null)).toBe(DEFAULT_HEADER)
  })
  it('supports dropdown parents with no link of their own', () => {
    expect(resolveHeader([{ label: 'About', linkType: 'none', children: [{ label: 'Team', linkType: 'url', url: '/our-team' }] }])).toEqual([
      { label: 'About', children: [{ label: 'Team', href: '/our-team' }] },
    ])
  })
  it('hides items with nothing to click and nothing to open', () => {
    const items = resolveHeader([
      { label: 'Empty parent', linkType: 'none', children: [{ label: 'Gone', linkType: 'page', page: null }] },
      { label: 'Home', linkType: 'url', url: '/' },
    ])
    expect(items).toEqual([{ label: 'Home', href: '/' }])
  })
})

describe('resolveFooter', () => {
  it('falls back to the default columns and drops empty ones', () => {
    expect(resolveFooter(undefined)).toBe(DEFAULT_FOOTER)
    expect(resolveFooter([{ heading: 'A', links: [] }, { heading: 'B', links: [{ label: 'Give', linkType: 'url', url: '/give' }] }])).toEqual([
      { heading: 'B', links: [{ label: 'Give', href: '/give' }] },
    ])
  })
})

describe('default seed data', () => {
  it('turns back into exactly the default menu', () => {
    expect(resolveHeader(DEFAULT_NAVIGATION_DATA.headerItems)).toEqual(DEFAULT_HEADER)
    expect(resolveFooter(DEFAULT_NAVIGATION_DATA.footerColumns)).toEqual(DEFAULT_FOOTER)
  })
})

describe('validateUrl', () => {
  it('accepts site paths, web, email and phone links', () => {
    for (const u of ['/sermons', 'https://x.com', 'http://x.com', 'mailto:a@b.c', 'tel:+44123']) expect(validateUrl(u, 'url')).toBe(true)
  })
  it('rejects typos and empty values, but only for custom URLs', () => {
    expect(validateUrl('sermons', 'url')).toMatch(/must start/)
    expect(validateUrl('', 'url')).toMatch(/Enter a link/)
    expect(validateUrl('', 'page')).toBe(true)
  })
})
