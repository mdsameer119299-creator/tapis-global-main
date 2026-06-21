import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  articleSchema,
  faqSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import { getGuide, getAllGuideSlugs } from '@/lib/guides'
import GuideArticle from '@/components/guides/GuideArticle'

type Props = { params: { slug: string } }

export function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const guide = getGuide(params.slug)
  if (!guide) return {}
  return buildMetadata({
    title:       guide.seoTitle,
    description: guide.seoDescription,
    keywords:    guide.seoKeywords,
    canonical:   `${SEO_BASE_URL}/guides/${guide.slug}`,
  })
}

export default function GuidePage({ params }: Props) {
  const guide = getGuide(params.slug)
  if (!guide) notFound()

  const url = `${SEO_BASE_URL}/guides/${guide.slug}`
  const PAGE_JSONLD = JSON.stringify(
    buildJsonLd(
      webPageSchema({
        title:       guide.seoTitle,
        description: guide.seoDescription,
        url,
        imageUrl:    `${SEO_BASE_URL}${guide.heroImage}`,
      }),
      breadcrumbSchema([
        { name: 'Home',   url: SEO_BASE_URL },
        { name: 'Guides', url: `${SEO_BASE_URL}/guides` },
        { name: guide.title, url },
      ]),
      articleSchema({
        title:       guide.h1,
        description: guide.seoDescription,
        url,
        imageUrl:    `${SEO_BASE_URL}${guide.heroImage}`,
      }),
      faqSchema(guide.faqs.map((f) => ({ q: f.q, a: f.a }))),
    ),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <GuideArticle guide={guide} />
    </>
  )
}
