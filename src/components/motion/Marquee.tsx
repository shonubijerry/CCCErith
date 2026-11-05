import Image from 'next/image'

import type { Media } from '@/payload-types'

/** Endless, slowly scrolling strip of photos (pure CSS; pauses on hover; still for reduced motion). */
export function Marquee({ photos }: { photos: Media[] }) {
  if (!photos.length) return null
  const row = photos.filter((p) => p.url)
  return (
    <div className="marquee" aria-label="Photos from parish life">
      <div className="marquee__track" style={{ animationDuration: `${row.length * 6}s` }}>
        {[...row, ...row].map((p, i) => (
          <div className="marquee__item" key={`${p.id}-${i}`} aria-hidden={i >= row.length}>
            <Image src={p.url!} alt={i < row.length ? (p.alt ?? '') : ''} fill sizes="340px" style={{ objectFit: 'cover' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
