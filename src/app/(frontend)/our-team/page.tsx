import type { Metadata } from 'next'

import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { Curve } from '@/components/site/Curve'
import { DeptAccordion } from '@/components/site/DeptAccordion'
import { MediaImage } from '@/components/site/MediaImage'
import { PageHero } from '@/components/site/PageHero'
import { RichText } from '@/components/site/RichText'
import { getPageBySlug, getTeam } from '@/lib/payload'
import type { TeamMember } from '@/payload-types'

export const metadata: Metadata = { title: 'Our Team', description: 'The ministers and church workers who lead CCC Noah’s Ark Erith Parish.' }

const initials = (name: string) =>
  name
    .replace(/\(.*?\)/g, '')
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w) && !/[/.]/.test(w))
    .slice(-2)
    .map((w) => w[0])
    .join('')

const fullName = (m: TeamMember) => [m.churchTitle, m.name].filter(Boolean).join(' ')

export default async function TeamPage() {
  const [{ departments, members }, intro] = await Promise.all([getTeam(), getPageBySlug('our-team')])
  const featured = members.filter((m) => m.featured)
  const groups = departments
    .map((d) => ({ dept: d, people: members.filter((m) => !m.featured && (typeof m.department === 'object' ? m.department?.id : m.department) === d.id) }))
    .filter((g) => g.people.length)

  return (
    <>
      <PageHero eyebrow="Leadership" title={intro?.title ?? 'Our Team'} intro={intro?.intro} />

      {intro?.content ? (
        <section className="section section--tight">
          <div className="container container--narrow center">
            <Reveal>
              <RichText data={intro.content} className="prose lead" />
            </Reveal>
          </div>
        </section>
      ) : null}

      {featured.length ? (
        <section className="section band">
          <Curve position="top" color="#fff" />
          <div className="container">
            <Stagger className="leaders">
              {featured.map((m) => (
                <StaggerItem key={m.id} className="leader">
                  <div className="leader__photo" style={{ position: 'relative' }}>
                    {m.photo ? <MediaImage media={m.photo} sizes="170px" /> : <span className="initials">{initials(m.name)}</span>}
                  </div>
                  {m.churchTitle ? <div className="leader__title">{m.churchTitle}</div> : null}
                  <h3>{m.name}</h3>
                  <p>{m.role}</p>
                  {m.bio ? <p style={{ marginTop: 12, fontSize: '0.95rem' }}>{m.bio}</p> : null}
                </StaggerItem>
              ))}
            </Stagger>
          </div>
          <Curve position="bottom" color="#fff" />
        </section>
      ) : null}

      <section className="section">
        <div className="container">
          {groups.map(({ dept, people }, i) => (
            <Reveal key={dept.id}>
              <DeptAccordion title={dept.name} count={people.length} defaultOpen={i === 0}>
                <Stagger className="members">
                  {people.map((m) => (
                    <StaggerItem key={m.id} className="member">
                      <span className="member__avatar" style={{ position: 'relative' }}>
                        {m.photo ? <MediaImage media={m.photo} sizes="52px" /> : initials(m.name)}
                      </span>
                      <span>
                        <span className="member__name" style={{ display: 'block' }}>{fullName(m)}</span>
                        <span className="member__role">{m.role}</span>
                      </span>
                    </StaggerItem>
                  ))}
                </Stagger>
              </DeptAccordion>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
