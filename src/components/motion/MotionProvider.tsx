'use client'

import { MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'

/** Respects the visitor's "reduce motion" setting for every animation on the site. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
