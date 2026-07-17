import Link from 'next/link'
import type { SeoLanding } from '@/lib/seo-landing'
import { TARA_MATERIALS, TARA_CONSTRUCTIONS } from '@/lib/tara/knowledge'
import { EXPORT_CAPABILITY } from '@/lib/export-capability'
import { Reveal, Eyebrow } from '@/components/ui'

/**
 * Market-page deep-dive: import process, shipping, lead time, popular styles,
 * buyer segments, custom sizes and material recommendations for a single
 * country, USA state or USA city page. Purely additive — rendered alongside
 * <LandingPage>, which keeps its own hero/overview/applications/FAQ sections
 * untouched. Renders nothing for SeoLanding entries that don't carry this
 * optional content (industries, solutions, dhurries, company, india, and any
 * country/state/city not yet deep-dived).
 */
export default function MarketDeepDive({ page }: { page: SeoLanding }) {
  const hasContent = page.importProcess || page.shipping || page.leadTime || (page.popularStyles?.length ?? 0) > 0 || (page.buyerSegments?.length ?? 0) > 0
  if (!hasContent) return null

  const materials = (page.materialRecommendations ?? [])
    .map((id) => TARA_MATERIALS.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m))

  const constructions = (page.constructionRecommendations ?? [])
    .map((id) => TARA_CONSTRUCTIONS.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))

  const importCols = [page.importProcess, page.shipping, page.leadTime].filter(Boolean).length

  return (
    <>
      {/* ── Import process, shipping & lead time ── */}
      {(page.importProcess || page.shipping || page.leadTime) && (
        <section className="py-14 lg:py-20 footer-container" style={{ background: 'var(--iv)' }}>
          <Reveal>
            <Eyebrow>Sourcing from India</Eyebrow>
            <h2 className="font-medium leading-[1.1] mb-10" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(26px, 2.8vw, 38px)', color: 'var(--ink)' }}>
              Import Process &amp; <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>Shipping to {page.label}</em>
            </h2>
          </Reveal>
          <div className={`grid grid-cols-1 ${importCols >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-8 max-w-5xl`}>
            {page.importProcess && (
              <Reveal>
                <h3 className="text-[18px] font-medium mb-2" style={{ color: 'var(--inks)' }}>Import Process</h3>
                <p className="text-[16px] font-light leading-[1.85]" style={{ color: 'var(--inkm)' }}>{page.importProcess}</p>
              </Reveal>
            )}
            {page.shipping && (
              <Reveal delay={40}>
                <h3 className="text-[18px] font-medium mb-2" style={{ color: 'var(--inks)' }}>Shipping &amp; Logistics</h3>
                <p className="text-[16px] font-light leading-[1.85]" style={{ color: 'var(--inkm)' }}>{page.shipping}</p>
              </Reveal>
            )}
            {page.leadTime && (
              <Reveal delay={80}>
                <h3 className="text-[18px] font-medium mb-2" style={{ color: 'var(--inks)' }}>Lead Time</h3>
                <p className="text-[16px] font-light leading-[1.85]" style={{ color: 'var(--inkm)' }}>{page.leadTime}</p>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* ── Popular styles ── */}
      {page.popularStyles && page.popularStyles.length > 0 && (
        <section className="py-14 lg:py-16 footer-container" style={{ background: '#fff' }}>
          <Reveal>
            <Eyebrow>Design Direction</Eyebrow>
            <h2 className="font-medium leading-[1.1] mb-8" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(26px, 2.8vw, 38px)', color: 'var(--ink)' }}>
              Popular Styles in <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>{page.label}</em>
            </h2>
          </Reveal>
          <div className="flex flex-wrap gap-3">
            {page.popularStyles.map((style) => (
              <span
                key={style}
                className="px-5 py-2.5 text-[15px] tracking-[0.04em] rounded-sm"
                style={{ background: 'var(--iv)', border: '1px solid var(--bd)', color: 'var(--inks)' }}
              >
                {style}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Buyer segments (6 for countries; up to 10 for USA state/city pages) ── */}
      {page.buyerSegments && page.buyerSegments.length > 0 && (
        <section className="py-14 lg:py-20 footer-container" style={{ background: 'var(--iv)' }}>
          <Reveal>
            <Eyebrow>Who We Supply</Eyebrow>
            <h2 className="font-medium leading-[1.1] mb-10" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(26px, 2.8vw, 38px)', color: 'var(--ink)' }}>
              Buyers We Serve in <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>{page.label}</em>
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {page.buyerSegments.map((seg, i) => (
              <Reveal key={seg.label} delay={i * 40}>
                <div className="h-full rounded-lg p-6" style={{ background: '#fff', border: '1px solid var(--bd)' }}>
                  <h3 className="text-[16px] font-medium mb-2" style={{ color: 'var(--inks)' }}>{seg.label}</h3>
                  <p className="text-[15px] font-light leading-[1.72]" style={{ color: 'var(--inkm)' }}>{seg.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── Custom sizes & material recommendations ── */}
      {(page.customSizesNote || materials.length > 0) && (
        <section className="py-14 lg:py-20 footer-container" style={{ background: '#fff' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {page.customSizesNote && (
              <Reveal>
                <Eyebrow>Custom Sizes</Eyebrow>
                <h2 className="font-medium leading-[1.1] mb-5" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(24px, 2.6vw, 32px)', color: 'var(--ink)' }}>
                  Made to <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>Your Dimensions</em>
                </h2>
                <p className="text-[16px] font-light leading-[1.85]" style={{ color: 'var(--inkm)' }}>{page.customSizesNote}</p>
              </Reveal>
            )}
            {materials.length > 0 && (
              <Reveal delay={40}>
                <Eyebrow>Material Guidance</Eyebrow>
                <h2 className="font-medium leading-[1.1] mb-5" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(24px, 2.6vw, 32px)', color: 'var(--ink)' }}>
                  Materials Suited to <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>{page.label}</em>
                </h2>
                <div className="flex flex-wrap gap-3">
                  {materials.map((m) => (
                    <Link
                      key={m.id}
                      href={`/materials/${m.id}`}
                      className="px-5 py-2.5 text-[15px] tracking-[0.04em] border rounded-sm transition-colors duration-200 hover:border-[var(--c)] hover:text-[var(--c)]"
                      style={{ borderColor: 'var(--bd)', color: 'var(--inks)' }}
                    >
                      {m.name}
                    </Link>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* ── Constructions & reference ── */}
      {/* Glossary link is intentionally independent of `constructions` data —
          it's a generic, always-relevant reference for any page this
          component renders on (hasContent is already guaranteed true here). */}
      <section className="py-14 lg:py-16 footer-container" style={{ background: 'var(--iv)' }}>
        <Reveal>
          <Eyebrow>Construction Guidance</Eyebrow>
          {constructions.length > 0 && (
            <h2 className="font-medium leading-[1.1] mb-5" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(24px, 2.6vw, 32px)', color: 'var(--ink)' }}>
              Constructions Suited to <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>{page.label}</em>
            </h2>
          )}
          <div className="flex flex-wrap gap-3">
            {constructions.map((c) => (
              <Link
                key={c.id}
                href={`/constructions/${c.id}`}
                className="px-5 py-2.5 text-[15px] tracking-[0.04em] border rounded-sm transition-colors duration-200 hover:border-[var(--c)] hover:text-[var(--c)]"
                style={{ borderColor: 'var(--bd)', color: 'var(--inks)' }}
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/glossary"
              className="px-5 py-2.5 text-[15px] tracking-[0.04em] border rounded-sm transition-colors duration-200 hover:border-[var(--c)] hover:text-[var(--c)]"
              style={{ borderColor: 'var(--bd)', color: 'var(--inks)' }}
            >
              Carpet &amp; Rug Glossary
            </Link>
            </div>
          </Reveal>
        </section>

      {/* ── Shared capability band (MOQ / production / delivery) ── */}
      <section className="py-14 lg:py-16 footer-container" style={{ background: 'var(--ink)' }}>
        <Reveal>
          <div className="flex items-center gap-3 mb-8">
            <span className="block h-px w-8" style={{ background: 'rgba(192,155,74,0.5)' }} />
            <span className="text-[14px] tracking-[0.32em] uppercase font-medium" style={{ color: 'var(--gl)' }}>
              Manufacturing Capability
            </span>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {Object.values(EXPORT_CAPABILITY).map((c, i) => (
            <Reveal key={c.label} delay={i * 40}>
              <h3 className="text-[16px] font-medium mb-2" style={{ color: '#fff' }}>{c.label}</h3>
              <p className="text-[14.5px] font-light leading-[1.7]" style={{ color: 'rgba(255,255,255,0.6)' }}>{c.body}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
