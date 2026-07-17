import Link from 'next/link'
import Image from 'next/image'
import type { ProductCategory } from '@/lib/products'
import { guidesForProduct } from '@/lib/guides'
import { getLandingsForProduct } from '@/lib/seo-landing'
import { getKnowledgeArticlesFor } from '@/lib/knowledge/links'
import { getReferenceLinksForProduct } from '@/lib/reference-links'
import { Reveal, Eyebrow } from '@/components/ui'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'

const BASE_PATH: Record<string, string> = {
  industry: '/industries',
  solution: '/solutions',
  country:  '/countries',
  dhurrie:  '/dhurries',
  company:  '/company',
}

/**
 * Internal-linking block for product detail pages: surfaces contextual guides
 * and the industries / solutions that use this product. This closes the
 * otherwise one-way landing→product and guide→product links, making the
 * topical cluster fully bidirectional.
 */
export default function CategoryRelatedContent({ category }: { category: ProductCategory }) {
  const guides   = guidesForProduct(category.slug, category.relatedGuides ?? [])
  const landings = getLandingsForProduct(category.slug, 6)
  const knowledgeArticles = getKnowledgeArticlesFor({ product: category.slug })
  const { construction, materials: materialLinks } = getReferenceLinksForProduct(category.slug)
  const referenceLinks = [construction, ...materialLinks].filter((l): l is NonNullable<typeof l> => Boolean(l))

  if (guides.length === 0 && landings.length === 0 && knowledgeArticles.length === 0 && referenceLinks.length === 0) return null

  return (
    <section className="py-14 lg:py-16 px-8 max-lg:px-5" style={{ background: 'var(--iv)' }}>
      {/* ── Related guides ── */}
      {guides.length > 0 && (
        <>
          <Reveal>
            <Eyebrow>Helpful Guides</Eyebrow>
            <h2
              className="font-medium leading-[1.1] mb-3"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(26px, 2.8vw, 38px)', color: 'var(--ink)' }}
            >
              {category.name} — <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>Buying &amp; Specification Guides</em>
            </h2>
            <p className="text-[16px] font-light leading-[1.85] max-w-2xl mb-10" style={{ color: 'var(--inkm)' }}>
              Expert guidance on specifying, sourcing and comparing {category.name.toLowerCase()} from a Bhadohi manufacturer.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {guides.map((g, i) => (
              <Reveal key={g.slug} delay={i * 50}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="group block relative overflow-hidden rounded-xl aspect-[4/3]"
                  style={{ boxShadow: '0 8px 32px rgba(26,19,16,0.08)', border: '1px solid rgba(192,155,74,0.12)' }}
                >
                  <Image
                    src={g.heroImage}
                    alt={`${g.title} — Tapis Global International`}
                    fill
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={BLUR_PLACEHOLDER}
                    quality={78}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
                    style={{ filter: 'brightness(0.82) saturate(0.92)' }}
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.2) 60%, transparent 100%)' }} />
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-[2]">
                    <span className="text-[12px] tracking-[0.2em] uppercase" style={{ color: 'var(--gl)' }}>Guide</span>
                    <h3 className="font-medium leading-[1.2] mt-1" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '19px', color: '#fff' }}>
                      {g.title}
                    </h3>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </>
      )}

      {/* ── Industries & solutions that use this product ── */}
      {landings.length > 0 && (
        <>
          <Reveal>
            <p className="text-[14px] tracking-[0.28em] uppercase font-medium mb-5" style={{ color: 'var(--gd)' }}>
              {category.name} for Industries &amp; Solutions
            </p>
          </Reveal>
          <div className="flex flex-wrap gap-3">
            {landings.map((l) => (
              <Link
                key={`${l.kind}-${l.slug}`}
                href={`${BASE_PATH[l.kind]}/${l.slug}`}
                className="px-5 py-2.5 text-[15px] tracking-[0.04em] border rounded-sm transition-colors duration-200 hover:border-[var(--c)] hover:text-[var(--c)]"
                style={{ borderColor: 'var(--bd)', color: 'var(--inks)' }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </>
      )}

      {/* ── Material & construction guides for this product ── */}
      {referenceLinks.length > 0 && (
        <>
          <Reveal>
            <p className="text-[14px] tracking-[0.28em] uppercase font-medium mb-5 mt-12" style={{ color: 'var(--gd)' }}>
              Material &amp; Construction Guides
            </p>
          </Reveal>
          <div className="flex flex-wrap gap-3">
            {referenceLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-5 py-2.5 text-[15px] tracking-[0.04em] border rounded-sm transition-colors duration-200 hover:border-[var(--c)] hover:text-[var(--c)]"
                style={{ borderColor: 'var(--bd)', color: 'var(--inks)' }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </>
      )}

      {/* ── Related Knowledge Centre articles ── */}
      {knowledgeArticles.length > 0 && (
        <>
          <Reveal>
            <p className="text-[14px] tracking-[0.28em] uppercase font-medium mb-5 mt-12" style={{ color: 'var(--gd)' }}>
              Related Reading
            </p>
          </Reveal>
          <div className="flex flex-wrap gap-3">
            {knowledgeArticles.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-5 py-2.5 text-[15px] tracking-[0.04em] border rounded-sm transition-colors duration-200 hover:border-[var(--c)] hover:text-[var(--c)]"
                style={{ borderColor: 'var(--bd)', color: 'var(--inks)' }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </>
      )}

      <Reveal>
        <div className="mt-10 flex flex-wrap gap-6">
          <Link href="/guides" className="inline-flex items-center gap-3 text-[15px] tracking-[0.16em] uppercase transition-colors duration-200 hover:text-[var(--c)] group" style={{ color: 'var(--inks)' }}>
            All Guides <span className="block h-px w-8 bg-current transition-all duration-300 group-hover:w-12" />
          </Link>
          <Link href="/industries" className="inline-flex items-center gap-3 text-[15px] tracking-[0.16em] uppercase transition-colors duration-200 hover:text-[var(--c)] group" style={{ color: 'var(--inks)' }}>
            All Industries <span className="block h-px w-8 bg-current transition-all duration-300 group-hover:w-12" />
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
