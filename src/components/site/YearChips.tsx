import Link from 'next/link'

/** "All / 2026 / 2025" filter chips that keep any other query params. */
export function YearChips({ base, years, current, params = {} }: { base: string; years: number[]; current?: number; params?: Record<string, string | undefined> }) {
  const href = (year?: number) => {
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v)
    if (year) q.set('year', String(year))
    const s = q.toString()
    return s ? `${base}?${s}` : base
  }
  if (years.length < 2 && !current) return <div />
  return (
    <nav className="chips" aria-label="Filter by year">
      <Link href={href()} className="chip" aria-current={!current ? 'true' : undefined} scroll={false}>All</Link>
      {years.map((y) => (
        <Link key={y} href={href(y)} className="chip" aria-current={current === y ? 'true' : undefined} scroll={false}>{y}</Link>
      ))}
    </nav>
  )
}
