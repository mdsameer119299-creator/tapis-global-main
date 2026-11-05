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
  title:       'Dhurrie & Tat Patti Manufacturer India | School & Institutional Supply — Tapis Global',
  description: 'Dhurrie and Tat Patti manufacturer in Bhadohi, India. Cotton, wool and jute dhurrie and floor-matting options for trade, school and institutional buyers. Discuss materials, sizes and bulk requirements.',
  keywords:    ['dhurrie manufacturer India', 'tat patti manufacturer India', 'school tat patti supplier', 'dhurrie supplier India', 'bulk dhurrie supplier', 'dhurrie exporter India'],
  canonical:   `${SEO_BASE_URL}/dhurries`,
})

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title:       'Dhurrie & Tat Patti Manufacturer India — Tapis Global International',
      description: 'Dhurries and Tat Patti manufactured in Bhadohi, India for trade, school and institutional enquiries.',
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
        intro="Manufacturer and exporter of cotton, wool and jute dhurries and Tat Patti floor matting from Bhadohi, India. Explore product options for retailers, importers, schools and institutional buyers, with materials, dimensions and quantities reviewed against each enquiry."
        basePath="/dhurries"
        pages={DHURRIES}
      />
    </>
  )
}
