import type { CollectionConfig } from 'payload'

import { contentAccess } from '../access'
import { slugField } from '../fields/slug'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Content',
    description: 'Text pages such as About Us, Community Service and the policies.',
  },
  access: contentAccess,
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'intro', type: 'textarea', admin: { description: 'Short line shown under the page title.' } },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText', required: true },
    {
      name: 'highlights',
      type: 'group',
      admin: { description: 'Optional grid of short cards shown after the main text (e.g. Core Values).' },
      fields: [
        { name: 'heading', type: 'text' },
        {
          name: 'items',
          type: 'array',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'text', type: 'textarea' },
          ],
        },
      ],
    },
    { name: 'gallery', label: 'Photos (optional)', type: 'upload', relationTo: 'media', hasMany: true },
    slugField(),
  ],
}
