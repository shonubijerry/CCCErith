import Link from 'next/link'

import { CountUp } from '@/components/motion/CountUp'
import { ImageReveal } from '@/components/motion/ImageReveal'
import { Marquee } from '@/components/motion/Marquee'
import { Parallax } from '@/components/motion/Parallax'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { Tilt } from '@/components/motion/Tilt'
import { WordReveal } from '@/components/motion/WordReveal'
import { MinistryTile, NextUpRow, SermonCard } from '@/components/site/Cards'
import { Curve } from '@/components/site/Curve'
import { HeroCarousel, type HeroSettings, type HeroSlide } from '@/components/site/HeroCarousel'
import { Icon } from '@/components/site/Icon'
import { MediaImage } from '@/components/site/MediaImage'
import { SectionHead } from '@/components/site/SectionHead'
import { timeRange } from '@/lib/format'
import { asMedia } from '@/lib/media'
import { getFeaturedSermons, getHomePage, getMinistries, getUpcomingEvents, getWeeklyServices } from '@/lib/payload'
import { nextOccurrences } from '@/lib/schedule'
import type { HomePage as HomeData, Media } from '@/payload-types'

const link = (l?: { label?: string | null; href?: string | null } | null) => (l?.label && l?.href ? { label: l.label, href: l.href } : null)

function buildSlides(home: HomeData): HeroSlide[] {
  return (home.heroSlides ?? [])
    .map((s, i): HeroSlide | null => {
      const media = asMedia(s.media)
      if (!media?.url) return null
      const isVideo = media.mimeType?.startsWith('video/') ?? false
      const ownButton = s.buttonLabel && s.buttonHref ? { label: s.buttonLabel, href: s.buttonHref } : null
      return {
        id: s.id ?? String(i),
        kind: isVideo ? 'video' : 'image',
        src: media.url,
        poster: asMedia(s.poster)?.url ?? null,
        alt: media.alt ?? '',
        eyebrow: s.eyebrow || (s.heading ? null : home.heroEyebrow),
        heading: s.heading || home.heroHeading,
        text: s.text || (s.heading ? null : home.heroText),
        primary: ownButton ?? link(home.heroPrimary),
        secondary: ownButton ? null : link(home.heroSecondary),
        focus: s.focus,
      }
    })
    .filter((s): s is HeroSlide => Boolean(s))
}

