import type { Field } from 'payload'

const URL_PATTERN = /^(\/|https?:\/\/|mailto:|tel:)/

export const validateUrl = (value: unknown, linkType: unknown) => {
  if (linkType !== 'url') return true
  if (typeof value !== 'string' || !value.trim()) return 'Enter a link, e.g. /sermons'
  return URL_PATTERN.test(value.trim()) || 'Links must start with /, https://, mailto: or tel:'
}

/**
 * Label + link fields for a menu item. `optional` adds a "No link" choice,
 * used for dropdown parents that only open their dropdown.
 */
export const linkFields = ({ optional = false }: { optional?: boolean } = {}): Field[] => [
  {
    type: 'row',
    fields: [
      { name: 'label', type: 'text', required: true, admin: { width: '50%' } },
      {
        name: 'linkType',
        label: 'Links to',
        type: 'select',
        required: true,
        defaultValue: 'url',
        options: [
          { label: 'Custom URL', value: 'url' },
          { label: 'Page', value: 'page' },
          ...(optional ? [{ label: 'No link (just opens the dropdown)', value: 'none' }] : []),
        ],
        admin: { width: '50%' },
      },
    ],
  },
  {
    type: 'row',
    fields: [
      {
        name: 'page',
        type: 'relationship',
        relationTo: 'pages',
        required: true,
        admin: { width: '50%', condition: (_, sibling) => sibling?.linkType === 'page' },
      },
      {
        name: 'url',
        label: 'URL',
        type: 'text',
        validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) => validateUrl(value, siblingData?.linkType),
        admin: {
          width: '50%',
          description: 'e.g. /sermons or https://youtube.com/…',
          condition: (_, sibling) => sibling?.linkType === 'url',
        },
      },
      {
        name: 'newTab',
        label: 'Open in new tab',
        type: 'checkbox',
        defaultValue: false,
        admin: { width: '50%', style: { alignSelf: 'center' }, condition: (_, sibling) => sibling?.linkType !== 'none' },
      },
    ],
  },
]
