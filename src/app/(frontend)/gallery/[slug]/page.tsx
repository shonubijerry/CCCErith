import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Icon } from '@/components/site/Icon'
import { PageHero } from '@/components/site/PageHero'
import { PhotoGrid, type Photo } from '@/components/site/PhotoGrid'
import { formatDate } from '@/lib/format'
import { asMedia } from '@/lib/media'
import { findBySlug } from '@/lib/payload'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await findBySlug('albums', (await params).slug)
  return a ? { title: a.title, description: a.description ?? undefined } : {}
}

export default async function AlbumPage({ params }: Props) {
  const album = await findBySlug('albums', (await params).slug)
  if (!album) notFound()
  const photos: Photo[] = (album.photos ?? [])
    .map(asMedia)
    .filter((m): m is NonNullable<typeof m> => Boolean(m?.url))
    .map((m) => ({ id: m.id, src: m.url!, alt: m.alt ?? '', width: m.width ?? 1600, height: m.height ?? 1067 }))

  return (
    <>
      <PageHero
        eyebrow={formatDate(album.date, { day: 'numeric', month: 'long', year: 'numeric' })}
        title={album.title}
        intro={album.description}
        crumbs={[{ label: 'Gallery', href: '/gallery' }]}
      />
      <section className="section">
        <div className="container">
          <PhotoGrid photos={photos} />
          <div className="mt-lg center">
            <Link href="/gallery" className="btn btn--outline"><Icon name="arrow" style={{ transform: 'rotate(180deg)' }} /> All albums</Link>
          </div>
        </div>
      </section>
    </>
  )
}
