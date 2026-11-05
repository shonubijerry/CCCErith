import type { Media } from '@/payload-types'

export type MediaLike = number | Media | null | undefined

export const asMedia = (m: MediaLike): Media | null => (m && typeof m === 'object' ? m : null)

export const mediaUrl = (m: MediaLike) => asMedia(m)?.url ?? null
