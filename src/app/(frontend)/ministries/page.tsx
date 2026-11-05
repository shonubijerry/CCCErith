import type { Metadata } from 'next'
import Link from 'next/link'

import { ImageReveal } from '@/components/motion/ImageReveal'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { MinistryTile } from '@/components/site/Cards'
import { Icon } from '@/components/site/Icon'
import { MediaImage } from '@/components/site/MediaImage'
import { PageHero } from '@/components/site/PageHero'
import { getMinistries } from '@/lib/payload'

export const metadata: Metadata = { title: 'Our Ministries', description: 'Find your place to serve, grow and belong at CCC Erith Parish.' }

export default async function MinistriesPage() {
  const ministries = await getMinistries()
  const [first, ...rest] = ministries
  return (
    <>
      <PageHero eyebrow="Serve · Grow · Belong" title="Our Ministries" intro="Every member has a gift. Discover the ministries that carry the life and mission of our parish — and find where you belong." />
      <section className="section">
        <div className="container">
          {first ? (
            <Reveal className="feature-card">
              <ImageReveal className="feature-card__media" from="left">
                <MediaImage media={first.image} sizes="(max-width: 860px) 100vw, 55vw" priority />
              </ImageReveal>
              <div className="feature-card__body">
                <span className="eyebrow eyebrow--light">Featured ministry</span>
                <h2>{first.title}</h2>
                <p>{first.excerpt}</p>
                <div>
                  <Link href={`/ministries/${first.slug}`} className="btn btn--white">Learn more <Icon name="arrow" /></Link>
                </div>
              </div>
            </Reveal>
          ) : null}
          <Stagger className="ministry-grid">
            {rest.map((m) => (
              <StaggerItem key={m.id}>
                <MinistryTile ministry={m} sizes="(max-width: 700px) 100vw, 33vw" />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  )
}
