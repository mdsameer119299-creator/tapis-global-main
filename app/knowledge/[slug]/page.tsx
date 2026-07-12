import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  articleSchema,
  faqSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import { getKnowledgeArticle, getPublishedArticleSlugs } from '@/lib/knowledge/content'
import { getKnowledgeCategory } from '@/lib/knowledge/registry'
import { resolveArticleLinks } from '@/lib/knowledge/links'
import KnowledgeArticleView from '@/components/knowledge/KnowledgeArticleView'

type Props = { params: { slug: string } }

export function generateStaticParams() {
  return getPublishedArticleSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const a = getKnowledgeArticle(params.slug)
  if (!a || a.status === 'draft') return {}
  return buildMetadata({
    title: a.seo.title,
    description: a.seo.description,
    keywords: a.seo.keywords,
    canonical: `${SEO_BASE_URL}/knowledge/${a.slug}`,
  })
}

export default function KnowledgeArticlePage({ params }: Props) {
  const a = getKnowledgeArticle(params.slug)
  if (!a || a.status === 'draft') notFound()

  const url = `${SEO_BASE_URL}/knowledge/${a.slug}`
  const category = getKnowledgeCategory(a.category)
  const imageUrl = a.images?.[0]?.src ? `${SEO_BASE_URL}${a.images[0].src}` : OG_IMAGE.url

  // Structured data is generated AUTOMATICALLY from the content file.
  const PAGE_JSONLD = JSON.stringify(
    buildJsonLd(
      webPageSchema({ title: a.seo.title, description: a.seo.description, url, imageUrl, dateModified: a.updatedAt }),
      breadcrumbSchema([
        { name: 'Home', url: SEO_BASE_URL },
        { name: 'Knowledge Centre', url: `${SEO_BASE_URL}/knowledge` },
        { name: a.title, url },
      ]),
      articleSchema({ title: a.title, description: a.summary, url, imageUrl, dateModified: a.updatedAt }),
      a.faq && a.faq.length > 0 ? faqSchema(a.faq.map((f) => ({ q: f.q, a: f.a }))) : null,
    ),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <KnowledgeArticleView article={a} links={resolveArticleLinks(a)} categoryTitle={category?.title ?? 'Knowledge'} />
    </>
  )
}
