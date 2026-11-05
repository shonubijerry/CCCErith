import Link from 'next/link'

import { CountUp } from '@/components/motion/CountUp'
import { Parallax } from '@/components/motion/Parallax'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { MinistryTile, NextUpRow, SermonCard } from '@/components/site/Cards'
import { Hero } from '@/components/site/Hero'
import { Icon } from '@/components/site/Icon'
import { MediaImage } from '@/components/site/MediaImage'
import { SectionHead } from '@/components/site/SectionHead'
import { timeRange } from '@/lib/format'
import { asMedia } from '@/lib/media'
import { getFeaturedSermons, getHomePage, getMinistries, getUpcomingEvents, getWeeklyServices } from '@/lib/payload'
import { nextOccurrences } from '@/lib/schedule'

export default async function HomePage() {
  const [home, services, events, ministries, sermons] = await Promise.all([
    getHomePage(),
    getWeeklyServices(),
    getUpcomingEvents(10),
    getMinistries(),
    getFeaturedSermons(),
  ])

  const hero = asMedia(home.heroImage)
  const sunday = services.find((s) => s.day === 'sunday' && s.highlight) ?? services.find((s) => s.day === 'sunday')
  const upcoming = nextOccurrences(services, events, 5)
  const welcomeImages = (home.welcomeImages ?? []).map(asMedia).filter(Boolean)

  return (
    <>
      <Hero
        image={hero?.url ?? '/brand/logo.png'}
        imageAlt={hero?.alt ?? ''}
        eyebrow={home.heroEyebrow}
        heading={home.heroHeading}
        text={home.heroText}
        primary={home.heroPrimary}
        secondary={home.heroSecondary}
        aside={sunday ? { label: 'Every Sunday', title: sunday.title, text: `${timeRange(sunday.startTime, sunday.endTime)} · 33 Bexley Road, Erith` } : null}
      />

      {/* Welcome */}
      <section className="section">
        <div className="container welcome">
          <Reveal direction="left" className="welcome__images">
            {welcomeImages[0] ? (
              <Parallax className="welcome__img welcome__img--a" distance={40}>
                <MediaImage media={welcomeImages[0]} sizes="(max-width: 900px) 90vw, 45vw" />
              </Parallax>
            ) : null}
            {welcomeImages[1] ? (
              <div className="welcome__img welcome__img--b">
                <MediaImage media={welcomeImages[1]} sizes="(max-width: 900px) 50vw, 25vw" />
              </div>
            ) : null}
            <div className="welcome__badge">CCC Kent Regional Headquarters UK</div>
          </Reveal>
          <div>
            <Reveal>
              <span className="eyebrow">Welcome</span>
              <h2>{home.welcomeHeading}</h2>
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
              <div key={s.id} className="stat">
                <CountUp value={s.value} suffix={s.suffix} />
                <div className="stat__label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Upcoming meetings */}
      {upcoming.length ? (
        <section className="section">
          <div className="container">
            <SectionHead
              eyebrow="Come as you are"
              title="Our upcoming meetings"
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
        </section>
      ) : null}

      {/* Ministries */}
      {ministries.length ? (
        <section className="section section--soft">
          <div className="container">
            <SectionHead
              eyebrow="Get connected"
              title="Our ministries"
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

      {/* Sermons */}
      {sermons.length ? (
        <section className="section">
          <div className="container">
            <SectionHead
              eyebrow="The Word"
              title="Recent sermons"
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
        <section className={`section${sermons.length ? ' section--soft' : ''}`}>
          <div className="container">
            <SectionHead center eyebrow="Get involved" title={home.involvedHeading ?? 'Get involved today'} text={home.involvedText} />
            <Stagger className="grid grid--3">
              {home.involved.map((item) => (
                <StaggerItem key={item.id}>
                  <article className="card">
                    <Parallax className="card__media" distance={24}>
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
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* Giving */}
      <section className="section">
        <div className="container">
          <Reveal className="give-banner">
            {home.givingImage ? (
              <div className="give-banner__bg">
                <MediaImage media={home.givingImage} sizes="100vw" />
              </div>
            ) : null}
            <span className="eyebrow eyebrow--light">Support our mission</span>
            <h2>{home.givingHeading ?? 'Support the work of God'}</h2>
            <p>{home.givingText}</p>
            <div className="give-banner__actions">
              <Link href="/give" className="btn">Ways to give <Icon name="arrow" /></Link>
              <Link href="/contact" className="btn btn--ghost-light">Plan your visit</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
