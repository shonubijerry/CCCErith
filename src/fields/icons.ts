/** Icons editors can pick for beliefs, programmes etc. Must exist in components/site/Icon.tsx. */
export const ICON_OPTIONS = [
  { label: 'Cross', value: 'cross' },
  { label: 'Dove', value: 'dove' },
  { label: 'Bible', value: 'book' },
  { label: 'Flame (prayer / Spirit)', value: 'flame' },
  { label: 'Heart', value: 'heart' },
  { label: 'Hands', value: 'hand' },
  { label: 'People', value: 'users' },
  { label: 'Sparkle', value: 'sparkle' },
  { label: 'Globe', value: 'globe' },
  { label: 'Shield', value: 'shield' },
  { label: 'Food / basket', value: 'basket' },
  { label: 'Graduation', value: 'school' },
  { label: 'Home / family', value: 'home' },
  { label: 'Chat / counselling', value: 'chat' },
] as const

export const iconField = (name = 'icon') => ({
  name,
  type: 'select' as const,
  defaultValue: 'sparkle',
  options: ICON_OPTIONS.map((o) => ({ ...o })),
})
