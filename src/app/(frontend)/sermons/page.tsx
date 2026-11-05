import type { Metadata } from 'next'
import Link from 'next/link'

import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { SermonCard } from '@/components/site/Cards'
import { Icon } from '@/components/site/Icon'
import { PageHero } from '@/components/site/PageHero'
import { getSermons, getSiteSettings } from '@/lib/payload'

export const metadata: Metadata = { title: 'Sermons', description: 'Watch recent sermons and messages from CCC Erith Parish.' }

type Props = { searchParams: Promise<{ page?: string }> }

export default async function SermonsPage({ searchParams }: Props) {
  const page = Math.max(1, Number((await searchParams).page) || 1)
  const [sermons, settings] = await Promise.all([getSermons({ page, limit: 9 }), getSiteSettings()])

  return (
    <>
      <PageHero eyebrow="The Word" title="Sermons" intro="Messages of faith, hope and holiness. Watch again, share with a friend, and grow in the Word.">
        {settings.youtube ? (
          <div style={{ marginTop: 28 }}>
            <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="btn btn--purple">
              <Icon name="youtube" /> Our YouTube channel
            </a>
          </div>
        ) : null}
      </PageHero>
      <section className="section">
        <div className="container">
          {sermons.docs.length ? (
            <>
              <Stagger className="grid grid--3">
                {sermons.docs.map((s) => (
                  <StaggerItem key={s.id}>
                    <SermonCard sermon={s} />
                  </StaggerItem>
                ))}
              </Stagger>
              {sermons.totalPages > 1 ? (
                <nav className="pagination" aria-label="Sermon pages">
                  {Array.from({ length: sermons.totalPages }, (_, i) => i + 1).map((n) =>
                    n === page ? (
                      <span key={n} aria-current="page">{n}</span>
                    ) : (
                      <Link key={n} href={n === 1 ? '/sermons' : `/sermons?page=${n}`}>{n}</Link>
                    ),
                  )}
                </nav>
              ) : null}
            </>
          ) : (
            <div className="empty">
              <h3>Sermons coming soon</h3>
              <p>Recordings of our services will appear here.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
