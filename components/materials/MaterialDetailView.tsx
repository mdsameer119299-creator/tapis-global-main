import Link from 'next/link'
import type { TaraMaterial } from '@/lib/tara/knowledge/types'
import { DURABILITY_WORDS, SOFTNESS_WORDS, LUXURY_WORDS, ratingWord } from '@/lib/tara/knowledge/types'
import type { MaterialPageMeta } from '@/lib/materials-content'
import { getMaterialAlternativeLinks, getConstructionsUsingMaterial, getProjectLinks } from '@/lib/reference-links'
import { getKnowledgeArticlesFor } from '@/lib/knowledge/links'
import { Reveal, Eyebrow } from '@/components/ui'
import OptimizedImage from '@/components/ui/OptimizedImage'

export default function MaterialDetailView({ material, meta }: { material: TaraMaterial; meta: MaterialPageMeta }) {
  const profile = material.profile!
  const { materials: altMaterials, guide: comparisonGuide } = getMaterialAlternativeLinks(material.id, profile.alternatives)
  const usedInConstructions = getConstructionsUsingMaterial(material.id)
  const { industries, solutions } = getProjectLinks(profile.recommendedProjects)
  const relatedArticles = getKnowledgeArticlesFor({ material: material.id })

  return (
    <article>
      <section className="relative overflow-hidden min-h-[46vh] max-lg:min-h-[40vh] flex items-end">
        <div className="absolute inset-0">
          <div className="relative w-full h-full fill-frame">
            <OptimizedImage src={meta.heroImage} alt={`${material.name} — Tapis Global International, Bhadohi`} fill priority tone="hero" sizes="100vw" className="object-cover" />
          </div>
        </div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,8,6,0.95) 0%, rgba(10,8,6,0.5) 55%, rgba(10,8,6,0.3) 100%)' }} />
        <div className="relative z-[2] footer-container pb-14 pt-32 max-w-4xl">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-2 text-[13px] tracking-[0.14em] uppercase" style={{ color: 'rgba(248,244,238,0.55)' }}>
              <li><Link href="/" className="hover:text-[var(--gl)] transition-colors">Home</Link></li>
              <li aria-hidden>›</li>
              <li><Link href="/materials" className="hover:text-[var(--gl)] transition-colors">Materials</Link></li>
              <li aria-hidden>›</li>
              <li aria-current="page" style={{ color: 'var(--gl)' }}>{material.name}</li>
            </ol>
          </nav>
          <p className="text-[15px] tracking-[0.32em] uppercase mb-3" style={{ color: 'var(--gl)' }}>{material.positioning} Tier · Material Guide</p>
          <h1 className="font-display font-light leading-[1.05] mb-4" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(32px, 4vw, 56px)', color: '#fff' }}>{material.name}</h1>
          <p className="text-[17px] font-light leading-[1.85] mb-2 max-w-2xl" style={{ color: 'rgba(248,244,238,0.62)' }}>{profile.description}</p>
        </div>
      </section>

      {/* At a glance */}
      <section className="py-14 lg:py-16 footer-container" style={{ background: 'var(--iv)' }}>
        <Reveal>
          <Eyebrow>At a Glance</Eyebrow>
        </Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-14">
          {[
            { label: 'Positioning', value: material.positioning },
            { label: 'Durability', value: capitalize(ratingWord(DURABILITY_WORDS, profile.durability)) },
            { label: 'Softness', value: capitalize(ratingWord(SOFTNESS_WORDS, profile.softness)) },
            { label: 'Luxury Level', value: capitalize(ratingWord(LUXURY_WORDS, profile.luxuryLevel)) },
          ].map((s) => (
            <div key={s.label} className="rounded-lg p-5" style={{ background: '#fff', border: '1px solid var(--bd)' }}>
              <p className="text-[12px] tracking-[0.2em] uppercase mb-1.5" style={{ color: 'var(--gd)' }}>{s.label}</p>
              <p className="text-[17px] font-medium" style={{ color: 'var(--inks)' }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl">
          <div>
            <h2 className="font-medium leading-[1.15] mb-4" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(22px, 2.4vw, 28px)', color: 'var(--ink)' }}>Advantages</h2>
            <ul className="flex flex-col gap-2.5">
              {profile.advantages.map((a) => (
                <li key={a} className="flex items-start gap-3 text-[15.5px] font-light leading-[1.7]" style={{ color: 'var(--inkm)' }}>
                  <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rotate-45" style={{ background: 'var(--g)' }} aria-hidden />{a}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-medium leading-[1.15] mb-4" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(22px, 2.4vw, 28px)', color: 'var(--ink)' }}>Considerations</h2>
            <ul className="flex flex-col gap-2.5">
              {profile.disadvantages.map((d) => (
                <li key={d} className="flex items-start gap-3 text-[15.5px] font-light leading-[1.7]" style={{ color: 'var(--inkm)' }}>
                  <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rotate-45" style={{ background: 'var(--bd)' }} aria-hidden />{d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Applications & care */}
      <section className="py-14 lg:py-16 footer-container" style={{ background: '#fff' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl">
          <div>
            <Reveal><Eyebrow>Typical Applications</Eyebrow></Reveal>
            <ul className="flex flex-wrap gap-2.5 mt-4">
              {profile.typicalApplications.map((t) => (
                <li key={t} className="px-4 py-2 text-[14px] rounded-full" style={{ background: 'var(--iv)', border: '1px solid var(--bd)', color: 'var(--inks)' }}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <Reveal><Eyebrow>Care & Maintenance</Eyebrow></Reveal>
            <p className="text-[15.5px] font-light leading-[1.8] mt-4" style={{ color: 'var(--inkm)' }}>{profile.maintenance}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 lg:py-16 footer-container">
        <div className="rounded-xl p-9 lg:p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(107,31,31,0.16) 0%, rgba(192,155,74,0.10) 100%)', border: '1px solid rgba(192,155,74,0.22)' }}>
          <Reveal>
            <p className="text-[15px] tracking-[0.28em] uppercase mb-3 font-medium" style={{ color: 'var(--gd)' }}>Manufacturer · Supplier · Exporter</p>
            <h2 className="font-medium leading-[1.08] mb-4 max-w-2xl" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(26px, 2.8vw, 38px)', color: 'var(--ink)' }}>Discuss a {material.name} Project</h2>
            <p className="text-[16px] font-light leading-[1.82] max-w-2xl mb-8" style={{ color: 'var(--inkm)' }}>Manufactured to order in Bhadohi, India. Request our catalogue, get a quote, or share your project for a recommendation.</p>
            <div className="flex flex-wrap gap-3.5">
              <Link href="/catalogue" className="px-9 py-3.5 text-[15px] tracking-[0.18em] uppercase font-semibold rounded-sm transition-all duration-300 hover:brightness-110" style={{ background: 'var(--g)', color: 'var(--ink)' }}>Request Catalogue</Link>
              <Link href="/contact" className="px-9 py-3.5 text-[15px] tracking-[0.18em] uppercase font-medium rounded-sm border transition-colors duration-300 hover:border-[var(--c)] hover:text-[var(--c)]" style={{ borderColor: 'var(--bd)', color: 'var(--inks)' }}>Get Quote</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Related */}
      <section className="py-14 lg:py-16 footer-container" style={{ background: '#fff' }}>
        {usedInConstructions.length > 0 && (
          <RelatedBlock title="Constructions That Use This Material" links={usedInConstructions} />
        )}
        {altMaterials.length > 0 && (
          <RelatedBlock title="Alternative Materials" links={altMaterials} extra={comparisonGuide} />
        )}
        {industries.length > 0 && (
          <RelatedBlock title="Industries That Commonly Use This Material" links={industries} />
        )}
        {solutions.length > 0 && (
          <RelatedBlock title="Related Solutions" links={solutions} />
        )}
        {relatedArticles.length > 0 && (
          <RelatedBlock title="Related Reading" links={relatedArticles} />
        )}
        <Reveal>
          <div className="mt-10 flex flex-wrap gap-6">
            <Link href="/materials" className="inline-flex items-center gap-3 text-[15px] tracking-[0.16em] uppercase transition-colors duration-200 hover:text-[var(--c)] group" style={{ color: 'var(--inks)' }}>
              All Materials <span className="block h-px w-8 bg-current transition-all duration-300 group-hover:w-12" />
            </Link>
            <Link href="/constructions" className="inline-flex items-center gap-3 text-[15px] tracking-[0.16em] uppercase transition-colors duration-200 hover:text-[var(--c)] group" style={{ color: 'var(--inks)' }}>
              All Constructions <span className="block h-px w-8 bg-current transition-all duration-300 group-hover:w-12" />
            </Link>
          </div>
        </Reveal>
      </section>
    </article>
  )
}

function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1) }

function RelatedBlock({ title, links, extra }: { title: string; links: { label: string; href: string }[]; extra?: { label: string; href: string } | null }) {
  return (
    <div className="mt-12">
      <Reveal><Eyebrow>{title}</Eyebrow></Reveal>
      <div className="flex flex-wrap gap-3 mt-4">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="px-5 py-2.5 text-[15px] tracking-[0.04em] border rounded-sm transition-colors duration-200 hover:border-[var(--c)] hover:text-[var(--c)]" style={{ borderColor: 'var(--bd)', color: 'var(--inks)' }}>
            {l.label}
          </Link>
        ))}
        {extra && (
          <Link href={extra.href} className="px-5 py-2.5 text-[15px] tracking-[0.04em] rounded-sm transition-all duration-200 hover:brightness-110" style={{ background: 'var(--g)', color: 'var(--ink)' }}>
            {extra.label}
          </Link>
        )}
      </div>
    </div>
  )
}
