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
import { getIndiaLocation, getAllIndiaSlugs } from '@/lib/seo-landing'
import LandingPage from '@/components/landing/LandingPage'

type Props = { params: { location: string } }

export function generateStaticParams() {
  return getAllIndiaSlugs().map((location) => ({ location }))
}

export function generateMetadata({ params }: Props): Metadata {
  const page = getIndiaLocation(params.location)
  if (!page) return {}
  return buildMetadata({
    title:       page.seoTitle,
    description: page.seoDescription,
    keywords:    page.seoKeywords,
    canonical:   `${SEO_BASE_URL}/india/${page.slug}`,
  })
}

export default function IndiaLocationPage({ params }: Props) {
  const page = getIndiaLocation(params.location)
  if (!page) notFound()

  const url = `${SEO_BASE_URL}/india/${page.slug}`
  // WebPage + BreadcrumbList + FAQPage only. No LocalBusiness schema is emitted
  // for these cities — Tapis Global has no physical location in them (it
  // manufactures in Bhadohi and supplies to the city).
  const PAGE_JSONLD = JSON.stringify(
    buildJsonLd(
      webPageSchema({
        title:       page.seoTitle,
        description: page.seoDescription,
        url,
        imageUrl:    `${SEO_BASE_URL}${page.heroImage}`,
      }),
      breadcrumbSchema([
        { name: 'Home',  url: SEO_BASE_URL },
        { name: 'India', url: `${SEO_BASE_URL}/india` },
        { name: page.label, url },
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
