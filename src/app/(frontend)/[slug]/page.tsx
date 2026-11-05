import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Parallax } from '@/components/motion/Parallax'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { Icon } from '@/components/site/Icon'
import { MediaImage } from '@/components/site/MediaImage'
import { PageHero } from '@/components/site/PageHero'
import { RichText } from '@/components/site/RichText'
import { SectionHead } from '@/components/site/SectionHead'
import { asMedia } from '@/lib/media'
import { getPageBySlug } from '@/lib/payload'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPageBySlug((await params).slug)
  if (!page) return {}
  return { title: page.title, description: page.intro ?? undefined }
}

export default async function GenericPage({ params }: Props) {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) notFound()

  const photos = (page.gallery ?? []).map(asMedia).filter(Boolean)
  const highlights = page.highlights?.items ?? []
  const isPolicy = /policy/.test(slug)

  return (
    <>
      <PageHero title={page.title} intro={page.intro} image={page.heroImage} />

      <section className="section">
        <div className={`container${photos.length ? '' : ' container--narrow'}`}>
          {photos.length ? (
            <div className="split">
              <Reveal>
                <RichText data={page.content} />
              </Reveal>
              <Reveal direction="right">
                <Parallax className="split__media" distance={40}>
                  <MediaImage media={photos[0]} sizes="(max-width: 900px) 100vw, 50vw" />
                </Parallax>
              </Reveal>
            </div>
          ) : (
            <Reveal>
              <RichText data={page.content} />
            </Reveal>
          )}
        </div>
      </section>

      {highlights.length ? (
        <section className="section section--soft">
          <div className="container">
            <SectionHead center eyebrow="What guides us" title={page.highlights?.heading ?? ''} />
            <Stagger className="highlights">
              {highlights.map((h, i) => (
                <StaggerItem key={h.id} className="highlight">
                  <span className="highlight__num">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{h.title}</h3>
                  {h.text ? <p>{h.text}</p> : null}
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {photos.length > 1 ? (
        <section className="section">
          <div className="container">
            <Stagger className="grid grid--3">
              {photos.slice(1, 4).map((p) => (
                <StaggerItem key={p!.id}>
                  <Parallax className="split__media" distance={30}>
                    <MediaImage media={p} sizes="(max-width: 700px) 100vw, 33vw" />
                  </Parallax>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {!isPolicy ? (
        <section className="section section--tight">
          <div className="container">
            <Reveal className="give-banner">
              <span className="eyebrow eyebrow--light">New here?</span>
              <h2>Join us this Sunday</h2>
              <p>Come as you are. Worship with us at 33 Bexley Road, Erith — we would love to welcome you and your family.</p>
              <div className="give-banner__actions">
                <Link href="/events" className="btn">Service times <Icon name="arrow" /></Link>
                <Link href="/contact" className="btn btn--ghost-light">Plan your visit</Link>
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}
    </>
  )
}
