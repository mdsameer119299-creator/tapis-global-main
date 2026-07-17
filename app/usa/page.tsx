import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  itemListSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import { USA_STATES } from '@/lib/seo-landing'
import { USA_HUB_INTRO } from '@/lib/usa-states'
import LandingHub from '@/components/landing/LandingHub'

export const metadata: Metadata = buildMetadata({
  title:       'Carpet Manufacturer for the USA | All 50 States — Tapis Global',
  description: 'Tapis Global International is a made-to-order carpet and rug manufacturer in Bhadohi, India, producing for commercial buyers and projects across all 50 US states — hotels, interior designers, builders, luxury homes, corporate offices and wholesale trade. Not a ready-stock retailer.',
  keywords:    ['carpet manufacturer USA', 'rug manufacturer United States', 'wholesale carpet supplier USA', 'hotel carpet manufacturer USA', 'commercial carpet supplier USA', 'custom rug manufacturer United States'],
  canonical:   `${SEO_BASE_URL}/usa`,
  ogLocale:    'en_US',
})

// Hub lists every state card (internal linking) as new batches ship; the
// sitemap lists each batch's URLs in the same PR that ships them (no phased
// hold-back — USA is the highest-priority market, see app/sitemap.ts).
const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title:       'Carpet Manufacturer for the USA — All 50 States — Tapis Global International',
      description: 'Made-to-order carpet and rug manufacturer in Bhadohi producing for commercial buyers and projects across the United States.',
      url:         `${SEO_BASE_URL}/usa`,
      imageUrl:    OG_IMAGE.url,
      // Genuine hub listing 51 state-equivalent pages — CollectionPage layered
      // onto WebPage is valid multi-type schema.org practice for this shape.
      additionalType: 'CollectionPage',
    }),
    breadcrumbSchema([
      { name: 'Home', url: SEO_BASE_URL },
      { name: 'USA',  url: `${SEO_BASE_URL}/usa` },
    ]),
    itemListSchema(USA_STATES.map((s) => ({ name: s.label, url: `${SEO_BASE_URL}/usa/${s.slug}` }))),
  ),
)

export default function UsaHub() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <LandingHub
        eyebrow="Coast to Coast"
        title="Carpet Manufacturer"
        titleEm="for the USA"
        intro={USA_HUB_INTRO}
        basePath="/usa"
        pages={USA_STATES}
      />
    </>
  )
}
