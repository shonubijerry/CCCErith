'use client'

import { useReducedMotionSafe } from '@/components/motion/useReducedMotionSafe'

import { motion, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'

import { Icon } from './Icon'

const EASE = [0.22, 1, 0.36, 1] as const

type LinkData = { label?: string | null; href?: string | null } | null | undefined

export function Hero({
  image,
  imageAlt,
  eyebrow,
  heading,
  text,
  primary,
  secondary,
  aside,
}: {
  image: string
  imageAlt: string
  eyebrow?: string | null
  heading: string
  text?: string | null
  primary?: LinkData
  secondary?: LinkData
  aside?: { label: string; title: string; text: string } | null
}) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotionSafe()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  // Last word of the heading gets the accent treatment.
  const words = heading.trim().split(/\s+/)

  return (
    <section className="hero" ref={ref}>
      <motion.div className="hero__media" style={reduce ? undefined : { y: imgY }}>
        <motion.div
          style={{ position: 'absolute', inset: 0 }}
          initial={{ scale: 1.18 }}
          animate={{ scale: 1.02 }}
          transition={{ duration: 9, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image src={image} alt={imageAlt} fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center 30%' }} />
        </motion.div>
      </motion.div>
      <div className="hero__overlay" />

      <motion.div className="hero__content" style={reduce ? undefined : { y: contentY, opacity: fade }}>
        <div className="container">
          {eyebrow ? (
            <motion.span
              className="eyebrow eyebrow--light"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
            >
              {eyebrow}
            </motion.span>
          ) : null}
          <h1 aria-label={heading}>
            {words.map((w, i) => (
              <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.08em' }} aria-hidden="true">
                <motion.span
                  style={{ display: 'inline-block' }}
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.1, delay: 0.45 + i * 0.08, ease: EASE }}
                >
                  {i === words.length - 1 ? <em>{w}</em> : w}
                  {i < words.length - 1 ? ' ' : ''}
                </motion.span>
              </span>
            ))}
          </h1>
          {text ? (
            <motion.p
              className="hero__text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9, ease: EASE }}
            >
              {text}
            </motion.p>
          ) : null}
          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1, ease: EASE }}
          >
            {primary?.label && primary.href ? (
              <Link href={primary.href} className="btn">
                {primary.label} <Icon name="arrow" />
              </Link>
            ) : null}
            {secondary?.label && secondary.href ? (
              <Link href={secondary.href} className="btn btn--ghost-light">
                {secondary.label}
              </Link>
            ) : null}
          </motion.div>
        </div>
      </motion.div>

      {aside ? (
        <motion.div
          className="hero__aside"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 1.3, ease: EASE }}
        >
          <small>{aside.label}</small>
          <strong>{aside.title}</strong>
          <span>{aside.text}</span>
        </motion.div>
      ) : null}
      <div className="hero__scroll" aria-hidden="true" />
    </section>
  )
}
