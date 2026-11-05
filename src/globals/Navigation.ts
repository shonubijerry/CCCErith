import type { GlobalConfig } from 'payload'

import { loggedIn } from '../access'
import { linkFields } from '../fields/link'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  admin: {
    group: 'Settings',
    description: 'Drag items to reorder them. The Give button in the header is fixed and not part of this menu.',
  },
  access: { read: () => true, update: loggedIn },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Header menu',
          fields: [
            {
              name: 'headerItems',
              label: 'Menu items',
              type: 'array',
              maxRows: 8,
              labels: { singular: 'Menu item', plural: 'Menu items' },
              admin: {
                initCollapsed: true,
                components: { RowLabel: '/components/admin/NavRowLabel#NavRowLabel' },
                description: 'Up to 8 items. Add sub-items to make a dropdown.',
              },
              fields: [
                ...linkFields({ optional: true }),
                {
                  name: 'children',
                  label: 'Dropdown items',
                  type: 'array',
                  maxRows: 10,
                  labels: { singular: 'Dropdown item', plural: 'Dropdown items' },
                  admin: {
                    initCollapsed: true,
                    components: { RowLabel: '/components/admin/NavRowLabel#NavRowLabel' },
                    description: 'Up to 10. Leave empty for a plain link.',
                  },
                  fields: linkFields(),
                },
              ],
            },
          ],
        },
        {
          label: 'Footer',
          fields: [
            {
              name: 'footerColumns',
              label: 'Link columns',
              type: 'array',
              minRows: 2,
              maxRows: 2,
              labels: { singular: 'Column', plural: 'Columns' },
              admin: {
                components: { RowLabel: '/components/admin/NavRowLabel#NavRowLabel' },
                description: 'The two link columns in the footer. "Visit us" comes from Site settings.',
              },
              fields: [
                { name: 'heading', type: 'text', required: true },
                {
                  name: 'links',
                  type: 'array',
                  maxRows: 12,
                  admin: { initCollapsed: true, components: { RowLabel: '/components/admin/NavRowLabel#NavRowLabel' } },
                  fields: linkFields(),
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
