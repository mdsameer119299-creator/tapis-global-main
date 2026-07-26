import Link from 'next/link'
import type { SeoLanding } from '@/lib/seo-landing'
import type { CountryMarketIntelligence, SourcedClaim } from '@/lib/market-intelligence/types'
import type { ResolvedMarketIntelligenceLinks } from '@/lib/market-intelligence/links'
import { Reveal, Eyebrow } from '@/components/ui'

/**
 * Reusable Market Intelligence page template — every country uses this one
 * component. Renders the seven fixed dimensions (Buyer Behaviour, Design &
 * Style Preferences, Climate & Material Performance, Architectural Context,
 * Sustainability Expectations, Regulations & Compliance, Procurement
 * Guidance), auto-resolved internal links, and a closing commercial section.
 *
 * `ClaimText` is the compliance guardrail: a SourcedClaim with
 * status 'pending-research' never renders its raw `text` — it renders a soft,
 * honest fallback instead, so an unverified claim can never reach the page
 * just because a JSON file happened to include one.
 */
export default function MarketIntelligenceView({ country, entry, links }: { country: SeoLanding; entry: CountryMarketIntelligence; links: ResolvedMarketIntelligenceLinks }) {
  const { buyerBehaviour: bb, designPreferences: dp, climateMaterialFit: cm, architecturalContext: ac, sustainabilityExpectations: se, regulationsCompliance: rc, procurementGuidance: pg, commercial } = entry

  return (
    <article className="footer-container py-14 lg:py-20" style={{ background: '#fff' }}>
      <div className="max-w-3xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-2 text-[13px] tracking-[0.12em] uppercase" style={{ color: 'var(--inkm)' }}>
            <li><Link href="/" className="hover:text-[var(--c)]">Home</Link></li>
            <li aria-hidden>›</li>
            <li><Link href="/countries" className="hover:text-[var(--c)]">Export Markets</Link></li>
            <li aria-hidden>›</li>
            <li><Link href={`/countries/${country.slug}`} className="hover:text-[var(--c)]">{country.label}</Link></li>
            <li aria-hidden>›</li>
            <li aria-current="page" style={{ color: 'var(--c)' }}>Market Intelligence</li>
          </ol>
        </nav>

        <Eyebrow>Market Intelligence</Eyebrow>
        <h1 className="font-medium leading-[1.12] mb-4" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(30px, 4vw, 48px)', color: 'var(--ink)' }}>
          {country.label} Carpet Market Intelligence
        </h1>
        <p className="text-[18px] font-light leading-[1.85] mb-12" style={{ color: 'var(--inkm)' }}>
          Buyer behaviour, design preferences, climate, architecture, sustainability, regulations and procurement guidance for sourcing custom carpets and rugs into {country.label}.
        </p>

        <Section title="Buyer Behaviour & Procurement">
          {bb.decisionMakers.length > 0 && <TagRow items={bb.decisionMakers} />}
          <ClaimText claim={bb.procurementCycle} />
          <ClaimText claim={bb.sampleExpectations} />
          <ClaimText claim={bb.negotiationNorms} />
        </Section>

        <Section title="Design & Style Preferences">
          {dp.localNotes.map((note, i) => <ClaimText key={i} claim={note} />)}
          {links.styleArchetype && (
            links.styleArchetype.href
              ? <Link href={links.styleArchetype.href} className="inline-block mt-2 text-[15px] underline underline-offset-4" style={{ color: 'var(--c)' }}>Explore the {links.styleArchetype.label} archetype →</Link>
              : <p className="text-[14px] mt-2" style={{ color: 'var(--inkm)' }}>Style archetype: {links.styleArchetype.label}</p>
          )}
        </Section>

        <Section title="Climate & Material Performance">
          <ClaimText claim={cm.climateSummary} />
          <ClaimText claim={cm.careNotes} />
          {links.recommendedMaterials.length > 0 && <LinkChips links={links.recommendedMaterials} />}
        </Section>

        <Section title="Architectural Context">
          {ac.buildingTypes.length > 0 && <TagRow items={ac.buildingTypes} />}
          <ClaimText claim={ac.narrative} />
        </Section>

        <Section title="Sustainability Expectations">
          <ClaimText claim={se.summary} />
          {se.regulatoryDrivers && se.regulatoryDrivers.length > 0 && <TagRow items={se.regulatoryDrivers} />}
        </Section>

        <Section title="Regulations & Compliance">
          <ClaimText claim={rc.snapshot} />
          {links.importGuide && (
            <Link href={links.importGuide.href} className="inline-block mt-2 text-[15px] underline underline-offset-4" style={{ color: 'var(--c)' }}>Read the full Import &amp; Regulatory Guide →</Link>
          )}
        </Section>

        <Section title="Procurement Guidance">
          {pg.steps.length > 0 && (
            <ol className="flex flex-col gap-2 mb-3">
              {pg.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-[15.5px] font-light leading-[1.7]" style={{ color: 'var(--inkm)' }}>
                  <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-medium" style={{ background: 'var(--iv)', border: '1px solid var(--bd)', color: 'var(--gd)' }}>{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          )}
          <ClaimText claim={pg.leadTimeNote} />
          {links.companyPages.length > 0 && <LinkChips links={links.companyPages} />}
        </Section>

        {/* Commercial section — every page ends here */}
        <CommercialSection headline={commercial.headline} supportingCopy={commercial.supportingCopy} primaryCta={commercial.primaryCta} secondaryCta={commercial.secondaryCta} />

        {/* Auto internal linking */}
        <RelatedBlock title="Related Export Markets" links={links.countries} />
        <RelatedBlock title="Related Industries" links={links.industries} />
        <RelatedBlock title="Glossary" links={links.glossaryTerms} />
      </div>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal className="mb-11">
      <h2 className="font-medium leading-[1.2] mb-3" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(22px, 2.4vw, 30px)', color: 'var(--ink)' }}>{title}</h2>
      <div className="flex flex-col gap-2.5">{children}</div>
    </Reveal>
  )
}

/**
 * The compliance guardrail. A 'pending-research' claim never surfaces its
 * `text` verbatim — the page stays honest about what hasn't been verified yet
 * rather than publishing a plausible-sounding guess.
 */
function ClaimText({ claim }: { claim: SourcedClaim }) {
  if (claim.status === 'pending-research') {
    return (
      <p className="text-[15px] font-light italic leading-[1.8]" style={{ color: 'var(--inkm)' }}>
        Detailed research for this market is in progress. In the meantime, our team can advise directly on request.
      </p>
    )
  }
  return <p className="text-[16.5px] font-light leading-[1.9]" style={{ color: 'var(--inkm)' }}>{claim.text}</p>
}

function TagRow({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2.5 mb-1">
      {items.map((item) => (
        <span key={item} className="px-4 py-2 text-[14px] tracking-[0.02em] rounded-sm" style={{ background: 'var(--iv)', border: '1px solid var(--bd)', color: 'var(--inks)' }}>{item}</span>
      ))}
    </div>
  )
}

function LinkChips({ links }: { links: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2.5 mt-1">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="px-4 py-2 text-[14px] border rounded-sm transition-colors hover:border-[var(--c)] hover:text-[var(--c)]" style={{ borderColor: 'var(--bd)', color: 'var(--inks)' }}>{l.label}</Link>
      ))}
    </div>
  )
}

