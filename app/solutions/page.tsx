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
import HubGuidance from '@/components/leads/HubGuidance'
import LeadSection from '@/components/leads/LeadSection'

const SOLUTIONS_GUIDANCE = {
  eyebrow: 'Find your fit',
  heading: 'Match a solution to how you buy',
  intro:
    'Different buyers need different programmes. Identify the model that fits your business and follow it to the pages and next step built for it — or tell us your situation and we will point you to the right path.',
  points: [
    {
      title: 'Wholesale & distribution',
      body: 'For importers and distributors reselling stock or repeatable ranges: prioritise consistent qualities and export-ready documentation. Start with the wholesale catalogue.',
    },
    {
      title: 'Contract & commercial',
      body: 'For hospitality, corporate and institutional fit-outs: durability, compliance and design continuity across areas matter most. A specification-led project quote is the right entry point.',
    },
    {
      title: 'Designer & luxury',
      body: 'For architects and designers specifying bespoke pieces: custom colour, size and construction with specification-ready detail — request a sample or specification pack.',
    },
    {
      title: 'Private label & custom',
      body: 'For brands building their own range: OEM/private-label development under your brand. Begin a custom development conversation with your references and target range.',
    },
  ],
  links: [
    { href: '/solutions/wholesale-carpet-supplier', label: 'Wholesale carpet supplier' },
    { href: '/solutions/contract-carpet-supplier', label: 'Contract carpet supplier' },
    { href: '/solutions/commercial-carpet-manufacturer', label: 'Commercial carpet manufacturer' },
    { href: '/solutions/custom-carpets', label: 'Custom carpets' },
    { href: '/solutions/designer-rugs', label: 'Designer rugs' },
    { href: '/solutions/luxury-carpets', label: 'Luxury carpets' },
    { href: '/company/oem-private-label', label: 'OEM / private label' },
    { href: '/company/custom-manufacturing', label: 'Custom manufacturing' },
  ],
}

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
      <HubGuidance {...SOLUTIONS_GUIDANCE} />
      <LeadSection source="/solutions" heading="Tell us how you buy" />
    </>
  )
}
