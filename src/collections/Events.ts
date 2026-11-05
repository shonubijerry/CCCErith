import type { CollectionConfig } from 'payload'

import { contentAccess } from '../access'
import { slugField } from '../fields/slug'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: { singular: 'Special event', plural: 'Special events' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startDate', 'venue'],
    group: 'Services & events',
    description: 'One-off events like harvests, anniversaries and conventions. Past events hide automatically.',
  },
  defaultSort: 'startDate',
  access: contentAccess,
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'startDate', label: 'Starts', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy, HH:mm' } } },
        { name: 'endDate', label: 'Ends (optional)', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy, HH:mm' } } },
      ],
    },
    { name: 'venue', type: 'text', defaultValue: 'Church premises, 33 Bexley Road, Erith' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'summary', type: 'textarea' },
    { name: 'description', type: 'richText' },
    slugField(),
  ],
}
