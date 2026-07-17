import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  itemListSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import { INDIA_LOCATIONS } from '@/lib/seo-landing'
import { INDIA_HUB_INTRO } from '@/lib/india'
import LandingHub from '@/components/landing/LandingHub'

export const metadata: Metadata = buildMetadata({
  title:       'Carpet Manufacturer India | Custom Carpets & Rugs, Pan-India Supply — Tapis Global',
  description: 'Tapis Global International is a made-to-order carpet and rug manufacturer in Bhadohi, India, producing for commercial buyers and projects pan-India — Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai and more. Custom carpets for architects, hotels, developers and procurement. Not a ready-stock retailer.',
  keywords:    ['carpet manufacturer India', 'rug manufacturer India', 'custom carpet manufacturer India', 'hotel carpet manufacturer India', 'commercial carpet supplier India', 'handmade rug manufacturer India', 'B2B carpet manufacturer India'],
  canonical:   `${SEO_BASE_URL}/india`,
})

// Hub lists all India location cards (internal linking), while the sitemap
// exposes only the Phase-1 subset (see app/sitemap.ts) during phased rollout.
const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title:       'Carpet Manufacturer India — Pan-India Supply — Tapis Global International',
      description: 'Made-to-order carpet and rug manufacturer in Bhadohi producing for commercial buyers and projects pan-India.',
      url:         `${SEO_BASE_URL}/india`,
      imageUrl:    OG_IMAGE.url,
      // Genuine hub listing 17+ location pages — CollectionPage layered onto
      // WebPage is valid multi-type schema.org practice for this shape (same
      // pattern as app/usa/page.tsx).
      additionalType: 'CollectionPage',
    }),
    breadcrumbSchema([
      { name: 'Home',  url: SEO_BASE_URL },
      { name: 'India', url: `${SEO_BASE_URL}/india` },
    ]),
    itemListSchema(INDIA_LOCATIONS.map((c) => ({ name: c.label, url: `${SEO_BASE_URL}/india/${c.slug}` }))),
  ),
)

export default function IndiaHub() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <LandingHub
        eyebrow="Pan-India Supply"
        title="Carpet Manufacturer"
        titleEm="India"
        intro={INDIA_HUB_INTRO}
        basePath="/india"
        pages={INDIA_LOCATIONS}
      />
    </>
  )
}
