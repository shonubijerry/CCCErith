import type { CollectionConfig } from 'payload'

import { contentAccess } from '../access'

export const Departments: CollectionConfig = {
  slug: 'departments',
  labels: { singular: 'Team department', plural: 'Team departments' },
  admin: { useAsTitle: 'name', group: 'Our team', description: 'Groups on the Our Team page. Drag to reorder.' },
  orderable: true,
  access: contentAccess,
  fields: [{ name: 'name', type: 'text', required: true }],
}

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  labels: { singular: 'Team member', plural: 'Team members' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'department', 'featured'],
    group: 'Our team',
    description: 'Drag to reorder within the list. Change "Department" to move someone.',
  },
  orderable: true,
  access: contentAccess,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'churchTitle', label: 'Church title', type: 'text', admin: { description: 'e.g. V/S/E, M/C, Sis.' } },
        { name: 'name', type: 'text', required: true },
      ],
    },
    { name: 'role', type: 'text', required: true, admin: { description: 'e.g. Choir Master' } },
    { name: 'department', type: 'relationship', relationTo: 'departments', required: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'bio', type: 'textarea' },
    {
      name: 'featured',
      label: 'Featured leader',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Shown in large cards at the top of the page.' },
    },
  ],
}
