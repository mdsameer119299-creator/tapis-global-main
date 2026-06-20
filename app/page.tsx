import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { buildMetadata }         from '@/lib/metadata'
import { PAGE_META }             from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  faqSchema,
  buildJsonLd,
  productSchema,
} from '@/lib/structured-data'
import { SEO_BASE_URL, OG_IMAGE }  from '@/lib/seo'

import Hero          from '@/sections/Hero'
import TrustRibbon   from '@/components/home/TrustRibbon'

const WhoWeAre      = dynamic(() => import('@/sections/WhoWeAre'))
const Solutions     = dynamic(() => import('@/sections/Solutions'))
const Collections   = dynamic(() => import('@/sections/Collections'))
const Manufacturing = dynamic(() => import('@/sections/Manufacturing'))
const Exports       = dynamic(() => import('@/sections/Exports'))
const Testimonials  = dynamic(() => import('@/sections/Testimonials'))
const Inquiry       = dynamic(() => import('@/sections/Inquiry'))

// ── Page-level metadata (overrides root layout defaults) ─────────────────────
export const metadata: Metadata = buildMetadata(PAGE_META.home)

// ── Page-level JSON-LD ───────────────────────────────────────────────────────
const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title:         PAGE_META.home.title,
      description:   PAGE_META.home.description,
      url:           SEO_BASE_URL,
      imageUrl:      OG_IMAGE.url,
      datePublished: '2024-01-01',
      dateModified:  '2026-06-20',
    }),
    breadcrumbSchema([
      { name: 'Home', url: SEO_BASE_URL },
    ]),
    productSchema({
      name:        'Hand Tufted Carpets — Premium Flooring Collection',
      description: 'Specification-led hand tufted carpets for luxury residences, hospitality and commercial interiors. Custom dimensions, colours and design development from Bhadohi.',
      imageUrl:    `${SEO_BASE_URL}/images/handtufted-img-2.webp`,
      url:         `${SEO_BASE_URL}/#tufted`,
      material:    'New Zealand Wool, Viscose, Polyester, Cotton',
      moq:         '100 Pieces',
    }),
    productSchema({
      name:        'Hand Knotted Carpets — Luxury Bespoke Collection',
      description: 'Bespoke hand knotted carpets for distinguished residential, hospitality and designer projects. Premium wool and silk constructions with specification-led development from Bhadohi.',
      imageUrl:    `${SEO_BASE_URL}/images/rug2.webp`,
      url:         `${SEO_BASE_URL}/#knotted`,
      material:    'New Zealand Wool, Pure Silk, Wool-Silk Blend',
      moq:         '50 Pieces',
    }),
    faqSchema(),
  )
)

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }}
      />

      <Hero />
      <TrustRibbon />
      <WhoWeAre />
      <Solutions />
      <Collections />
      <Manufacturing />
      <Exports />
      <Testimonials />
      <Inquiry />
    </>
  )
}
