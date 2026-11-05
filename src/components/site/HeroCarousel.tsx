'use client'

import { AnimatePresence, motion, useScroll, useTransform, type TargetAndTransition } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useReducedMotionSafe } from '@/components/motion/useReducedMotionSafe'

import { Icon } from './Icon'

const EASE = [0.22, 1, 0.36, 1] as const

export type HeroSlide = {
  id: string
  kind: 'image' | 'video'
  src: string
  poster?: string | null
  alt: string
  eyebrow?: string | null
  heading: string
  text?: string | null
  primary?: { label: string; href: string } | null
  secondary?: { label: string; href: string } | null
  focus?: string | null
}

export type HeroSettings = {
  autoplay: boolean
  pauseOnHover: boolean
  showArrows: boolean
  showDots: boolean
  interval: number
  transition: 'fade' | 'slide' | 'wipe'
  speed: 'slow' | 'normal' | 'fast'
  overlay: 'light' | 'medium' | 'strong'
}

const SPEED = { slow: 1.6, normal: 1.1, fast: 0.65 }
const FOCUS: Record<string, string> = { center: 'center 35%', top: 'center top', bottom: 'center bottom', left: 'left center', right: 'right center' }

type Variants = { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }

function variantsFor(kind: HeroSettings['transition'], dir: number, duration: number): Variants {
  const t = { duration, ease: EASE }
  if (kind === 'slide') {
    return {
      initial: { x: `${dir * 100}%`, transition: t },
      animate: { x: '0%', transition: t },
      exit: { x: `${dir * -30}%`, opacity: 0.4, transition: t },
    }
  }
  if (kind === 'wipe') {
    return {
      initial: { clipPath: dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', transition: t },
      animate: { clipPath: 'inset(0 0 0 0%)', transition: t },
      exit: { opacity: 1, transition: { duration } },
    }
  }
  return {
    initial: { opacity: 0, transition: t },
    animate: { opacity: 1, transition: t },
    exit: { opacity: 0, transition: t },
  }
}

export function HeroCarousel({
  slides,
  settings,
  aside,
}: {
  slides: HeroSlide[]
  settings: HeroSettings
  aside?: { label: string; title: string; text: string } | null
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const elapsed = useRef(0)
  const [[index, dir], setState] = useState<[number, number]>([0, 1])
  const [hovered, setHovered] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [tabHidden, setTabHidden] = useState(false)
  const [saveData, setSaveData] = useState(false)
  const [mounted, setMounted] = useState(false)
  const reduce = useReducedMotionSafe()

  const count = slides.length
  const slide = slides[index]
  const multi = count > 1
  const autoplay = settings.autoplay && multi && !reduce && !userPaused
  const paused = !autoplay || tabHidden || (settings.pauseOnHover && hovered)
  const duration = SPEED[settings.speed] ?? SPEED.normal
  const showVideo = slide.kind === 'video' && !reduce && !saveData

  const go = useCallback(
    (to: number, d?: number) => {
      elapsed.current = 0
      setState(([cur]) => [((to % count) + count) % count, d ?? (to >= cur ? 1 : -1)])
    },
    [count],
  )
  const next = useCallback(() => go(index + 1, 1), [go, index])
  const prev = useCallback(() => go(index - 1, -1), [go, index])

  // Environment checks (client only).
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true)
      const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      setSaveData(Boolean(conn?.saveData))
    })
    const onVis = () => setTabHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelAnimationFrame(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  // Timer + progress bar (rAF, no re-renders).
  useEffect(() => {
    if (!multi) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = now - last
      last = now
      const bar = barRef.current
      if (showVideo && videoRef.current?.duration) {
        const v = videoRef.current
        if (bar) bar.style.transform = `scaleX(${Math.min(1, v.currentTime / v.duration)})`
      } else {
        if (!paused) elapsed.current += dt
        const total = settings.interval * 1000
        if (bar) bar.style.transform = `scaleX(${Math.min(1, elapsed.current / total)})`
        if (!paused && elapsed.current >= total) {
          next()
          return
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [multi, paused, showVideo, settings.interval, next, index])

  // Pause/resume video with the carousel.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (paused && multi) v.pause()
    else v.play().catch(() => {})
  }, [paused, multi, index, showVideo])

  // Scroll parallax.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const mediaY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  // Swipe on touch screens.
  const touchX = useRef<number | null>(null)

  const v = variantsFor(settings.transition, dir, duration)
  const words = slide.heading.trim().split(/\s+/)
  const zoomTo = settings.transition === 'fade' && !reduce ? 1 : 1.04

  return (
    <section
      ref={sectionRef}
      className={`hero hero--${settings.overlay}`}
      aria-roledescription="carousel"
      aria-label="Welcome"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null || !multi) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) (dx < 0 ? next : prev)()
        touchX.current = null
      }}
      onKeyDown={(e) => {
        if (!multi) return
        if (e.key === 'ArrowRight') next()
        if (e.key === 'ArrowLeft') prev()
      }}
    >
      <motion.div className="hero__media" style={reduce ? undefined : { y: mediaY }}>
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={slide.id}
            className="hero__slide"
            initial={v.initial}
            animate={v.animate}
            exit={v.exit}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
          >
            <motion.div
              className="hero__zoom"
              initial={{ scale: 1.14 }}
              animate={{ scale: zoomTo }}
              transition={{ duration: settings.interval + duration + 2, ease: 'linear' }}
            >
              {showVideo && mounted ? (
                <video
                  ref={videoRef}
                  className="hero__video"
                  src={slide.src}
                  poster={slide.poster ?? undefined}
                  muted
                  playsInline
                  autoPlay
                  preload="auto"
                  loop={!multi}
                  onEnded={() => autoplay && next()}
                  style={{ objectPosition: FOCUS[slide.focus ?? 'center'] }}
                  aria-label={slide.alt}
                />
              ) : (
                <Image
                  src={slide.kind === 'video' ? (slide.poster ?? slide.src) : slide.src}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  style={{ objectFit: 'cover', objectPosition: FOCUS[slide.focus ?? 'center'] }}
                />
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
        {settings.transition === 'wipe' ? (
          <motion.div
            key={`sweep-${slide.id}`}
            className="hero__sweep"
            initial={{ x: dir > 0 ? '100%' : '-100%' }}
            animate={{ x: dir > 0 ? '-110%' : '110%' }}
            transition={{ duration: duration * 1.1, ease: EASE }}
          />
        ) : null}
      </motion.div>
      <div className="hero__overlay" />
      <div className="hero__glow" aria-hidden="true" />

      <motion.div className="hero__content" style={reduce ? undefined : { y: contentY, opacity: fade }}>
        <div className="container">
          <div key={slide.id} className="hero__copy" aria-live={autoplay ? 'off' : 'polite'}>
            {slide.eyebrow ? (
              <motion.span className="eyebrow eyebrow--light" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25, ease: EASE }}>
                {slide.eyebrow}
              </motion.span>
            ) : null}
            <h1 aria-label={slide.heading}>
              {words.map((w, i) => (
                <span key={i} className="word-mask" aria-hidden="true">
                  <motion.span style={{ display: 'inline-block' }} initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1.05, delay: 0.35 + i * 0.07, ease: EASE }}>
                    {i === words.length - 1 ? <em className="grad-text-light">{w}</em> : w}
                    {i < words.length - 1 ? ' ' : ''}
                  </motion.span>
                </span>
              ))}
            </h1>
            {slide.text ? (
              <motion.p className="hero__text" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.75, ease: EASE }}>
                {slide.text}
              </motion.p>
            ) : null}
            <motion.div className="hero__actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.95, ease: EASE }}>
              {slide.primary ? (
                <Link href={slide.primary.href} className="btn">
                  {slide.primary.label} <Icon name="arrow" />
                </Link>
              ) : null}
              {slide.secondary ? (
                <Link href={slide.secondary.href} className="btn btn--ghost-light">
                  {slide.secondary.label}
                </Link>
              ) : null}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {multi && (settings.showDots || settings.showArrows) ? (
        <div className="hero__controls container">
          {settings.showDots ? (
            <div className="hero__dots" role="tablist" aria-label="Choose slide">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Slide ${i + 1}`}
                  className={`hero__dot${i === index ? ' is-active' : ''}`}
                  onClick={() => go(i)}
                >
                  <span className="hero__dot-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="hero__dot-track">{i === index ? <span ref={barRef} className="hero__dot-bar" /> : null}</span>
                </button>
              ))}
            </div>
          ) : null}
          <div className="hero__buttons">
            {settings.autoplay && !reduce ? (
              <button className="hero__btn" onClick={() => setUserPaused((p) => !p)} aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}>
                <Icon name={userPaused ? 'play' : 'pause'} size={16} />
              </button>
            ) : null}
            {settings.showArrows ? (
              <>
                <button className="hero__btn hero__btn--arrow" onClick={prev} aria-label="Previous slide">
                  <Icon name="arrow" size={18} style={{ transform: 'rotate(180deg)' }} />
                </button>
                <button className="hero__btn hero__btn--arrow" onClick={next} aria-label="Next slide">
                  <Icon name="arrow" size={18} />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {aside ? (
        <motion.div className="hero__aside" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 1.2, ease: EASE }}>
          <small>{aside.label}</small>
          <strong>{aside.title}</strong>
          <span>{aside.text}</span>
        </motion.div>
      ) : null}
    </section>
  )
}
