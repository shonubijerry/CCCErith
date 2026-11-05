'use client'

import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Icon } from './Icon'
import { NAV } from './nav'

const isActive = (pathname: string, href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/'))

export function Header({ email, phone }: { email?: string | null; phone?: string | null }) {
  const pathname = usePathname()
  const overHero = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  // The menu belongs to the page it was opened on, so navigating closes it automatically.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const setOpen = (value: boolean | ((o: boolean) => boolean)) =>
    setOpenOn(typeof value === 'function' ? (value(open) ? pathname : null) : value ? pathname : null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenOn(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const cls = ['header', overHero && 'header--over-hero', scrolled && 'header--scrolled'].filter(Boolean).join(' ')

  return (
    <>
      <header className={cls}>
        <div className="container header__inner">
          <Link href="/" className="header__brand" aria-label="CCC Erith Parish home">
            <span className="header__logo-wrap">
              <Image src="/brand/logo.webp" alt="Celestial Church of Christ Erith Parish" width={320} height={145} className="header__logo" priority unoptimized />
            </span>
          </Link>

          <nav className="nav" aria-label="Main">
            {NAV.map((item) =>
              item.children ? (
                <div className="nav__item" key={item.href}>
                  <Link href={item.href} className="nav__trigger" data-active={item.children.some((c) => isActive(pathname, c.href))}>
                    {item.label}
                    <Icon name="chevron" size={14} />
                  </Link>
                  <div className="nav__dropdown">
                    {item.children.map((c) => (
                      <Link key={c.href} href={c.href} aria-current={isActive(pathname, c.href) ? 'page' : undefined}>
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={item.href} href={item.href} className="nav__link" aria-current={isActive(pathname, item.href) ? 'page' : undefined}>
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="header__actions">
            <Link href="/give" className="btn btn--sm">
              <Icon name="heart" size={16} /> Give
            </Link>
            <button className="menu-toggle" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
              <span />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="mobile-menu"
            initial={{ clipPath: 'circle(0% at calc(100% - 44px) 42px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 44px) 42px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 44px) 42px)' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <button className="menu-toggle header__close" aria-expanded="true" aria-label="Close menu" onClick={() => setOpen(false)} style={{ display: 'inline-flex' }}>
              <span />
            </button>
            <ul className="mobile-menu__list">
              {[...NAV, { label: 'Give', href: '/give' }].map((item, i) => (
                <motion.li key={item.href + item.label} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.5 }}>
                  <Link href={item.href} aria-current={isActive(pathname, item.href) ? 'page' : undefined}>
                    {item.label}
                  </Link>
                  {'children' in item && item.children ? (
                    <div className="mobile-menu__sub">
                      {item.children.slice(1).map((c) => (
                        <Link key={c.href} href={c.href}>
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </motion.li>
              ))}
            </ul>
            <div className="mobile-menu__footer">
              {email ? <div>{email}</div> : null}
              {phone ? <div>{phone}</div> : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
