'use client'

import { useState } from 'react'

import { Icon } from './Icon'

/** Shows the thumbnail first and only loads YouTube when clicked (faster, no tracking until play). */
export function YouTube({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = useState(false)
  return (
    <div className="video">
      {play ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button onClick={() => setPlay(true)} aria-label={`Play: ${title}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`} alt="" loading="lazy" />
          <span className="video__play"><Icon name="play" size={30} /></span>
        </button>
      )}
    </div>
  )
}
