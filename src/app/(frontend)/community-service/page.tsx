import type { Metadata } from 'next'

import { ImageReveal } from '@/components/motion/ImageReveal'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { WordReveal } from '@/components/motion/WordReveal'
import { Curve } from '@/components/site/Curve'
import { Icon, type IconName } from '@/components/site/Icon'
import { JoinUs } from '@/components/site/JoinUs'
import { MediaImage } from '@/components/site/MediaImage'
import { PageHero } from '@/components/site/PageHero'
import { RichText } from '@/components/site/RichText'
import { SectionHead } from '@/components/site/SectionHead'
import { asMedia } from '@/lib/media'
import { getCommunityPage } from '@/lib/payload'

export const metadata: Metadata = { title: 'Community Service', description: 'Food bank, welfare, outreach and support from CCC Erith Parish — a registered charity in England & Wales.' }

export default async function CommunityPage() {
  const c = await getCommunityPage()
  const photos = (c.photos ?? []).map(asMedia).filter(Boolean)
  const ch = c.charity ?? {}
  const rows = [
    ['Full legal name', ch.legalName],
    ['Charity registration no.', ch.number],
    ['Registered address', ch.address],
    ['Governing document', ch.governingDocument],
  ].filter(([, v]) => v) as [string, string][]

  return (
    <>
      <PageHero eyebrow="Serving our neighbours" title="Community Service" intro={c.intro} image={photos[0]} />

      <section className="section">
        <div className="container split">
          <div>
            <Reveal><span className="eyebrow">Faith in action</span></Reveal>
            <WordReveal as="h2" text="Beyond the walls of the sanctuary" accentLast />
            <Reveal delay={0.15}>
              <div className="rainbow-rule" />
              <RichText data={c.text} />
            </Reveal>
          </div>
          {photos.length > 1 ? (
            <div className="collage">
              {photos.slice(1, 4).map((p, i) => (
                <ImageReveal key={p!.id} className="collage__item" from={i === 0 ? 'left' : 'right'} delay={i * 0.15}>
                  <MediaImage media={p} sizes="(max-width: 900px) 50vw, 25vw" />
                </ImageReveal>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {c.programmes?.length ? (
        <section className="section band">
          <Curve position="top" color="#fff" />
          <div className="container">
            <SectionHead center eyebrow="How we help" title={<>{c.programmesHeading ?? 'Our programmes'}</>} />
            <Stagger className="beliefs">
              {c.programmes.map((p) => (
                <StaggerItem key={p.id} className="belief">
                  <span className="belief__icon"><Icon name={(p.icon ?? 'sparkle') as IconName} size={24} /></span>
                  <span>{p.title}</span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
          <Curve position="bottom" color="#fff" />
        </section>
      ) : null}

      {rows.length ? (
        <section className="section">
          <div className="container container--narrow">
            <Reveal className="charity-card">
              <div className="charity-card__head">
                <Icon name="shield" size={26} />
                <h3>Charity &amp; regulatory information</h3>
              </div>
              <dl>
                {rows.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
                {ch.registerUrl ? (
                  <div>
                    <dt>Trustees &amp; governance</dt>
                    <dd>
                      <a className="text-link" href={ch.registerUrl} target="_blank" rel="noopener noreferrer">
                        View on the Charity Commission register <Icon name="external" size={14} />
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>
            </Reveal>
          </div>
        </section>
      ) : null}

      <JoinUs />
    </>
  )
}
