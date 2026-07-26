import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL } from '@/lib/seo'
import { webPageSchema, breadcrumbSchema, serviceSchema, buildJsonLd } from '@/lib/structured-data'
import { getCountry } from '@/lib/seo-landing'
import { getPublishedMarketIntelligence, getPublishedMarketIntelligenceSlugs } from '@/lib/market-intelligence/content'
import { resolveMarketIntelligenceLinks } from '@/lib/market-intelligence/links'
import MarketIntelligenceView from '@/components/countries/MarketIntelligenceView'

type Props = { params: { country: string } }

// Only countries with a published Market Intelligence entry get a page —
// zero entries today generates zero routes, matching the site's own phased
// rollout discipline (real per-country data lands country by country as
// research is verified, not all at once).
export function generateStaticParams() {
  return getPublishedMarketIntelligenceSlugs().map((country) => ({ country }))
}

export function generateMetadata({ params }: Props): Metadata {
  const entry = getPublishedMarketIntelligence(params.country)
  const country = getCountry(params.country)
  if (!entry || !country) return {}
  return buildMetadata({
    title: entry.seo.title,
    description: entry.seo.description,
    keywords: entry.seo.keywords,
    canonical: `${SEO_BASE_URL}/countries/${country.slug}/market-intelligence`,
  })
}

export default function MarketIntelligencePage({ params }: Props) {
  const entry = getPublishedMarketIntelligence(params.country)
  const country = getCountry(params.country)
  if (!entry || !country) notFound()

  const url = `${SEO_BASE_URL}/countries/${country.slug}/market-intelligence`
  const links = resolveMarketIntelligenceLinks(entry)

  const PAGE_JSONLD = JSON.stringify(
    buildJsonLd(
      webPageSchema({ title: entry.seo.title, description: entry.seo.description, url, imageUrl: `${SEO_BASE_URL}${country.heroImage}`, dateModified: entry.updatedAt }),
      breadcrumbSchema([
        { name: 'Home', url: SEO_BASE_URL },
        { name: 'Export Markets', url: `${SEO_BASE_URL}/countries` },
        { name: country.label, url: `${SEO_BASE_URL}/countries/${country.slug}` },
        { name: 'Market Intelligence', url },
      ]),
      serviceSchema({ areaName: country.label, areaType: 'Country', url }),
    ),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <MarketIntelligenceView country={country} entry={entry} links={links} />
    </>
  )
}
