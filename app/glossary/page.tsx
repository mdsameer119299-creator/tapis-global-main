import type { Metadata } from 'next'
import Link from 'next/link'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import { webPageSchema, breadcrumbSchema, definedTermSetSchema, buildJsonLd } from '@/lib/structured-data'
import { TARA_GLOSSARY } from '@/lib/tara/knowledge/glossary'
import PageHero from '@/components/layout/PageHero'

const TITLE = 'Carpet & Rug Glossary | Terminology Explained — Tapis Global'
const DESCRIPTION = 'A glossary of carpet and rug terminology — warp, weft, pile, knot density, GSM, backing, lab-dip and more, explained simply. From Tapis Global International, Bhadohi.'
const CANONICAL = `${SEO_BASE_URL}/glossary`

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  keywords: ['carpet glossary', 'rug terminology', 'what is KPSI', 'carpet terms explained', 'weaving glossary'],
  canonical: CANONICAL,
})

const slugify = (term: string) => term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({ title: TITLE, description: DESCRIPTION, url: CANONICAL, imageUrl: OG_IMAGE.url }),
    breadcrumbSchema([
      { name: 'Home', url: SEO_BASE_URL },
      { name: 'Glossary', url: CANONICAL },
    ]),
    definedTermSetSchema({
      name: 'Carpet & Rug Glossary',
      description: DESCRIPTION,
      url: CANONICAL,
      terms: TARA_GLOSSARY.map((t) => ({ term: t.term, definition: t.definition, anchor: slugify(t.term) })),
    }),
  ),
)

export default function GlossaryPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <PageHero
        eyebrow="Glossary"
        title="Carpet & Rug Terminology"
        lead="The words used to describe how carpets and rugs are made — explained simply."
        image="/images/knotted/knotted-02.webp"
        imageAlt="Carpet weaving detail — Tapis Global International glossary"
        priority
      />
      <section className="section-pad max-w-3xl mx-auto">
        <dl className="flex flex-col divide-y" style={{ borderColor: 'var(--bd)' }}>
          {TARA_GLOSSARY.map((t) => {
            const anchor = slugify(t.term)
            return (
              <div key={t.term} id={anchor} className="py-6 scroll-mt-24">
                <dt>
                  <a href={`#${anchor}`} className="text-[19px] font-medium hover:underline" style={{ color: 'var(--inks)', fontFamily: '"Cormorant Garamond", serif' }}>
                    {t.term}
                  </a>
                </dt>
                <dd className="text-[16px] font-light leading-[1.8] mt-2" style={{ color: 'var(--inkm)' }}>{t.definition}</dd>
              </div>
            )
          })}
        </dl>

        <div className="mt-12 flex flex-wrap gap-6">
          <Link href="/materials" className="inline-flex items-center gap-3 text-[15px] tracking-[0.16em] uppercase transition-colors duration-200 hover:text-[var(--c)] group" style={{ color: 'var(--inks)' }}>
            Materials Guide <span className="block h-px w-8 bg-current transition-all duration-300 group-hover:w-12" />
          </Link>
          <Link href="/constructions" className="inline-flex items-center gap-3 text-[15px] tracking-[0.16em] uppercase transition-colors duration-200 hover:text-[var(--c)] group" style={{ color: 'var(--inks)' }}>
            Construction Guide <span className="block h-px w-8 bg-current transition-all duration-300 group-hover:w-12" />
          </Link>
        </div>
      </section>
    </>
  )
}
