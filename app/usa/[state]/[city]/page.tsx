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
import { getUsaCity, getUsaState, USA_CITIES } from '@/lib/seo-landing'
import LandingPage from '@/components/landing/LandingPage'
import MarketDeepDive from '@/components/landing/MarketDeepDive'

type Props = { params: { state: string; city: string } }

export function generateStaticParams() {
  return USA_CITIES.map((c) => ({ state: c.parentUsaState!, city: c.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const page = getUsaCity(params.city)
  if (!page || page.parentUsaState !== params.state) return {}
  return buildMetadata({
    title:       page.seoTitle,
    description: page.seoDescription,
    keywords:    page.seoKeywords,
    canonical:   `${SEO_BASE_URL}/usa/${params.state}/${page.slug}`,
    ogLocale:    'en_US',
  })
}

export default function UsaCityPage({ params }: Props) {
  const page = getUsaCity(params.city)
  // A city must exist AND belong to the state segment in the URL — guards
  // against e.g. /usa/california/boston resolving as a valid page.
  if (!page || page.parentUsaState !== params.state) notFound()

  const parentState = getUsaState(page.parentUsaState!)
  const url = `${SEO_BASE_URL}/usa/${params.state}/${page.slug}`
  // WebPage + BreadcrumbList (4-level: Home > USA > State > City) + FAQPage +
  // Service. No LocalBusiness schema — no physical US presence.
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
        ...(parentState ? [{ name: parentState.label, url: `${SEO_BASE_URL}/usa/${parentState.slug}` }] : []),
        { name: page.label, url },
      ]),
      faqSchema(page.faqs.map((f) => ({ q: f.q, a: f.a }))),
      serviceSchema({ areaName: page.label, areaType: 'City', url }),
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
