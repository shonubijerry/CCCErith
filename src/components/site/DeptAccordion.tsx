'use client'

import { useId, useState, type ReactNode } from 'react'

import { Icon } from './Icon'

/** A team department: always open on desktop, a tap-to-open section on phones. */
export function DeptAccordion({ title, count, children, defaultOpen = false }: { title: string; count: number; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  const label = `${count} ${count === 1 ? 'member' : 'members'}`
  return (
    <div className="dept">
      <button className="dept__toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <h3>
          {title}
          <span className="dept__count">{label}</span>
        </h3>
        <Icon name="chevron" size={22} />
      </button>
      <h3 className="dept__heading">
        {title}
        <span className="dept__count">{label}</span>
      </h3>
      <div id={id} className="dept__body" data-open={open}>
        {children}
      </div>
    </div>
  )
}
