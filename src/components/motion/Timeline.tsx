'use client'

import { motion, useScroll, useSpring } from 'motion/react'
import { useRef, type ReactNode } from 'react'

/** Vertical timeline whose centre line draws itself as you scroll through it. */
export function Timeline({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  return (
    <div ref={ref} className="timeline">
      <div className="timeline__rail" aria-hidden="true">
        <motion.div className="timeline__line" style={{ scaleY }} />
      </div>
      {children}
    </div>
  )
}
