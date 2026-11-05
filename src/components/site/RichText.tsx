import type { SerializedHeadingNode } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { RichText as LexicalRichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

import { headingId, nodeText } from '@/lib/richtext'

const withAnchors: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  heading: ({ node, nodesToJSX }) => {
    const h = node as SerializedHeadingNode
    const Tag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(h.tag) ? h.tag : 'h2') as 'h2'
    return <Tag id={headingId(nodeText(h as never))}>{nodesToJSX({ nodes: h.children })}</Tag>
  },
})

export function RichText({ data, className = 'prose', anchors = false }: { data: unknown; className?: string; anchors?: boolean }) {
  if (!data || typeof data !== 'object') return null
  return <LexicalRichText data={data as SerializedEditorState} className={className} converters={anchors ? withAnchors : undefined} />
}
