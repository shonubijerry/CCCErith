import Link from 'next/link'
import type { ReactNode } from 'react'

import { Reveal } from '@/components/motion/Reveal'
import type { MediaLike } from '@/lib/media'

import { MediaImage } from './MediaImage'

export function PageHero({
  title,
  intro,
  eyebrow,
  image,
  crumbs = [],
  children,
}: {
  title: string
  intro?: string | null
  eyebrow?: string
  image?: MediaLike
  crumbs?: { label: string; href: string }[]
  children?: ReactNode
}) {
  const hasImage = Boolean(image && typeof image === 'object')
  return (
    <section className={`page-hero${hasImage ? ' page-hero--image' : ''}`}>
      {hasImage ? (
        <div className="page-hero__bg">
          <MediaImage media={image} priority sizes="100vw" />
        </div>
      ) : (
        <div className="page-hero__arc" aria-hidden="true" />
      )}
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
          {eyebrow ? <span className={`eyebrow${hasImage ? ' eyebrow--light' : ''}`}>{eyebrow}</span> : null}
          <h1>{title}</h1>
          {intro ? <p>{intro}</p> : null}
          {children}
        </Reveal>
      </div>
    </section>
  )
}
