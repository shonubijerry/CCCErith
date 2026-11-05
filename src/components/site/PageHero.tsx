import Link from 'next/link'
import type { ReactNode } from 'react'

import { Reveal } from '@/components/motion/Reveal'
import { WordReveal } from '@/components/motion/WordReveal'
import type { MediaLike } from '@/lib/media'

import { Curve } from './Curve'
import { MediaImage } from './MediaImage'

/** Deep purple page header with a red glow, an optional faint photo, and a word-by-word title. */
export function PageHero({
  title,
  intro,
  eyebrow,
  image,
  crumbs = [],
  children,
  className = '',
  curve = true,
}: {
  title: string
  intro?: string | null
  eyebrow?: string
  image?: MediaLike
  crumbs?: { label: string; href: string }[]
  children?: ReactNode
  className?: string
  curve?: boolean
}) {
  const hasImage = Boolean(image && typeof image === 'object')
  return (
    <section className={`page-hero ${className}`}>
      {hasImage ? (
        <div className="page-hero__bg">
          <MediaImage media={image} priority sizes="100vw" />
        </div>
      ) : null}
      <div className="page-hero__rings" aria-hidden="true" />
      <div className="container">
        <Reveal>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            {crumbs.map((c) => (
              <span key={c.href} style={{ display: 'contents' }}>
                <span aria-hidden="true">/</span>
                <Link href={c.href}>{c.label}</Link>
              </span>
            ))}
            <span aria-hidden="true">/</span>
            <span aria-current="page">{title}</span>
          </nav>
          {eyebrow ? <span className="eyebrow eyebrow--light">{eyebrow}</span> : null}
        </Reveal>
        <WordReveal text={title} accentLast light />
        {intro ? (
          <Reveal delay={0.25}>
            <p>{intro}</p>
          </Reveal>
        ) : null}
        {children}
      </div>
      {curve ? <Curve position="bottom" color="#fff" /> : null}
    </section>
  )
}
