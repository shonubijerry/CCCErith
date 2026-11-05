import type { GlobalConfig } from 'payload'

import { loggedIn } from '../access'
import { iconField } from '../fields/icons'

export const CommunityPage: GlobalConfig = {
  slug: 'community-page',
  label: 'Community Service page',
  admin: { group: 'Content' },
  access: { read: () => true, update: loggedIn },
  fields: [
    { name: 'intro', type: 'textarea', required: true },
    { name: 'text', type: 'richText', required: true },
    { name: 'photos', type: 'upload', relationTo: 'media', hasMany: true, maxRows: 6 },
    { name: 'programmesHeading', type: 'text', defaultValue: 'Our outreach and community programmes' },
    { name: 'programmes', type: 'array', fields: [{ name: 'title', type: 'text', required: true }, iconField()] },
    {
      name: 'charity',
      label: 'Charity details',
      type: 'group',
      fields: [
        { name: 'legalName', type: 'text' },
        { name: 'number', label: 'Registration number', type: 'text' },
        { name: 'address', type: 'text' },
        { name: 'governingDocument', type: 'text' },
        { name: 'registerUrl', label: 'Charity Commission register link', type: 'text' },
      ],
    },
  ],
}
