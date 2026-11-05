/** Gentle curved edge between a coloured band and the white page. */
export function Curve({ position, color = 'var(--purple-ink)', flip = false }: { position: 'top' | 'bottom'; color?: string; flip?: boolean }) {
  // 'bottom': white rises into the band from below. 'top': white dips into the band from above.
  const d = position === 'bottom' ? 'M0,64 C360,0 1080,0 1440,64 Z' : 'M0,0 C360,64 1080,64 1440,0 Z'
  return (
    <svg
      className={`curve curve--${position}`}
      viewBox="0 0 1440 64"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ color, transform: flip ? 'scaleX(-1)' : undefined }}
    >
      <path d={d} fill="currentColor" />
    </svg>
  )
}
