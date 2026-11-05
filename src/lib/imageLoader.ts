'use client'

import type { ImageLoaderProps } from 'next/image'

/**
 * Resizes images with Cloudflare Image Transformations once the site runs on its own
 * Cloudflare-managed domain (set NEXT_PUBLIC_IMAGE_RESIZING=true). Free tier: 5,000 unique
 * transformations a month, far more than this site needs. Until then, originals are served.
 */
export default function cloudflareLoader({ src, width, quality }: ImageLoaderProps) {
  if (process.env.NEXT_PUBLIC_IMAGE_RESIZING !== 'true' || src.endsWith('.svg')) {
    return width && !src.includes('?') ? `${src}?w=${width}` : src
  }
  const params = [`width=${width}`, `quality=${quality || 78}`, 'format=auto', 'fit=scale-down']
  return `/cdn-cgi/image/${params.join(',')}${src.startsWith('/') ? src : `/${src}`}`
}
