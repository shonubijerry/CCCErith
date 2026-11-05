import type { CollectionConfig } from 'payload'

import { loggedIn } from '../access'

export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  labels: { singular: 'Contact message', plural: 'Contact messages' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'subject', 'createdAt'],
    group: 'Inbox',
    description: 'Messages sent through the website contact form. A copy is also emailed.',
  },
  defaultSort: '-createdAt',
  access: {
    read: loggedIn,
    create: () => false, // only the website's contact route creates these
    update: loggedIn,
    delete: loggedIn,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    { name: 'subject', type: 'text' },
    { name: 'message', type: 'textarea', required: true },
    { name: 'emailed', type: 'checkbox', admin: { readOnly: true, description: 'Whether the email copy was sent.' } },
    { name: 'handled', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
  ],
}
