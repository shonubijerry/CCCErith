import type { CollectionConfig } from 'payload'

import { contentAccess } from '../access'
import { slugField } from '../fields/slug'

export const Albums: CollectionConfig = {
  slug: 'albums',
  labels: { singular: 'Gallery album', plural: 'Gallery albums' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date'],
    group: 'Content',
    description: 'Photo albums for the gallery. Tip: you can select or upload many photos at once.',
  },
  defaultSort: '-date',
  access: contentAccess,
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'date', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } } },
    { name: 'description', type: 'textarea' },
    { name: 'cover', type: 'upload', relationTo: 'media', admin: { description: 'Optional. The first photo is used if empty.' } },
    { name: 'photos', type: 'upload', relationTo: 'media', hasMany: true, required: true },
    slugField(),
  ],
}
