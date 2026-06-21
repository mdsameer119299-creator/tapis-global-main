import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  itemListSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import { INDUSTRIES } from '@/lib/seo-landing'
import LandingHub from '@/components/landing/LandingHub'

export const metadata: Metadata = buildMetadata({
  title:       'Carpets by Industry | Hospitality, Commercial & Institutional — Tapis Global',
  description: 'Industry-specific carpet manufacturing from Tapis Global International, Bhadohi — hotels, auditoriums, mosques, offices, schools, airports, villas, restaurants, hospitals and retail. Custom, fire-rated, bulk supply across India and internationally.',
  keywords:    ['carpet manufacturer by industry', 'hotel carpet manufacturer', 'commercial carpet supplier India', 'auditorium carpet manufacturer', 'office carpet supplier', 'institutional carpet manufacturer'],
  canonical:   `${SEO_BASE_URL}/industries`,
})

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title:       'Carpets by Industry — Tapis Global International',
      description: 'Industry-specific carpet manufacturing for hospitality, commercial and institutional projects.',
      url:         `${SEO_BASE_URL}/industries`,
      imageUrl:    OG_IMAGE.url,
    }),
    breadcrumbSchema([
      { name: 'Home',       url: SEO_BASE_URL },
      { name: 'Industries', url: `${SEO_BASE_URL}/industries` },
    ]),
    itemListSchema(INDUSTRIES.map((i) => ({ name: i.label, url: `${SEO_BASE_URL}/industries/${i.slug}` }))),
  ),
)

export default function IndustriesHub() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <LandingHub
        eyebrow="Carpets by Industry"
        title="Flooring for Every"
        titleEm="Industry"
        intro="Specification-led carpets manufactured in Bhadohi for hospitality, commercial, institutional and residential projects — engineered for the durability, compliance and design each environment demands, across India and international markets."
        basePath="/industries"
        pages={INDUSTRIES}
      />
    </>
  )
}
