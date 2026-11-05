import type { Metadata } from 'next'
import Link from 'next/link'

import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { SermonCard } from '@/components/site/Cards'
import { Icon } from '@/components/site/Icon'
import { PageHero } from '@/components/site/PageHero'
import { YearChips } from '@/components/site/YearChips'
import { YouTube } from '@/components/site/YouTube'
import { formatDate, youtubeId } from '@/lib/format'
import { getSermons, getSiteSettings, getYears } from '@/lib/payload'

export const metadata: Metadata = { title: 'Sermons', description: 'Watch recent sermons and messages from CCC Erith Parish.' }

type Props = { searchParams: Promise<{ page?: string; q?: string; year?: string }> }

export default async function SermonsPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const q = sp.q?.trim().slice(0, 80) || undefined
  const year = Number(sp.year) || undefined
  const filtered = Boolean(q || year)
  const [sermons, settings, years] = await Promise.all([getSermons({ page, limit: 9, q, year }), getSiteSettings(), getYears('sermons')])
  const [latest, ...rest] = sermons.docs
  const showFeature = !filtered && page === 1 && latest
  const grid = showFeature ? rest : sermons.docs
  const latestId = latest ? youtubeId(latest.youtubeUrl) : null
  const pageHref = (n: number) => {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (year) p.set('year', String(year))
    if (n > 1) p.set('page', String(n))
    const s = p.toString()
    return s ? `/sermons?${s}` : '/sermons'
  }

  return (
    <>
      <PageHero eyebrow="The Word" title="Sermons" intro="Messages of faith, hope and holiness. Watch again, share with a friend, and grow in the Word.">
        {settings.youtube ? (
          <Reveal delay={0.3}>
            <div style={{ marginTop: 28 }}>
              <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="btn btn--white">
                <Icon name="youtube" /> Our YouTube channel
              </a>
            </div>
          </Reveal>
        ) : null}
      </PageHero>
      <section className="section">
        <div className="container">
          {showFeature && latestId ? (
            <div className="sermon-feature">
              <Reveal direction="left"><YouTube id={latestId} title={latest.title} /></Reveal>
              <Reveal direction="right">
                <span className="eyebrow">Latest message</span>
                <h2><Link href={`/sermons/${latest.slug}`}>{latest.title}</Link></h2>
                <ul className="meta-list">
                  <li><Icon name="calendar" /> {formatDate(latest.date)}</li>
                  {latest.preacher ? <li><Icon name="user" /> {latest.preacher}</li> : null}
                  {latest.passage ? <li><Icon name="book" /> {latest.passage}</li> : null}
                </ul>
                {latest.summary ? <p className="lead" style={{ fontSize: '1.05rem' }}>{latest.summary}</p> : null}
                <Link href={`/sermons/${latest.slug}`} className="text-link">Sermon notes <Icon name="arrow" size={15} /></Link>
              </Reveal>
            </div>
          ) : null}

          {sermons.totalDocs > 0 || filtered ? (
            <div className="filters">
              <YearChips base="/sermons" years={years} current={year} params={{ q }} />
              <form className="search" action="/sermons" role="search">
                <Icon name="search" size={18} />
                {year ? <input type="hidden" name="year" value={year} /> : null}
                <input type="search" name="q" defaultValue={q} placeholder="Search sermons, preachers, passages…" aria-label="Search sermons" />
              </form>
            </div>
          ) : null}

          {grid.length ? (
            <Stagger className="grid grid--3">
              {grid.map((s) => (
                <StaggerItem key={s.id}>
                  <SermonCard sermon={s} />
                </StaggerItem>
              ))}
            </Stagger>
          ) : !showFeature ? (
            <div className="empty">
              <h3>{filtered ? 'No sermons match your search' : 'Sermons coming soon'}</h3>
              <p>{filtered ? 'Try another word or year.' : 'Recordings of our services will appear here.'}</p>
            </div>
          ) : null}

          {sermons.totalPages > 1 ? (
            <nav className="pagination" aria-label="Sermon pages">
              {Array.from({ length: sermons.totalPages }, (_, i) => i + 1).map((n) =>
                n === page ? <span key={n} aria-current="page">{n}</span> : <Link key={n} href={pageHref(n)}>{n}</Link>,
              )}
            </nav>
          ) : null}
        </div>
      </section>
    </>
  )
}
