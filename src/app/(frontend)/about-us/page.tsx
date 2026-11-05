import type { Metadata } from 'next'
import Link from 'next/link'

import { ImageReveal } from '@/components/motion/ImageReveal'
import { Parallax } from '@/components/motion/Parallax'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { Timeline } from '@/components/motion/Timeline'
import { WordReveal } from '@/components/motion/WordReveal'
import { Curve } from '@/components/site/Curve'
import { JoinUs } from '@/components/site/JoinUs'
import { Icon, type IconName } from '@/components/site/Icon'
import { MediaImage } from '@/components/site/MediaImage'
import { PageHero } from '@/components/site/PageHero'
import { RichText } from '@/components/site/RichText'
import { SectionHead } from '@/components/site/SectionHead'
import { asMedia } from '@/lib/media'
import { getAboutPage, getTeam } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Who we are, our story, beliefs and values — Celestial Church of Christ Noah’s Ark Erith Parish, CCC Kent Regional Headquarters UK.',
}

const initials = (name: string) =>
  name.replace(/\(.*?\)/g, '').split(/\s+/).filter((w) => /^[A-Z]/.test(w) && !/[/.]/.test(w)).slice(-2).map((w) => w[0]).join('')

export default async function AboutPage() {
  const [about, team] = await Promise.all([getAboutPage(), getTeam()])
  const heroPhotos = (about.heroPhotos ?? []).map(asMedia).filter(Boolean)
  const who = (about.whoPhotos ?? []).map(asMedia).filter(Boolean)
  const leaders = about.showLeaders ? team.members.filter((m) => m.featured) : []

  return (
    <>
      <PageHero eyebrow="Our church" title="About Us" intro={about.intro} className="about-hero">
        {heroPhotos.length ? (
          <div className="photo-fan">
            {heroPhotos.map((p, i) => (
              <ImageReveal key={p!.id} className="photo-fan__item" from="bottom" delay={0.2 + i * 0.15}>
                <MediaImage media={p} sizes="(max-width: 700px) 50vw, 35vw" priority={i === 1} />
              </ImageReveal>
            ))}
          </div>
        ) : null}
      </PageHero>

      {/* Who we are */}
      <section className="section">
        <div className="container split">
          <div>
            <Reveal><span className="eyebrow">Welcome</span></Reveal>
            <WordReveal as="h2" text={about.whoHeading ?? 'Who we are'} accentLast />
            <Reveal delay={0.15}>
              <div className="rainbow-rule" />
              <RichText data={about.whoText} />
            </Reveal>
          </div>
          {who.length ? (
            <div className="collage">
              {who.map((p, i) => (
                <ImageReveal key={p!.id} className="collage__item" from={i === 0 ? 'left' : 'right'} delay={i * 0.15}>
                  <MediaImage media={p} sizes="(max-width: 900px) 50vw, 25vw" />
                </ImageReveal>
              ))}
              <Reveal className="collage__badge" delay={0.5}>Part of the worldwide Celestial Church of Christ</Reveal>
            </div>
          ) : null}
        </div>
      </section>

      {/* Quote */}
      {about.quote ? (
        <section className="section band quote-band">
          <Curve position="top" color="#fff" />
          <div className="container">
            <Reveal>
              <blockquote>{about.quote}</blockquote>
              {about.quoteCite ? <cite>{about.quoteCite}</cite> : null}
            </Reveal>
          </div>
          <Curve position="bottom" color="#fff" />
        </section>
      ) : null}

      {/* Story timeline */}
      {about.storySteps?.length ? (
        <section className="section">
          <div className="container">
            <SectionHead center eyebrow="Our journey" title={<>{about.storyHeading ?? 'Our story'}</>} />
            <Timeline>
              {about.storySteps.map((step, i) => (
                <div key={step.id} className="timeline__step">
                  <span className="timeline__dot" aria-hidden="true" />
                  <Reveal direction={i % 2 ? 'right' : 'left'}>
                    {step.label ? <span className="timeline__label">{step.label}</span> : null}
                    <h3>{step.title}</h3>
                    <p className="lead" style={{ fontSize: '1.08rem' }}>{step.text}</p>
                  </Reveal>
                  <div className="timeline__media">
                    {step.image ? (
                      <ImageReveal from={i % 2 ? 'left' : 'right'} style={{ height: '100%' }}>
                        <Parallax className="fill" distance={30}>
                          <MediaImage media={step.image} sizes="(max-width: 800px) 100vw, 45vw" />
                        </Parallax>
                      </ImageReveal>
                    ) : null}
                  </div>
                </div>
              ))}
            </Timeline>
          </div>
        </section>
      ) : null}

      {/* Beliefs */}
      {about.beliefs?.length ? (
        <section className="section section--tint">
          <div className="container">
            <SectionHead center eyebrow="Beliefs that unite us" title={<>{about.beliefsHeading ?? 'Our core beliefs'}</>} />
            <Stagger className="beliefs">
              {about.beliefs.map((b) => (
                <StaggerItem key={b.id} className="belief">
                  <span className="belief__icon"><Icon name={(b.icon ?? 'sparkle') as IconName} size={24} /></span>
                  <span>{b.title}</span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* Values */}
      {about.values?.length ? (
        <section className="section">
          <div className="container">
            <SectionHead center eyebrow="What guides us" title={<>{about.valuesHeading ?? 'Our core values'}</>} />
            <Stagger className="highlights">
              {about.values.map((v, i) => (
                <StaggerItem key={v.id} className="highlight">
                  <span className="highlight__num">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{v.title}</h3>
                  {v.text ? <p>{v.text}</p> : null}
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* Leaders */}
      {leaders.length ? (
        <section className="section band">
          <Curve position="top" color="#fff" />
          <div className="container">
            <SectionHead center eyebrow="Leadership" title={<>Our <em className="grad-text-light">shepherds</em></>} text={about.leadersText} />
            <Stagger className="leaders">
              {leaders.map((m) => (
                <StaggerItem key={m.id} className="leader">
                  <div className="leader__photo" style={{ position: 'relative' }}>
                    {m.photo ? <MediaImage media={m.photo} sizes="170px" /> : <span className="initials">{initials(m.name)}</span>}
                  </div>
                  {m.churchTitle ? <div className="leader__title">{m.churchTitle}</div> : null}
                  <h3>{m.name}</h3>
                  <p>{m.role}</p>
                </StaggerItem>
              ))}
            </Stagger>
            <div className="center mt-lg">
              <Link href="/our-team" className="btn btn--white">Meet the team <Icon name="arrow" /></Link>
            </div>
          </div>
          <Curve position="bottom" color="#fff" />
        </section>
      ) : null}

      <JoinUs />
    </>
  )
}
