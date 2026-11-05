'use client'

import { useReducedMotionSafe } from '@/components/motion/useReducedMotionSafe'

import { animate, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

export function CountUp({ value, suffix }: { value: number; suffix?: string | null }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const reduce = useReducedMotionSafe()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(0, value, { duration: 2.2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setDisplay(Math.round(v)) })
    return () => controls.stop()
  }, [inView, reduce, value])

  return (
    <span ref={ref} className="stat__value">
      {(reduce ? value : display).toLocaleString('en-GB')}
      {suffix ? <span>{suffix}</span> : null}
    </span>
  )
}
