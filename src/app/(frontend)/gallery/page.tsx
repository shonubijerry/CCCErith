import type { Metadata } from 'next'
import Link from 'next/link'

import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { Tilt } from '@/components/motion/Tilt'
import { MediaImage } from '@/components/site/MediaImage'
import { PageHero } from '@/components/site/PageHero'
import { YearChips } from '@/components/site/YearChips'
import { formatDate } from '@/lib/format'
import { getAlbums, getYears } from '@/lib/payload'

export const metadata: Metadata = { title: 'Gallery', description: 'Photos from worship, celebrations and parish life at CCC Erith Parish.' }

type Props = { searchParams: Promise<{ year?: string }> }

export default async function GalleryPage({ searchParams }: Props) {
  const year = Number((await searchParams).year) || undefined
  const [albums, years] = await Promise.all([getAlbums(year), getYears('albums')])
  return (
    <>
      <PageHero eyebrow="Parish life" title="Gallery" intro="Moments of worship, celebration and fellowship from our church family." />
      <section className="section">
        <div className="container">
          <div className="filters">
            <YearChips base="/gallery" years={years} current={year} />
          </div>
          {albums.length ? (
            <Stagger className="magazine">
              {albums.map((a) => {
                const cover = a.cover ?? a.photos?.[0]
                return (
                  <StaggerItem key={a.id}>
                    <Tilt className="tilt" max={4}>
                      <article className="card album-card">
                        <div className="card__media card__media--tint">
                          <MediaImage media={cover} sizes="(max-width: 900px) 100vw, 60vw" />
                          <span className="album-card__count">{a.photos?.length ?? 0} photos</span>
                        </div>
                        <div className="card__body">
                          <span className="card__kicker">{formatDate(a.date, { month: 'long', year: 'numeric' })}</span>
                          <h3 className="card__title">
                            <Link href={`/gallery/${a.slug}`} className="card__link">{a.title}</Link>
                          </h3>
                          {a.description ? <p className="card__text">{a.description}</p> : null}
                        </div>
                      </article>
                    </Tilt>
                  </StaggerItem>
                )
              })}
            </Stagger>
          ) : (
            <div className="empty"><h3>No albums for this year</h3></div>
          )}
        </div>
      </section>
    </>
  )
}
