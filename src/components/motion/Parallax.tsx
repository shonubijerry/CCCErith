'use client'

import { useReducedMotionSafe } from '@/components/motion/useReducedMotionSafe'

import { motion, useScroll, useTransform } from 'motion/react'
import { useRef, type ReactNode } from 'react'

/** Moves its child slightly slower than the page while scrolling. Wrap an image inside an overflow:hidden box. */
export function Parallax({ children, distance = 60, className }: { children: ReactNode; distance?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotionSafe()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance])
  return (
    <div ref={ref} className={className} style={{ overflow: 'hidden' }}>
      <motion.div style={{ y: reduce ? 0 : y, scale: reduce ? 1 : 1.12, position: 'absolute', inset: 0 }}>{children}</motion.div>
    </div>
  )
}
