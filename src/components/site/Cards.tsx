import Image from 'next/image'
import Link from 'next/link'

import { Tilt } from '@/components/motion/Tilt'
import { formatDate, timeRange, youtubeId } from '@/lib/format'
import type { Occurrence } from '@/lib/schedule'
import type { Ministry, Sermon } from '@/payload-types'

import { Icon } from './Icon'
import { MediaImage } from './MediaImage'

export function SermonCard({ sermon }: { sermon: Sermon }) {
  const id = youtubeId(sermon.youtubeUrl)
  return (
    <article className="card">
      <div className="card__media" style={{ aspectRatio: '16 / 10' }}>
        {id ? (
          <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" unoptimized style={{ objectFit: 'cover' }} />
        ) : null}
        <span className="card__play"><Icon name="play" size={22} /></span>
      </div>
      <div className="card__body">
        <span className="card__kicker">{formatDate(sermon.date, { day: 'numeric', month: 'short', year: 'numeric' })}{sermon.preacher ? ` · ${sermon.preacher}` : ''}</span>
        <h3 className="card__title">
          <Link href={`/sermons/${sermon.slug}`} className="card__link">{sermon.title}</Link>
        </h3>
        {sermon.passage ? <p className="card__text">{sermon.passage}</p> : null}
      </div>
    </article>
  )
}

export function MinistryTile({ ministry, sizes = '(max-width: 700px) 100vw, 25vw' }: { ministry: Ministry; sizes?: string }) {
  return (
    <Tilt className="tilt">
      <Link href={`/ministries/${ministry.slug}`} className="tile">
        <MediaImage media={ministry.image} sizes={sizes} />
        <div className="tile__body">
          <h3 className="tile__title">{ministry.title}</h3>
          <p className="tile__text">{ministry.excerpt}</p>
          <span className="tile__more">Learn more <Icon name="arrow" size={15} /></span>
        </div>
      </Link>
    </Tilt>
  )
}

const utc = (d: Date, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...opts }).format(d)

export function NextUpRow({ o }: { o: Occurrence }) {
  const inner = (
    <>
      <div className="next-up__date">
        <strong>{utc(o.date, { day: 'numeric' })}</strong>
        <small>{utc(o.date, { month: 'short' })} · {utc(o.date, { weekday: 'short' })}</small>
      </div>
      <div>
        <div className="next-up__title">{o.title}</div>
        <div className="next-up__meta">
          {o.allDay ? 'All day' : timeRange(o.start, o.end)}
          {o.special ? ' · Special event' : ''}
        </div>
      </div>
      <Icon name="arrow" style={{ color: 'var(--red)' }} />
    </>
  )
  return o.href ? (
    <Link href={o.href} className="next-up__row">{inner}</Link>
  ) : (
    <Link href="/events" className="next-up__row">{inner}</Link>
  )
}
