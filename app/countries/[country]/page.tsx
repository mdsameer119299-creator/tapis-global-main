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
import { getCountry, getAllCountrySlugs } from '@/lib/seo-landing'
import LandingPage from '@/components/landing/LandingPage'

type Props = { params: { country: string } }

export function generateStaticParams() {
  return getAllCountrySlugs().map((country) => ({ country }))
}

export function generateMetadata({ params }: Props): Metadata {
  const page = getCountry(params.country)
  if (!page) return {}
  return buildMetadata({
    title:       page.seoTitle,
    description: page.seoDescription,
    keywords:    page.seoKeywords,
    canonical:   `${SEO_BASE_URL}/countries/${page.slug}`,
  })
}

export default function CountryPage({ params }: Props) {
  const page = getCountry(params.country)
  if (!page) notFound()

  const url = `${SEO_BASE_URL}/countries/${page.slug}`
  const PAGE_JSONLD = JSON.stringify(
    buildJsonLd(
      webPageSchema({
        title:       page.seoTitle,
        description: page.seoDescription,
        url,
        imageUrl:    `${SEO_BASE_URL}${page.heroImage}`,
      }),
      breadcrumbSchema([
        { name: 'Home',           url: SEO_BASE_URL },
        { name: 'Export Markets', url: `${SEO_BASE_URL}/countries` },
        { name: page.label,       url },
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
