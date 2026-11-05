'use client'

import { motion, type Variants } from 'motion/react'

const EASE = [0.22, 1, 0.36, 1] as const

const word: Variants = {
  hidden: { y: '110%' },
  show: (i: number) => ({ y: 0, transition: { duration: 1, delay: i * 0.06, ease: EASE } }),
}

/**
 * Heading whose words rise up one after another. The heading itself is watched for
 * visibility (the hidden words are clipped, so they can't be).
 */
export function WordReveal({
  text,
  as = 'h1',
  className,
  delay = 0.1,
  accentLast = false,
  light = false,
}: {
  text: string
  as?: 'h1' | 'h2'
  className?: string
  delay?: number
  accentLast?: boolean
  light?: boolean
}) {
  const Tag = motion[as]
  const words = text.trim().split(/\s+/)
  return (
    <Tag
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ delayChildren: delay }}
    >
      {words.map((w, i) => (
        <span key={i} className="word-mask" aria-hidden="true">
          <motion.span style={{ display: 'inline-block' }} variants={word} custom={i + delay / 0.06}>
            {accentLast && i === words.length - 1 ? <em className={light ? 'grad-text-light' : 'grad-text'}>{w}</em> : w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
