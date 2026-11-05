import type { GlobalConfig } from 'payload'

import { loggedIn } from '../access'
import { iconField } from '../fields/icons'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'About Us page',
  admin: { group: 'Content' },
  access: { read: () => true, update: loggedIn },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Header',
          fields: [
            { name: 'intro', type: 'textarea', required: true },
            { name: 'heroPhotos', label: 'Header photos (3)', type: 'upload', relationTo: 'media', hasMany: true, maxRows: 3 },
          ],
        },
        {
          label: 'Who we are',
          fields: [
            { name: 'whoHeading', type: 'text', defaultValue: 'Who we are' },
            { name: 'whoText', type: 'richText', required: true },
            { name: 'whoPhotos', label: 'Photos (3)', type: 'upload', relationTo: 'media', hasMany: true, maxRows: 3 },
          ],
        },
        {
          label: 'Quote',
          fields: [
            { name: 'quote', type: 'textarea' },
            { name: 'quoteCite', label: 'Quote source', type: 'text' },
          ],
        },
        {
          label: 'Our story',
          fields: [
            { name: 'storyHeading', type: 'text', defaultValue: 'Our story' },
            {
              name: 'storySteps',
              label: 'Story steps',
              type: 'array',
              admin: { description: 'Shown as a timeline, alternating left and right.' },
              fields: [
                { name: 'label', label: 'Small label (e.g. a year or "Today")', type: 'text' },
                { name: 'title', type: 'text', required: true },
                { name: 'text', type: 'textarea', required: true },
                { name: 'image', type: 'upload', relationTo: 'media' },
              ],
            },
          ],
        },
        {
          label: 'Beliefs & values',
          fields: [
            { name: 'beliefsHeading', type: 'text', defaultValue: 'Our core beliefs' },
            { name: 'beliefs', type: 'array', fields: [{ name: 'title', type: 'text', required: true }, iconField()] },
            { name: 'valuesHeading', type: 'text', defaultValue: 'Our core values' },
            {
              name: 'values',
              type: 'array',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'text', type: 'textarea' },
              ],
            },
          ],
        },
        {
          label: 'Leadership',
          fields: [
            { name: 'showLeaders', label: 'Show featured leaders', type: 'checkbox', defaultValue: true },
            { name: 'leadersText', type: 'textarea' },
          ],
        },
      ],
    },
  ],
}