export default async function HomePage() {
  const [home, services, events, ministries, sermons] = await Promise.all([
    getHomePage(),
    getWeeklyServices(),
    getUpcomingEvents(10),
    getMinistries(),
    getFeaturedSermons(),
  ])

  const slides = buildSlides(home)
  const hs = home.heroSettings ?? {}
  const settings: HeroSettings = {
    autoplay: hs.autoplay ?? true,
    pauseOnHover: hs.pauseOnHover ?? true,
    showArrows: hs.showArrows ?? true,
    showDots: hs.showDots ?? true,
    interval: Math.min(15, Math.max(4, hs.interval ?? 7)),
    transition: hs.transition ?? 'fade',
    speed: hs.speed ?? 'normal',
    overlay: hs.overlay ?? 'medium',
  }
  const sunday = services.find((s) => s.day === 'sunday' && s.highlight) ?? services.find((s) => s.day === 'sunday')
  const upcoming = nextOccurrences(services, events, 5)
  const welcomeImages = (home.welcomeImages ?? []).map(asMedia).filter(Boolean)
  const strip = (home.stripPhotos ?? []).map(asMedia).filter((m): m is Media => Boolean(m))

  return (
    <>
      {slides.length ? (
        <HeroCarousel
          slides={slides}
          settings={settings}
          aside={sunday ? { label: 'Every Sunday', title: sunday.title, text: `${timeRange(sunday.startTime, sunday.endTime)} · 33 Bexley Road, Erith` } : null}
        />
      ) : null}

      {/* Welcome */}
      <section className="section">
        <div className="container welcome">
          <div className="welcome__images">
            {welcomeImages[0] ? (
              <ImageReveal className="welcome__img welcome__img--a" from="left">
                <Parallax distance={30} className="fill">
                  <MediaImage media={welcomeImages[0]} sizes="(max-width: 900px) 90vw, 45vw" />
                </Parallax>
              </ImageReveal>
            ) : null}
            {welcomeImages[1] ? (
              <ImageReveal className="welcome__img welcome__img--b" from="bottom" delay={0.3}>
                <MediaImage media={welcomeImages[1]} sizes="(max-width: 900px) 50vw, 25vw" />
              </ImageReveal>
            ) : null}
            <Reveal className="welcome__badge" delay={0.6}>CCC Kent Regional Headquarters UK</Reveal>
          </div>
          <div>
            <Reveal>
              <span className="eyebrow">Welcome</span>
            </Reveal>
            <WordReveal as="h2" text={home.welcomeHeading ?? 'Welcome'} accentLast />
            <Reveal delay={0.2}>
              <div className="rainbow-rule" />
              <p className="lead">{home.welcomeText}</p>
              <Link href="/about-us" className="text-link">Discover our story <Icon name="arrow" size={16} /></Link>
            </Reveal>
            {home.pillars?.length ? (
              <Stagger className="pillars">
                {home.pillars.map((p) => (
                  <StaggerItem key={p.id} className="pillar">
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                  </StaggerItem>
                ))}
              </Stagger>
            ) : null}
          </div>
        </div>
      </section>

      {/* Stats */}
      {home.stats?.length ? (
        <section className="section section--tight section--tint">
          <div className="container stats">
            {home.stats.map((s) => (
              <Reveal key={s.id} className="stat">
                <CountUp value={s.value} suffix={s.suffix} />
                <div className="stat__label">{s.label}</div>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* Upcoming meetings — purple band */}
      {upcoming.length ? (
        <section className="section band">
          <Curve position="top" color="var(--purple-tint)" />
          <div className="container">
            <SectionHead
              eyebrow="Come as you are"
              title={<>Our upcoming <em className="grad-text-light">meetings</em></>}
              text="Worship, prayer and fellowship throughout the week. Everyone is welcome."
              action={<Link href="/events" className="btn btn--outline">Full timetable <Icon name="arrow" /></Link>}
            />
            <Stagger className="next-up">
              {upcoming.map((o) => (
                <StaggerItem key={o.key}>
                  <NextUpRow o={o} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
          <Curve position="bottom" color="#fff" />
        </section>
      ) : null}

      {/* Ministries */}
      {ministries.length ? (
        <section className="section">
          <div className="container">
            <SectionHead
              eyebrow="Get connected"
              title={<>Our <em className="grad-text">ministries</em></>}
              text="Find your place to serve, grow and belong in the life of the parish."
              action={<Link href="/ministries" className="btn btn--outline">All ministries <Icon name="arrow" /></Link>}
            />
            <Stagger className="grid grid--4">
              {ministries.slice(0, 4).map((m) => (
                <StaggerItem key={m.id}>
                  <MinistryTile ministry={m} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* Photo strip */}
      {strip.length ? (
        <section className="section section--tight" style={{ paddingTop: 0 }}>
          <Marquee photos={strip} />
          <div className="container center mt-lg">
            <Link href="/gallery" className="btn btn--purple">Visit the gallery <Icon name="arrow" /></Link>
          </div>
        </section>
      ) : null}

      {/* Sermons */}
      {sermons.length ? (
        <section className="section section--soft">
          <div className="container">
            <SectionHead
              eyebrow="The Word"
              title={<>Recent <em className="grad-text">sermons</em></>}
              action={<Link href="/sermons" className="btn btn--outline">All sermons <Icon name="arrow" /></Link>}
            />
            <Stagger className="grid grid--3">
              {sermons.map((s) => (
                <StaggerItem key={s.id}>
                  <SermonCard sermon={s} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* Get involved */}
      {home.involved?.length ? (
        <section className="section">
          <div className="container">
            <SectionHead center eyebrow="Get involved" title={<>{home.involvedHeading ?? 'Get involved'}</>} text={home.involvedText} />
            <Stagger className="grid grid--3">
              {home.involved.map((item) => (
                <StaggerItem key={item.id}>
                  <Tilt className="tilt">
                    <article className="card">
                      <Parallax className="card__media card__media--tint" distance={24}>
                        <MediaImage media={item.image} sizes="(max-width: 700px) 100vw, 33vw" />
                      </Parallax>
                      <div className="card__body">
                        <h3 className="card__title">
                          {item.href ? <Link href={item.href} className="card__link">{item.title}</Link> : item.title}
                        </h3>
                        <p className="card__text">{item.text}</p>
                        {item.href ? <span className="card__foot text-link">Find out more <Icon name="arrow" size={15} /></span> : null}
                      </div>
                    </article>
                  </Tilt>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* Giving */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="give-banner">
            {home.givingImage ? (
              <div className="give-banner__bg">
                <MediaImage media={home.givingImage} sizes="100vw" />
              </div>
            ) : null}
            <span className="eyebrow eyebrow--light">Support our mission</span>
            <WordReveal as="h2" text={home.givingHeading ?? 'Support the work of God'} accentLast light />
            <p>{home.givingText}</p>
            <div className="give-banner__actions">
              <Link href="/give" className="btn btn--white">Give online <Icon name="arrow" /></Link>
              <Link href="/contact" className="btn btn--ghost-light">Plan your visit</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
