import type { CollectionConfig } from 'payload'

import { contentAccess } from '../access'

export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

const timeField = (name: string, label: string) => ({
  name,
  label,
  type: 'text' as const,
  admin: { description: '24-hour time, e.g. 19:00', width: '50%' },
  validate: (v: string | null | undefined) => !v || /^([01]\d|2[0-3]):[0-5]\d$/.test(v) || 'Use HH:MM, e.g. 09:30',
})

export const WeeklyServices: CollectionConfig = {
  slug: 'weekly-services',
  labels: { singular: 'Weekly service', plural: 'Weekly services' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'day', 'startTime', 'endTime'],
    group: 'Services & events',
    description: 'The regular weekly timetable shown on the home and events pages.',
  },
  access: contentAccess,
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'day',
      type: 'select',
      required: true,
      options: DAYS.map((d) => ({ label: d[0].toUpperCase() + d.slice(1), value: d })),
    },
    {
      type: 'row',
      fields: [timeField('startTime', 'Starts'), timeField('endTime', 'Ends')],
    },
    {
      name: 'allDay',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Tick if this runs all day (times are then hidden).' },
    },
    { name: 'note', type: 'text', admin: { description: 'Optional, e.g. "Online via Zoom".' } },
    { name: 'highlight', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Show prominently, e.g. Sunday Worship.' } },
  ],
}
