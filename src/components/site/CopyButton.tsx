'use client'

import { useState } from 'react'

import { Icon } from './Icon'

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="copy-btn"
      data-copied={copied}
      aria-label={`Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value.replace(/\s/g, label === 'reference' ? ' ' : ''))
          setCopied(true)
          setTimeout(() => setCopied(false), 1800)
        } catch {
          /* clipboard blocked – user can still select the text */
        }
      }}
    >
      <Icon name={copied ? 'check' : 'copy'} size={14} /> {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
