import type { CollectionConfig } from 'payload'

import { contentAccess } from '../access'
import { slugField } from '../fields/slug'

export const Ministries: CollectionConfig = {
  slug: 'ministries',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'updatedAt'], group: 'Content' },
  orderable: true,
  access: contentAccess,
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'excerpt', type: 'textarea', required: true, admin: { description: 'Short description for the ministry cards.' } },
    { name: 'body', label: 'Full description', type: 'richText' },
    {
      name: 'meetingTimes',
      type: 'array',
      labels: { singular: 'Meeting time', plural: 'Meeting times' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'when', type: 'text' },
          ],
        },
      ],
    },
    { name: 'location', type: 'text', defaultValue: 'Church premises' },
    slugField(),
  ],
}
