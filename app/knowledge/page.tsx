import type { Metadata } from 'next'
import Link from 'next/link'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import { webPageSchema, breadcrumbSchema, itemListSchema, buildJsonLd } from '@/lib/structured-data'
import { KNOWLEDGE_CATEGORIES } from '@/lib/knowledge/registry'
import { getPublishedArticles, getArticlesByCategory } from '@/lib/knowledge/content'

export const metadata: Metadata = buildMetadata({
  title: 'Carpet & Rug Knowledge Centre | Materials, Manufacturing & Buying Guides — TAPIS GLOBAL',
  description: 'The TAPIS GLOBAL Knowledge Centre — guides on carpet and rug materials, manufacturing, buying, care, carpet history and custom sourcing from Bhadohi, India.',
  keywords: ['carpet knowledge', 'rug materials guide', 'carpet manufacturing', 'custom rug buying guide'],
  canonical: `${SEO_BASE_URL}/knowledge`,
})

export default function KnowledgeHub() {
  const published = getPublishedArticles()
  const PAGE_JSONLD = JSON.stringify(
    buildJsonLd(
      webPageSchema({ title: 'Carpet & Rug Knowledge Centre — TAPIS GLOBAL', description: 'Guides on carpet and rug materials, manufacturing, buying and care.', url: `${SEO_BASE_URL}/knowledge`, imageUrl: OG_IMAGE.url }),
      breadcrumbSchema([
        { name: 'Home', url: SEO_BASE_URL },
        { name: 'Knowledge Centre', url: `${SEO_BASE_URL}/knowledge` },
      ]),
      published.length > 0 ? itemListSchema(published.map((a) => ({ name: a.title, url: `${SEO_BASE_URL}/knowledge/${a.slug}` }))) : null,
    ),
  )

  const withArticles = KNOWLEDGE_CATEGORIES
    .map((c) => ({ category: c, articles: getArticlesByCategory(c.slug) }))
    .filter((x) => x.articles.length > 0)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <section className="footer-container py-14 lg:py-20" style={{ background: 'var(--iv)' }}>
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-2 text-[13px] tracking-[0.12em] uppercase" style={{ color: 'var(--inkm)' }}>
            <li><Link href="/" className="hover:text-[var(--c)]">Home</Link></li>
            <li aria-hidden>›</li>
            <li aria-current="page" style={{ color: 'var(--c)' }}>Knowledge Centre</li>
          </ol>
        </nav>
        <h1 className="font-medium leading-[1.1] mb-4" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(32px, 4.5vw, 56px)', color: 'var(--ink)' }}>Knowledge Centre</h1>
        <p className="text-[18px] font-light leading-[1.85] max-w-3xl mb-12" style={{ color: 'var(--inkm)' }}>
          Guides on carpet and rug materials, manufacturing, buying, care and custom sourcing — made-to-order from Bhadohi, India.
        </p>

        {withArticles.length === 0 ? (
          <p className="text-[16px] font-light" style={{ color: 'var(--inkm)' }}>Guides are being added. Meanwhile, explore our <Link href="/guides" className="underline" style={{ color: 'var(--c)' }}>guides</Link> or <Link href="/products" className="underline" style={{ color: 'var(--c)' }}>products</Link>.</p>
        ) : (
          <div className="flex flex-col gap-12">
            {withArticles.map(({ category, articles }) => (
              <div key={category.slug}>
                <h2 className="font-medium leading-[1.15] mb-2" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(22px, 2.6vw, 32px)', color: 'var(--ink)' }}>{category.title}</h2>
                <p className="text-[15px] font-light mb-5 max-w-2xl" style={{ color: 'var(--inkm)' }}>{category.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {articles.map((a) => (
                    <Link key={a.slug} href={`/knowledge/${a.slug}`} className="block rounded-lg p-5 transition-colors hover:border-[var(--c)]" style={{ background: '#fff', border: '1px solid var(--bd)' }}>
                      <span className="block text-[17px] font-medium leading-snug mb-1.5" style={{ color: 'var(--inks)' }}>{a.title}</span>
                      <span className="block text-[14.5px] font-light leading-relaxed" style={{ color: 'var(--inkm)' }}>{a.summary}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
