import Image from 'next/image'

import { asMedia, type MediaLike } from '@/lib/media'

type Props = {
  media: MediaLike
  sizes?: string
  priority?: boolean
  className?: string
  fill?: boolean
  alt?: string
}

/** Renders a Payload image with sensible responsive sizes. */
export function MediaImage({ media, sizes = '100vw', priority, className, fill = true, alt }: Props) {
  const m = asMedia(media)
  if (!m?.url) return null
  if (fill) {
    return <Image src={m.url} alt={alt ?? m.alt ?? ''} fill sizes={sizes} priority={priority} className={className} style={{ objectFit: 'cover' }} />
  }
  return (
    <Image
      src={m.url}
      alt={alt ?? m.alt ?? ''}
      width={m.width ?? 1600}
      height={m.height ?? 1067}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  )
}
