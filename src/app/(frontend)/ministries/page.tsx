import type { Metadata } from 'next'

import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { MinistryTile } from '@/components/site/Cards'
import { PageHero } from '@/components/site/PageHero'
import { getMinistries } from '@/lib/payload'

export const metadata: Metadata = { title: 'Our Ministries', description: 'Find your place to serve, grow and belong at CCC Erith Parish.' }

export default async function MinistriesPage() {
  const ministries = await getMinistries()
  return (
    <>
      <PageHero eyebrow="Serve · Grow · Belong" title="Our Ministries" intro="Every member has a gift. Discover the ministries that carry the life and mission of our parish — and find where you belong." />
      <section className="section">
        <div className="container">
          <Stagger className="grid grid--3">
            {ministries.map((m) => (
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
