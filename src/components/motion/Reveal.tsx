'use client'

import { motion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

// Reduced motion is handled globally by <MotionProvider> (reducedMotion="user"):
// movement is skipped and only the fade remains.

const EASE = [0.22, 1, 0.36, 1] as const

type Direction = 'up' | 'left' | 'right' | 'none'

const offset = (d: Direction) => (d === 'up' ? { y: 36 } : d === 'left' ? { x: -40 } : d === 'right' ? { x: 40 } : {})

/** Fades + slides its children in once they scroll into view. */
export function Reveal({
  children,
  delay = 0,
  direction = 'up',
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  direction?: Direction
  className?: string
  as?: 'div' | 'section' | 'li' | 'article' | 'header'
}) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, ...offset(direction) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </Tag>
  )
}

const groupVariants: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.85, ease: EASE } },
}

/** Container whose <StaggerItem> children appear one after another. */
export function Stagger({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'ul' }) {
  const Tag = motion[as]
  return (
    <Tag className={className} variants={groupVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: '0px 0px -10% 0px' }}>
      {children}
    </Tag>
  )
}

export function StaggerItem({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'li' | 'article' }) {
  const Tag = motion[as]
  return (
    <Tag className={className} variants={itemVariants}>
      {children}
    </Tag>
  )
}
