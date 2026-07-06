/**
 * HubGuidance — presentational buyer-guidance + internal-linking block for hub
 * pages. Content is passed in per hub so each page reads uniquely. This is
 * decision guidance and navigation only — it must not carry fabricated claims
 * about capacity, certifications, customers, pricing or export history.
 */
import Link from 'next/link'

export interface GuidancePoint {
  title: string
  body: string
}
export interface GuidanceLink {
  label: string
  href: string
  note?: string
}

export default function HubGuidance({
  eyebrow,
  heading,
  intro,
  points,
  linksHeading = 'Helpful guides & pages',
  links,
}: {
  eyebrow: string
  heading: string
  intro: string
  points: GuidancePoint[]
  linksHeading?: string
  links: GuidanceLink[]
}) {
  return (
    <section className="py-14 lg:py-16 px-8 max-lg:px-5">
      <div className="mx-auto max-w-5xl">
        <p className="text-[13px] tracking-[0.28em] uppercase mb-3 font-medium" style={{ color: 'var(--gd)' }}>{eyebrow}</p>
        <h2 className="font-medium leading-[1.1] mb-3" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(26px,2.8vw,36px)', color: 'var(--ink)' }}>
          {heading}
        </h2>
        <p className="text-[15.5px] font-light leading-[1.85] max-w-3xl mb-10" style={{ color: 'var(--inkm)' }}>{intro}</p>

        <div className="grid grid-cols-2 gap-x-10 gap-y-8 max-sm:grid-cols-1">
          {points.map((p) => (
            <div key={p.title}>
              <h3 className="text-[17px] font-semibold mb-2" style={{ color: 'var(--ink)' }}>{p.title}</h3>
              <p className="text-[14.5px] font-light leading-[1.8]" style={{ color: 'var(--inkm)' }}>{p.body}</p>
            </div>
          ))}
        </div>

        {links.length > 0 && (
          <div className="mt-12 border-t pt-8" style={{ borderColor: 'var(--bd)' }}>
            <h3 className="text-[13px] tracking-[0.2em] uppercase mb-4 font-medium" style={{ color: 'var(--inks)' }}>{linksHeading}</h3>
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2.5 max-sm:grid-cols-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[15px] font-medium hover:underline" style={{ color: 'var(--c)' }}>
                    {l.label}
                  </Link>
                  {l.note && <span className="text-[13.5px] ml-1.5" style={{ color: 'var(--inkm)' }}>— {l.note}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
