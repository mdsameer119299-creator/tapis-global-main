import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  itemListSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import { GUIDES, GUIDE_CATEGORY_META, getGuidesByCategory, type GuideCategory } from '@/lib/guides'
import { Reveal, Eyebrow } from '@/components/ui'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'

export const metadata: Metadata = buildMetadata({
  title:       'Carpet & Rug Guides | Manufacturing, Comparison, Buying & Export — Tapis Global',
  description: 'Expert carpet and rug guides from Tapis Global — how carpets and rugs are manufactured, hand tufted vs hand knotted, jute vs sisal, kilim vs dhurrie, hotel/mosque/office buying guides, and how to import from India.',
  keywords:    ['carpet guides', 'rug guides', 'carpet buying guide', 'how carpets are made', 'carpet comparison guides', 'import carpets from India'],
  canonical:   `${SEO_BASE_URL}/guides`,
})

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title:       'Carpet & Rug Guides — Tapis Global International',
      description: 'Manufacturing, comparison, buying and export guides for carpets and rugs.',
      url:         `${SEO_BASE_URL}/guides`,
      imageUrl:    OG_IMAGE.url,
    }),
    breadcrumbSchema([
      { name: 'Home',   url: SEO_BASE_URL },
      { name: 'Guides', url: `${SEO_BASE_URL}/guides` },
    ]),
    itemListSchema(GUIDES.map((g) => ({ name: g.title, url: `${SEO_BASE_URL}/guides/${g.slug}` }))),
  ),
)

const ORDER: GuideCategory[] = ['manufacturing', 'comparison', 'buying', 'export']

export default function GuidesHub() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />

      {/* Hero */}
      <section className="relative overflow-hidden flex flex-col justify-end min-h-[42vh] max-lg:min-h-[36vh]" style={{ background: '#0a0806' }}>
        <div className="absolute inset-0">
          <div className="relative w-full h-full fill-frame">
            <Image src="/images/tgi-banner-5.webp" alt="Carpet & rug guides" fill priority quality={80} sizes="100vw" className="object-cover object-center" style={{ filter: 'brightness(0.5) saturate(0.9)' }} />
          </div>
        </div>
        <div className="absolute inset-0 z-[2]" style={{ background: 'linear-gradient(to top, rgba(10,8,6,0.95) 0%, rgba(10,8,6,0.45) 60%, rgba(10,8,6,0.6) 100%)' }} />
        <div className="relative z-[3] footer-container pb-14 pt-32 max-w-4xl">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-2 text-[13px] tracking-[0.14em] uppercase" style={{ color: 'rgba(248,244,238,0.55)' }}>
              <li><Link href="/" className="hover:text-[var(--gl)] transition-colors">Home</Link></li>
              <li aria-hidden>›</li>
              <li aria-current="page" style={{ color: 'var(--gl)' }}>Guides</li>
            </ol>
          </nav>
          <div className="flex items-center gap-3 text-[15px] tracking-[0.38em] uppercase mb-5" style={{ color: 'var(--gl)' }}>
            <span className="block h-px w-8" style={{ background: 'var(--g)' }} />
            Knowledge Hub
          </div>
          <h1 className="font-display font-light leading-[1.05] mb-6" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(38px, 5vw, 64px)', color: '#fff' }}>
            Carpet &amp; Rug <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}>Guides</em>
          </h1>
          <p className="text-[18px] font-light leading-[1.9] max-w-2xl" style={{ color: 'rgba(248,244,238,0.6)' }}>
            Expert guidance from a third-generation Bhadohi manufacturer — how carpets and rugs are made, clear comparisons, buying guides for projects and tenders, and how to source from India.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="footer-container py-16 lg:py-20" style={{ background: 'var(--iv)' }}>
        {ORDER.map((cat) => {
          const guides = getGuidesByCategory(cat)
          return (
            <div key={cat} className="mb-16 last:mb-0">
              <Reveal>
                <Eyebrow>{GUIDE_CATEGORY_META[cat].label}</Eyebrow>
                <p className="text-[16px] font-light leading-[1.8] max-w-2xl mb-8" style={{ color: 'var(--inkm)' }}>
                  {GUIDE_CATEGORY_META[cat].blurb}
                </p>
              </Reveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map((g, i) => (
                  <Reveal key={g.slug} delay={i * 40}>
                    <Link href={`/guides/${g.slug}`} className="group block relative overflow-hidden rounded-xl aspect-[3/2]" style={{ boxShadow: '0 8px 32px rgba(26,19,16,0.08)', border: '1px solid rgba(192,155,74,0.12)' }}>
                      <Image src={g.heroImage} alt={g.title} fill loading="lazy" placeholder="blur" blurDataURL={BLUR_PLACEHOLDER} quality={78} sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]" style={{ filter: 'brightness(0.82) saturate(0.92)' }} />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.2) 60%, transparent 100%)' }} />
                      <div className="absolute bottom-0 left-0 right-0 p-6 z-[2]">
                        <h2 className="font-medium leading-[1.2]" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(19px, 2vw, 23px)', color: '#fff' }}>{g.title}</h2>
                        <span className="inline-flex items-center gap-2 mt-2 text-[13px] tracking-[0.18em] uppercase font-medium transition-all duration-300 group-hover:gap-3" style={{ color: 'var(--gl)' }}>Read Guide <span aria-hidden>→</span></span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          )
        })}
      </section>
    </>
  )
}
