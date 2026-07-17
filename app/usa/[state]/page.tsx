import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  faqSchema,
  serviceSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import { getUsaState, getAllUsaStateSlugs } from '@/lib/seo-landing'
import LandingPage from '@/components/landing/LandingPage'
import MarketDeepDive from '@/components/landing/MarketDeepDive'

type Props = { params: { state: string } }

export function generateStaticParams() {
  return getAllUsaStateSlugs().map((state) => ({ state }))
}

export function generateMetadata({ params }: Props): Metadata {
  const page = getUsaState(params.state)
  if (!page) return {}
  return buildMetadata({
    title:       page.seoTitle,
    description: page.seoDescription,
    keywords:    page.seoKeywords,
    canonical:   `${SEO_BASE_URL}/usa/${page.slug}`,
    ogLocale:    'en_US',
  })
}

export default function UsaStatePage({ params }: Props) {
  const page = getUsaState(params.state)
  if (!page) notFound()

  const url = `${SEO_BASE_URL}/usa/${page.slug}`
  // WebPage + BreadcrumbList + FAQPage + Service only. No LocalBusiness schema
  // is emitted — Tapis Global has no physical presence in any US state (it
  // manufactures in Bhadohi and produces for buyers in each state).
  const PAGE_JSONLD = JSON.stringify(
    buildJsonLd(
      webPageSchema({
        title:       page.seoTitle,
        description: page.seoDescription,
        url,
        imageUrl:    `${SEO_BASE_URL}${page.heroImage}`,
      }),
      breadcrumbSchema([
        { name: 'Home', url: SEO_BASE_URL },
        { name: 'USA',  url: `${SEO_BASE_URL}/usa` },
        { name: page.label, url },
      ]),
      faqSchema(page.faqs.map((f) => ({ q: f.q, a: f.a }))),
      serviceSchema({ areaName: page.label, areaType: 'State', url }),
    ),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <LandingPage page={page} />
      <MarketDeepDive page={page} />
    </>
  )
}
