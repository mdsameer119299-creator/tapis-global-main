import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  faqSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import { getIndustry, getAllIndustrySlugs } from '@/lib/seo-landing'
import LandingPage from '@/components/landing/LandingPage'

type Props = { params: { industry: string } }

export function generateStaticParams() {
  return getAllIndustrySlugs().map((industry) => ({ industry }))
}

export function generateMetadata({ params }: Props): Metadata {
  const page = getIndustry(params.industry)
  if (!page) return {}
  return buildMetadata({
    title:       page.seoTitle,
    description: page.seoDescription,
    keywords:    page.seoKeywords,
    canonical:   `${SEO_BASE_URL}/industries/${page.slug}`,
  })
}

export default function IndustryPage({ params }: Props) {
  const page = getIndustry(params.industry)
  if (!page) notFound()

  const url = `${SEO_BASE_URL}/industries/${page.slug}`
  const PAGE_JSONLD = JSON.stringify(
    buildJsonLd(
      webPageSchema({
        title:       page.seoTitle,
        description: page.seoDescription,
        url,
        imageUrl:    `${SEO_BASE_URL}${page.heroImage}`,
      }),
      breadcrumbSchema([
        { name: 'Home',        url: SEO_BASE_URL },
        { name: 'Industries',  url: `${SEO_BASE_URL}/industries` },
        { name: page.label,    url },
      ]),
      faqSchema(page.faqs.map((f) => ({ q: f.q, a: f.a }))),
    ),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <LandingPage page={page} />
    </>
  )
}
