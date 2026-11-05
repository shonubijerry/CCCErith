import type { CollectionConfig } from 'payload'

import { contentAccess } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image', plural: 'Images' },
  admin: { group: 'Content', defaultColumns: ['filename', 'alt', 'updatedAt'] },
  access: contentAccess,
  fields: [
    {
      name: 'alt',
      label: 'Description',
      type: 'text',
      required: true,
      admin: { description: 'Describe the photo in a few words, for screen readers and search engines.' },
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    // Image resizing (sharp) is not available on Workers; resizing happens at the edge instead.
    crop: false,
    focalPoint: false,
  },
}
