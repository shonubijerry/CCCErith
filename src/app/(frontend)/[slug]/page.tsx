import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Reveal } from '@/components/motion/Reveal'
import { Icon } from '@/components/site/Icon'
import { PageHero } from '@/components/site/PageHero'
import { RichText } from '@/components/site/RichText'
import { getPageBySlug } from '@/lib/payload'
import { headingsOf } from '@/lib/richtext'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPageBySlug((await params).slug)
  if (!page) return {}
  return { title: page.title, description: page.intro ?? undefined }
}

/** Text pages (policies etc.): a comfortable reading layout with an "On this page" list. */
export default async function TextPage({ params }: Props) {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) notFound()
  const toc = headingsOf(page.content)
  const isSafeguarding = slug === 'safeguarding-policy'

  return (
    <>
      <PageHero eyebrow={/policy/.test(slug) ? 'Policy' : undefined} title={page.title} intro={page.intro} image={page.heroImage} />
      <section className="section">
        <div className="container">
          <div className="reading" style={toc.length < 2 ? { gridTemplateColumns: 'minmax(0, 760px)' } : undefined}>
            {toc.length >= 2 ? (
              <Reveal as="div" className="toc" direction="left">
                <nav aria-label="On this page">
                  <h2>On this page</h2>
                  <ol>
                    {toc.map((h) => (
                      <li key={h.id} style={h.level === 3 ? { paddingLeft: 12 } : undefined}>
                        <a href={`#${h.id}`}>{h.text}</a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </Reveal>
            ) : null}
            <div>
              <Reveal>
                <RichText data={page.content} anchors />
              </Reveal>
              {isSafeguarding ? (
                <Reveal className="concern">
                  <h3>Report a concern</h3>
                  <p>If you are worried about a child, young person or vulnerable adult, tell us straight away. If someone is in immediate danger, call 999.</p>
                  <Link href="/contact" className="btn btn--white">Contact us confidentially <Icon name="arrow" /></Link>
                </Reveal>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
