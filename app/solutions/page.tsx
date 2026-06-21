import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  itemListSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import { SOLUTIONS } from '@/lib/seo-landing'
import LandingHub from '@/components/landing/LandingHub'

export const metadata: Metadata = buildMetadata({
  title:       'Carpet Solutions | Luxury, Designer, Custom, Wholesale & Export — Tapis Global',
  description: 'Carpet and rug solutions from Tapis Global International, Bhadohi — luxury, designer, custom, modern, commercial, wholesale, contract and export. Manufacturer-direct supply for India and international B2B buyers.',
  keywords:    ['luxury carpet manufacturer India', 'designer rug manufacturer', 'custom carpet manufacturer', 'wholesale carpet supplier India', 'commercial carpet manufacturer', 'carpet exporter India'],
  canonical:   `${SEO_BASE_URL}/solutions`,
})

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title:       'Carpet Solutions — Tapis Global International',
      description: 'Luxury, designer, custom, wholesale, commercial and export carpet solutions, manufacturer-direct.',
      url:         `${SEO_BASE_URL}/solutions`,
      imageUrl:    OG_IMAGE.url,
    }),
    breadcrumbSchema([
      { name: 'Home',      url: SEO_BASE_URL },
      { name: 'Solutions', url: `${SEO_BASE_URL}/solutions` },
    ]),
    itemListSchema(SOLUTIONS.map((s) => ({ name: s.label, url: `${SEO_BASE_URL}/solutions/${s.slug}` }))),
  ),
)

export default function SolutionsHub() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <LandingHub
        eyebrow="Carpet Solutions"
        title="Solutions for Every"
        titleEm="Buyer"
        intro="From luxury and designer pieces to custom, wholesale, commercial, contract and export programmes — manufacturer-direct carpet and rug solutions from Bhadohi for architects, designers, hospitality groups, procurement teams, distributors and importers."
        basePath="/solutions"
        pages={SOLUTIONS}
      />
    </>
  )
}
