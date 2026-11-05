'use client'

import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'

const EASE = [0.76, 0, 0.24, 1] as const

/**
 * Uncovers its content with a sliding mask as it scrolls into view, while the image settles from a slight zoom.
 * The wrapper must have a size (aspect-ratio or height) since children are usually `fill` images.
 */
export function ImageReveal({
  children,
  className,
  from = 'bottom',
  delay = 0,
  style,
}: {
  children: ReactNode
  className?: string
  from?: 'bottom' | 'left' | 'right'
  delay?: number
  style?: CSSProperties
}) {
  const hidden = from === 'left' ? 'inset(0 100% 0 0)' : from === 'right' ? 'inset(0 0 0 100%)' : 'inset(100% 0 0 0)'
  return (
    <motion.div
      className={`img-reveal${className ? ` ${className}` : ''}`}
      style={{ overflow: 'hidden', ...style }}
      initial={{ clipPath: hidden }}
      whileInView={{ clipPath: 'inset(0 0 0 0)' }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.2, delay, ease: EASE }}
    >
      <motion.div
        style={{ position: 'absolute', inset: 0 }}
        initial={{ scale: 1.25 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 1.6, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
