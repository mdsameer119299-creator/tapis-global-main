import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  itemListSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import { COMPANY_PAGES } from '@/lib/seo-landing'
import LandingHub from '@/components/landing/LandingHub'

export const metadata: Metadata = buildMetadata({
  title:       'Company | Factory, Process, Quality & Heritage — Tapis Global International',
  description: 'Tapis Global International — a third-generation, family-owned carpet manufacturer in Bhadohi continuing a legacy since 1965. Explore our factory, manufacturing process, quality control, certifications, sustainability, custom & OEM capability and production capacity.',
  keywords:    ['carpet manufacturer Bhadohi', 'carpet factory India', 'family carpet manufacturer', 'carpet manufacturing process', 'carpet certifications', 'production capacity'],
  canonical:   `${SEO_BASE_URL}/company`,
})

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title:       'Company — Tapis Global International',
      description: 'Factory, manufacturing process, quality, certifications, sustainability, custom & OEM capability and heritage.',
      url:         `${SEO_BASE_URL}/company`,
      imageUrl:    OG_IMAGE.url,
    }),
    breadcrumbSchema([
      { name: 'Home',    url: SEO_BASE_URL },
      { name: 'Company', url: `${SEO_BASE_URL}/company` },
    ]),
    itemListSchema(COMPANY_PAGES.map((c) => ({ name: c.label, url: `${SEO_BASE_URL}/company/${c.slug}` }))),
  ),
)

export default function CompanyHub() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <LandingHub
        eyebrow="Our Company"
        title="Heritage, Craft"
        titleEm="& Capability"
        intro="A third-generation, family-owned carpet and rug manufacturer in Bhadohi, India — continuing a craft legacy since 1965. Explore our factory, manufacturing process, quality control, certifications, sustainability, custom and OEM capability, production capacity, and why Bhadohi is the carpet capital of India."
        basePath="/company"
        pages={COMPANY_PAGES}
      />
    </>
  )
}
