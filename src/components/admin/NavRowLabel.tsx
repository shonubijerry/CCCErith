'use client'

import { useRowLabel } from '@payloadcms/ui'

/** Shows each menu row by its label (or column heading) instead of "Menu item 01". */
export function NavRowLabel() {
  const { data, rowNumber } = useRowLabel<{ label?: string; heading?: string; children?: unknown[] }>()
  const name = data?.label || data?.heading || `Item ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`
  const count = Array.isArray(data?.children) && data.children.length ? ` (${data.children.length} in dropdown)` : ''
  return <span>{name + count}</span>
}
