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
          label: 'Hero carousel',
          fields: [
            {
              type: 'collapsible',
              label: 'Default text (used when a slide has no heading of its own)',
              fields: [
                { name: 'heroEyebrow', label: 'Small line above heading', type: 'text' },
                { name: 'heroHeading', label: 'Heading', type: 'text', required: true },
                { name: 'heroText', label: 'Text', type: 'textarea' },
                link('heroPrimary', 'Main button'),
                link('heroSecondary', 'Second button'),
              ],
            },
            {
              name: 'heroSlides',
              label: 'Slides',
              type: 'array',
              minRows: 1,
              maxRows: 8,
              labels: { singular: 'Slide', plural: 'Slides' },
              admin: { description: 'Drag to reorder. Each slide shows an image or a short video.', initCollapsed: true },
              fields: [
                {
                  name: 'media',
                  label: 'Image or video',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'poster',
                  label: 'Video cover image',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { description: 'For videos: shown while the video loads and on phones in data-saver mode.' },
                },
                { name: 'eyebrow', label: 'Small line above heading (optional)', type: 'text' },
                { name: 'heading', label: 'Heading (optional)', type: 'text', admin: { description: 'Leave blank to use the default heading.' } },
                { name: 'text', label: 'Text (optional)', type: 'textarea' },
                {
                  type: 'row',
                  fields: [
                    { name: 'buttonLabel', label: 'Button label (optional)', type: 'text' },
                    { name: 'buttonHref', label: 'Button link', type: 'text' },
                  ],
                },
                {
                  name: 'focus',
                  label: 'Focus point',
                  type: 'select',
                  defaultValue: 'center',
                  options: [
                    { label: 'Centre', value: 'center' },
                    { label: 'Top', value: 'top' },
                    { label: 'Bottom', value: 'bottom' },
                    { label: 'Left', value: 'left' },
                    { label: 'Right', value: 'right' },
                  ],
                  admin: { description: 'Which part of the picture to keep visible on narrow screens.' },
                },
              ],
            },
            {
              name: 'heroSettings',
              label: 'Carousel settings',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'autoplay', type: 'checkbox', defaultValue: true, label: 'Play automatically' },
                    { name: 'pauseOnHover', type: 'checkbox', defaultValue: true, label: 'Pause when the mouse is over it' },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'showArrows', type: 'checkbox', defaultValue: true, label: 'Show arrows' },
                    { name: 'showDots', type: 'checkbox', defaultValue: true, label: 'Show dots and progress bar' },
                  ],
                },
                {
                  name: 'interval',
                  label: 'Seconds per image slide',
                  type: 'number',
                  defaultValue: 7,
                  min: 4,
                  max: 15,
                  admin: { description: 'Video slides always play to the end.' },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'transition',
                      type: 'select',
                      defaultValue: 'fade',
                      options: [
                        { label: 'Crossfade with slow zoom', value: 'fade' },
                        { label: 'Slide', value: 'slide' },
                        { label: 'Curtain wipe', value: 'wipe' },
                      ],
                    },
                    {
                      name: 'speed',
                      label: 'Transition speed',
                      type: 'select',
                      defaultValue: 'normal',
                      options: [
                        { label: 'Slow', value: 'slow' },
                        { label: 'Normal', value: 'normal' },
                        { label: 'Fast', value: 'fast' },
                      ],
                    },
                    {
                      name: 'overlay',
                      label: 'Overlay darkness',
                      type: 'select',
                      defaultValue: 'medium',
                      options: [
                        { label: 'Light', value: 'light' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'Strong', value: 'strong' },
                      ],
                      admin: { description: 'Darker keeps text readable on bright pictures.' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Photo strip',
          fields: [
            {
              name: 'stripPhotos',
              label: 'Moving photo strip',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: { description: 'Photos that scroll slowly across the home page. 8–14 works best. Leave empty to hide.' },
            },
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
