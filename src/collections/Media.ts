import type { CollectionConfig } from 'payload'

import { contentAccess } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image or video', plural: 'Images & videos' },
  admin: { group: 'Content', defaultColumns: ['filename', 'alt', 'updatedAt'] },
  access: contentAccess,
  fields: [
    {
      name: 'alt',
      label: 'Description',
      type: 'text',
      required: true,
      admin: { description: 'Describe the photo or video in a few words, for screen readers and search engines. Keep videos short (under 15 seconds) and small (under 5 MB).' },
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
    // Image resizing (sharp) is not available on Workers; resizing happens at the edge instead.
    crop: false,
    focalPoint: false,
  },
}
