import type { GlobalConfig } from 'payload'

import { loggedIn } from '../access'

const link = (name: string, label: string) => ({
  name,
  type: 'group' as const,
  label,
  fields: [
    {
      type: 'row' as const,
      fields: [
        { name: 'label', type: 'text' as const },
        { name: 'href', label: 'Link', type: 'text' as const, admin: { description: 'e.g. /contact' } },
      ],
    },
  ],
})

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home page',
  admin: { group: 'Content' },
  access: { read: () => true, update: loggedIn },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            { name: 'heroEyebrow', label: 'Small line above heading', type: 'text' },
            { name: 'heroHeading', label: 'Heading', type: 'text', required: true },
            { name: 'heroText', label: 'Text', type: 'textarea' },
            { name: 'heroImage', label: 'Background image', type: 'upload', relationTo: 'media', required: true },
            link('heroPrimary', 'Main button'),
            link('heroSecondary', 'Second button'),
          ],
        },
        {
          label: 'Welcome',
          fields: [
            { name: 'welcomeHeading', type: 'text' },
            { name: 'welcomeText', type: 'textarea' },
            { name: 'welcomeImages', type: 'upload', relationTo: 'media', hasMany: true, maxRows: 2 },
            {
              name: 'pillars',
              label: 'Vision / Mission / Values',
              type: 'array',
              maxRows: 4,
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'text', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'Numbers',
          fields: [
            {
              name: 'stats',
              type: 'array',
              maxRows: 4,
              admin: { description: 'Counters that animate on scroll. Leave empty to hide.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'value', type: 'number', required: true },
                    { name: 'suffix', type: 'text', admin: { description: 'e.g. +' } },
                    { name: 'label', type: 'text', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Get involved',
          fields: [
            { name: 'involvedHeading', type: 'text' },
            { name: 'involvedText', type: 'textarea' },
            {
              name: 'involved',
              type: 'array',
              maxRows: 3,
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'text', type: 'textarea' },
                { name: 'image', type: 'upload', relationTo: 'media' },
                { name: 'href', label: 'Link', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Giving banner',
          fields: [
            { name: 'givingHeading', type: 'text' },
            { name: 'givingText', type: 'textarea' },
            { name: 'givingImage', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
}
