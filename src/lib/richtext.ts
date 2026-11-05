import { slugify } from '@/fields/slug'

type Node = { type?: string; tag?: string; text?: string; children?: Node[] }

export const nodeText = (n: Node): string => (n.text ?? '') + (n.children ?? []).map(nodeText).join('')

export const headingId = (text: string) => slugify(text).slice(0, 60)

/** h2/h3 headings in a Lexical document, for an "On this page" list. */
export function headingsOf(data: unknown): { id: string; text: string; level: number }[] {
  const root = (data as { root?: Node } | null)?.root
  if (!root?.children) return []
  return root.children
    .filter((n) => n.type === 'heading' && (n.tag === 'h2' || n.tag === 'h3'))
    .map((n) => {
      const text = nodeText(n).trim()
      return { id: headingId(text), text, level: n.tag === 'h2' ? 2 : 3 }
    })
    .filter((h) => h.text)
}
