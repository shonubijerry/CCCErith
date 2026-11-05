import type { Metadata } from 'next'
import Link from 'next/link'

import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { MediaImage } from '@/components/site/MediaImage'
import { PageHero } from '@/components/site/PageHero'
import { formatDate } from '@/lib/format'
import { getAlbums } from '@/lib/payload'

export const metadata: Metadata = { title: 'Gallery', description: 'Photos from worship, celebrations and parish life at CCC Erith Parish.' }

export default async function GalleryPage() {
  const albums = await getAlbums()
  return (
    <>
      <PageHero eyebrow="Parish life" title="Gallery" intro="Moments of worship, celebration and fellowship from our church family." />
      <section className="section">
        <div className="container">
          {albums.length ? (
            <Stagger className="grid grid--3">
              {albums.map((a) => {
                const cover = a.cover ?? a.photos?.[0]
                return (
                  <StaggerItem key={a.id}>
                    <article className="card album-card">
                      <div className="card__media">
                        <MediaImage media={cover} sizes="(max-width: 700px) 100vw, 33vw" />
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
                  </StaggerItem>
                )
              })}
            </Stagger>
          ) : (
            <div className="empty"><h3>Albums coming soon</h3></div>
          )}
        </div>
      </section>
    </>
  )
}
