import type { ReactNode } from 'react'

import { Reveal } from '@/components/motion/Reveal'

export function SectionHead({
  eyebrow,
  title,
  text,
  center,
  action,
}: {
  eyebrow?: string
  title: ReactNode
  text?: ReactNode
  center?: boolean
  action?: ReactNode
}) {
  if (action) {
    return (
      <Reveal className="section-head section-head--split">
        <div>
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <h2>{title}</h2>
          {text ? <p>{text}</p> : null}
        </div>
        {action}
      </Reveal>
    )
  }
  return (
    <Reveal className={`section-head${center ? ' section-head--center' : ''}`}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </Reveal>
  )
}
