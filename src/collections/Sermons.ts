import type { CollectionConfig } from 'payload'

import { contentAccess } from '../access'
import { slugField } from '../fields/slug'

export const Sermons: CollectionConfig = {
  slug: 'sermons',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'preacher', 'date', 'featured'],
    group: 'Content',
  },
  defaultSort: '-date',
  access: contentAccess,
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'youtubeUrl',
      label: 'YouTube link',
      type: 'text',
      required: true,
      admin: { description: 'Paste the YouTube video link, e.g. https://www.youtube.com/watch?v=…' },
      validate: (value: string | null | undefined) =>
        !value || /(youtube\.com|youtu\.be)\//.test(value) || 'Please paste a YouTube link',
    },
    {
      type: 'row',
      fields: [
        { name: 'date', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } } },
        { name: 'preacher', type: 'text' },
        { name: 'passage', label: 'Bible passage', type: 'text' },
      ],
    },
    { name: 'summary', type: 'textarea', admin: { description: 'One or two sentences shown on the sermon list.' } },
    { name: 'notes', label: 'Sermon notes (optional)', type: 'richText' },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Show on the home page.' } },
    slugField(),
  ],
}
