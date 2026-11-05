import type { CollectionConfig } from 'payload'

import { adminOnly, adminOnlyField, adminOrSelf } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Team login', plural: 'Team logins' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Settings',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  access: {
    read: adminOrSelf,
    create: adminOnly,
    update: adminOrSelf,
    delete: adminOnly,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin (can add other logins)', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: { update: adminOnlyField, create: adminOnlyField },
      saveToJWT: true,
    },
  ],
}
