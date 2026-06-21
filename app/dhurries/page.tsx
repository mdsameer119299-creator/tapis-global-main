import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  itemListSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import { DHURRIES } from '@/lib/seo-landing'
import LandingHub from '@/components/landing/LandingHub'

export const metadata: Metadata = buildMetadata({
  title:       'Dhurrie & Tat Patti Manufacturer India | Tender, School & NGO Supply — Tapis Global',
  description: 'Dhurrie and Tat Patti manufacturer, supplier and exporter in Bhadohi, India. Cotton, wool and jute dhurries and floor matting for government tenders, schools, hostels, NGOs and export. Bulk, economical, documented. Request a quote.',
  keywords:    ['dhurrie manufacturer India', 'tat patti manufacturer India', 'government tender dhurrie supplier', 'school dhurrie supplier', 'NGO dhurrie supplier', 'bulk dhurrie supplier', 'dhurrie exporter India'],
  canonical:   `${SEO_BASE_URL}/dhurries`,
})

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title:       'Dhurrie & Tat Patti Manufacturer India — Tapis Global International',
      description: 'Dhurries and Tat Patti for tender, school, NGO, institutional and export supply, manufacturer-direct from Bhadohi.',
      url:         `${SEO_BASE_URL}/dhurries`,
      imageUrl:    OG_IMAGE.url,
    }),
    breadcrumbSchema([
      { name: 'Home',                 url: SEO_BASE_URL },
      { name: 'Dhurries & Tat Patti', url: `${SEO_BASE_URL}/dhurries` },
    ]),
    itemListSchema(DHURRIES.map((d) => ({ name: d.label, url: `${SEO_BASE_URL}/dhurries/${d.slug}` }))),
  ),
)

export default function DhurriesHub() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <LandingHub
        eyebrow="Dhurries & Tat Patti"
        title="Dhurrie & Tat Patti"
        titleEm="Manufacturer"
        intro="Manufacturer, supplier and exporter of cotton, wool and jute dhurries and Tat Patti floor matting from Bhadohi, India — specialising in government-tender, school, hostel, NGO, relief and institutional supply at economical bulk scale, alongside retail and export programmes."
        basePath="/dhurries"
        pages={DHURRIES}
      />
    </>
  )
}
