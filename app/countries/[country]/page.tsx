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
import { getCountry, getAllCountrySlugs } from '@/lib/seo-landing'
import LandingPage from '@/components/landing/LandingPage'
import CountryDeepDive from '@/components/countries/CountryDeepDive'

type Props = { params: { country: string } }

// og:locale override — ONLY for markets where English genuinely is the
// audience's primary language. All other target markets keep the site
// default (their content is English; their audience's home language isn't),
// which is the same honesty constraint that keeps hreflang out of this site.
const OG_LOCALE_BY_COUNTRY: Record<string, string> = {
  usa:           'en_US',
  canada:        'en_CA',
  uk:            'en_GB',
  australia:     'en_AU',
  'new-zealand': 'en_NZ',
  singapore:     'en_SG',
}

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
    ogLocale:    OG_LOCALE_BY_COUNTRY[page.slug],
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
      serviceSchema({ countryName: page.label, url }),
    ),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <LandingPage page={page} />
      <CountryDeepDive page={page} />
    </>
  )
}
