'use client'

import Image from 'next/image'
import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import 'yet-another-react-lightbox/plugins/captions.css'
import 'yet-another-react-lightbox/plugins/counter.css'
import 'yet-another-react-lightbox/styles.css'

import { Stagger, StaggerItem } from '@/components/motion/Reveal'

export type Photo = { id: number | string; src: string; alt: string; width: number; height: number }

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(-1)
  return (
    <>
      <Stagger className="masonry">
        {photos.map((p, i) => (
          <StaggerItem key={p.id}>
            <button type="button" className="masonry__item" onClick={() => setIndex(i)} aria-label={`Open photo ${i + 1}${p.alt ? `: ${p.alt}` : ''}`}>
              <Image src={p.src} alt={p.alt} width={p.width} height={p.height} sizes="(max-width: 700px) 100vw, 33vw" />
            </button>
          </StaggerItem>
        ))}
      </Stagger>
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={photos.map((p) => ({ src: p.src, alt: p.alt, width: p.width, height: p.height, description: p.alt }))}
        plugins={[Captions, Counter]}
        animation={{ fade: 400, swipe: 450 }}
        styles={{ container: { backgroundColor: 'rgba(14, 0, 34, 0.96)' } }}
        controller={{ closeOnBackdropClick: true }}
      />
    </>
  )
}
