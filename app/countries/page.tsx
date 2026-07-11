import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  itemListSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import { COUNTRIES } from '@/lib/seo-landing'
import LandingHub from '@/components/landing/LandingHub'

export const metadata: Metadata = buildMetadata({
  title:       'Carpet Export Markets | Indian Carpet & Rug Exporter — Tapis Global International',
  description: 'Tapis Global International manufactures handmade carpets and rugs to order in Bhadohi, India, for buyers and projects across North America, the UK and Europe, the Nordics, the Gulf and Asia-Pacific — including the USA, Canada, UK, Germany, France, the Nordics, UAE, Saudi Arabia, Singapore and Australia. Request a catalogue.',
  keywords:    ['carpet exporter India', 'rug exporter India', 'carpet export markets', 'Indian carpet exporter Bhadohi', 'international carpet supplier'],
  canonical:   `${SEO_BASE_URL}/countries`,
})

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title:       'Carpet Export Markets — Tapis Global International',
      description: 'Indian carpet and rug exporter serving international markets from Bhadohi.',
      url:         `${SEO_BASE_URL}/countries`,
      imageUrl:    OG_IMAGE.url,
    }),
    breadcrumbSchema([
      { name: 'Home',           url: SEO_BASE_URL },
      { name: 'Export Markets', url: `${SEO_BASE_URL}/countries` },
    ]),
    itemListSchema(COUNTRIES.map((c) => ({ name: c.label, url: `${SEO_BASE_URL}/countries/${c.slug}` }))),
  ),
)

export default function CountriesHub() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <LandingHub
        eyebrow="Export Markets"
        title="Carpet Export"
        titleEm="Markets"
        intro="Tapis Global International exports handmade carpets and rugs from Bhadohi, India to buyers worldwide. India remains our primary market; internationally we supply designers, hospitality groups, importers and distributors with full documentation, consistent quality and coordinated freight."
        basePath="/countries"
        pages={COUNTRIES}
      />
    </>
  )
}
