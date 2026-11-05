import type { GlobalConfig } from 'payload'

import { loggedIn } from '../access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'Settings' },
  access: { read: () => true, update: loggedIn },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Church details',
          fields: [
            { name: 'churchName', type: 'text', required: true },
            { name: 'shortName', type: 'text', required: true, admin: { description: 'Shown next to the logo, e.g. "Erith Parish".' } },
            { name: 'tagline', type: 'text' },
            { name: 'address', type: 'textarea', required: true },
            { name: 'mapsUrl', label: 'Google Maps link', type: 'text' },
            {
              type: 'row',
              fields: [
                { name: 'email', type: 'email', required: true },
                { name: 'phone', type: 'text' },
              ],
            },
            { name: 'officeHours', type: 'text', admin: { description: 'e.g. Monday – Sunday, 9am – 7pm' } },
            { name: 'charityNumber', type: 'text' },
          ],
        },
        {
          label: 'Social media',
          fields: [
            { name: 'facebook', type: 'text' },
            { name: 'instagram', type: 'text' },
            { name: 'youtube', type: 'text' },
            { name: 'tiktok', type: 'text' },
          ],
        },
        {
          label: 'Giving',
          fields: [
            { name: 'givingIntro', type: 'textarea' },
            { name: 'paypalUrl', label: 'PayPal donate link', type: 'text', admin: { description: 'Until this is filled in, the Give page shows "Online giving coming soon".' } },
            { name: 'inPersonText', label: 'Giving in person', type: 'textarea' },
          ],
        },
      ],
    },
  ],
}
