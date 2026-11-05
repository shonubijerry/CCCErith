import Link from 'next/link'
import type { ComponentProps } from 'react'

import { isExternal } from './nav'

type Props = Omit<ComponentProps<'a'>, 'href'> & { href: string; newTab?: boolean }

/** A menu link: Next <Link> for pages on this site, a plain <a> for everything else. */
export function NavAnchor({ href, newTab, ...rest }: Props) {
  const tab = newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  if (isExternal(href)) return <a href={href} {...tab} {...rest} />
  return <Link href={href} {...tab} {...rest} />
}
