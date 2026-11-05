import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Reveal } from '@/components/motion/Reveal'
import { MinistryTile } from '@/components/site/Cards'
import { Icon } from '@/components/site/Icon'
import { PageHero } from '@/components/site/PageHero'
import { RichText } from '@/components/site/RichText'
import { SectionHead } from '@/components/site/SectionHead'
import { findBySlug, getMinistries } from '@/lib/payload'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = await findBySlug('ministries', (await params).slug)
  return m ? { title: m.title, description: m.excerpt } : {}
}

export default async function MinistryPage({ params }: Props) {
  const { slug } = await params
  const [ministry, all] = await Promise.all([findBySlug('ministries', slug), getMinistries()])
  if (!ministry) notFound()
  const others = all.filter((m) => m.id !== ministry.id).slice(0, 3)

  return (
    <>
      <PageHero title={ministry.title} intro={ministry.excerpt} image={ministry.image} crumbs={[{ label: 'Ministries', href: '/ministries' }]} />
      <section className="section">
        <div className="container detail">
          <Reveal>
            {ministry.body ? <RichText data={ministry.body} /> : <p className="lead">{ministry.excerpt}</p>}
          </Reveal>
          <Reveal direction="right" className="detail__aside">
            {ministry.meetingTimes?.length ? (
              <div className="panel">
                <h3>Meeting times</h3>
                <dl>
                  {ministry.meetingTimes.map((t) => (
                    <div key={t.id}>
                      <dt>{t.label}</dt>
                      {t.when ? <dd>{t.when}</dd> : null}
                    </div>
                  ))}
                  {ministry.location ? (
                    <div>
                      <dt>Location</dt>
                      <dd>{ministry.location}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            ) : null}
            <div className="panel panel--purple">
              <h3>Want to get involved?</h3>
              <p>Speak to us after service or send us a message and we will connect you with the ministry leaders.</p>
              <Link href="/contact" className="btn btn--sm">Get in touch <Icon name="arrow" size={16} /></Link>
            </div>
          </Reveal>
        </div>
      </section>
      {others.length ? (
        <section className="section section--soft">
          <div className="container">
            <SectionHead eyebrow="Explore" title="Other ministries" action={<Link href="/ministries" className="btn btn--outline">All ministries</Link>} />
            <div className="grid grid--3">
              {others.map((m) => (
                <MinistryTile key={m.id} ministry={m} sizes="(max-width: 700px) 100vw, 33vw" />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
