import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Reveal } from '@/components/motion/Reveal'
import { Icon } from '@/components/site/Icon'
import { RichText } from '@/components/site/RichText'
import { YouTube } from '@/components/site/YouTube'
import { formatDate, youtubeId } from '@/lib/format'
import { findBySlug } from '@/lib/payload'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await findBySlug('sermons', (await params).slug)
  if (!s) return {}
  const id = youtubeId(s.youtubeUrl)
  return { title: s.title, description: s.summary ?? undefined, openGraph: id ? { images: [`https://i.ytimg.com/vi/${id}/hqdefault.jpg`] } : undefined }
}

export default async function SermonPage({ params }: Props) {
  const sermon = await findBySlug('sermons', (await params).slug)
  if (!sermon) notFound()
  const id = youtubeId(sermon.youtubeUrl)

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--header-h) + 56px)' }}>
      <div className="container container--narrow">
        <Reveal>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/sermons">Sermons</Link>
          </nav>
          <span className="eyebrow">Sermon</span>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>{sermon.title}</h1>
          <ul className="meta-list">
            <li><Icon name="calendar" /> {formatDate(sermon.date)}</li>
            {sermon.preacher ? <li><Icon name="user" /> {sermon.preacher}</li> : null}
            {sermon.passage ? <li><Icon name="book" /> {sermon.passage}</li> : null}
          </ul>
        </Reveal>
        <Reveal delay={0.1}>{id ? <YouTube id={id} title={sermon.title} /> : null}</Reveal>
        {sermon.summary || sermon.notes ? (
          <Reveal className="mt-lg">
            {sermon.summary ? <p className="lead">{sermon.summary}</p> : null}
            {sermon.notes ? <RichText data={sermon.notes} /> : null}
          </Reveal>
        ) : null}
        <div className="mt-lg">
          <Link href="/sermons" className="text-link"><Icon name="arrow" size={15} style={{ transform: 'rotate(180deg)' }} /> All sermons</Link>
        </div>
      </div>
    </section>
  )
}