function CommercialSection({ headline, supportingCopy, primaryCta, secondaryCta }: { headline: string; supportingCopy: string; primaryCta: { label: string; href: string }; secondaryCta?: { label: string; href: string } }) {
  return (
    <div className="mt-6 mb-12 rounded-xl p-7" style={{ background: 'linear-gradient(135deg, rgba(107,31,31,0.14) 0%, rgba(192,155,74,0.10) 100%)', border: '1px solid rgba(192,155,74,0.22)' }}>
      <h2 className="font-medium leading-[1.2] mb-3" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(20px, 2.2vw, 26px)', color: 'var(--ink)' }}>{headline}</h2>
      <p className="text-[16px] font-light leading-[1.8] mb-5" style={{ color: 'var(--inkm)' }}>{supportingCopy}</p>
      <div className="flex flex-wrap gap-3">
        <Link href={primaryCta.href} className="px-7 py-3 text-[14px] tracking-[0.16em] uppercase font-semibold rounded-sm" style={{ background: 'var(--g)', color: 'var(--ink)' }}>{primaryCta.label}</Link>
        {secondaryCta && (
          <Link href={secondaryCta.href} className="px-7 py-3 text-[14px] tracking-[0.16em] uppercase font-medium rounded-sm border" style={{ borderColor: 'var(--bd)', color: 'var(--inks)' }}>{secondaryCta.label}</Link>
        )}
      </div>
    </div>
  )
}

function RelatedBlock({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  if (!links.length) return null
  return (
    <div className="mt-10">
      <p className="text-[13px] tracking-[0.24em] uppercase font-medium mb-3" style={{ color: 'var(--gd)' }}>{title}</p>
      <div className="flex flex-wrap gap-2.5">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="px-4 py-2 text-[14px] border rounded-sm transition-colors hover:border-[var(--c)] hover:text-[var(--c)]" style={{ borderColor: 'var(--bd)', color: 'var(--inks)' }}>{l.label}</Link>
        ))}
      </div>
    </div>
  )
}
