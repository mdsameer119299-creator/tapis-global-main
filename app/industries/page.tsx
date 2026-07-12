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
import HubGuidance from '@/components/leads/HubGuidance'
import LeadSection from '@/components/leads/LeadSection'

const INDUSTRIES_GUIDANCE = {
  eyebrow: 'Specifying by environment',
  heading: 'Specify carpet to how each space performs',
  intro:
    'Every environment places different demands on a floor — footfall, cleaning, acoustics, fire behaviour and design continuity. Use these considerations to brief us accurately, and we will recommend the construction and specification that fits your project and jurisdiction.',
  points: [
    {
      title: 'Traffic and durability',
      body: 'High-traffic public areas — lobbies, corridors, banquet and F&B — need denser, more resilient constructions than guestrooms or private offices. Tell us the space type and expected footfall so durability is matched, not over- or under-specified.',
    },
    {
      title: 'Compliance and acoustics',
      body: 'Institutional and hospitality projects often carry fire-behaviour and acoustic requirements set by the venue, client or local code. Share the standards your project must meet and we will specify and document to those requirements.',
    },
    {
      title: 'Design continuity across areas',
      body: 'Multi-zone projects benefit from a coordinated palette and pattern language across guestrooms, corridors and public spaces. Custom colour and pattern let a single scheme carry through an entire property.',
    },
    {
      title: 'What to prepare for a project quote',
      body: 'Space types and areas (sqm), any compliance standards, target look/palette, destination and timeline. With these we can move quickly to a specification-ready quote or sample plan.',
    },
  ],
  links: [
    { href: '/guides/hotel-carpet-buying-guide', label: 'Hotel carpet buying guide' },
    { href: '/guides/office-carpet-buying-guide', label: 'Office carpet buying guide' },
    { href: '/guides/auditorium-carpet-buying-guide', label: 'Auditorium carpet buying guide' },
    { href: '/guides/mosque-carpet-buying-guide', label: 'Mosque carpet buying guide' },
    { href: '/industries/hotel-carpets', label: 'Hotel Carpets' },
    { href: '/industries/office-carpets', label: 'Office Carpets' },
    { href: '/industries/hospital-carpets', label: 'Hospital Carpets' },
    { href: '/industries/restaurant-carpets', label: 'Restaurant Carpets' },
  ],
}

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
      <HubGuidance {...INDUSTRIES_GUIDANCE} />
      <LeadSection source="/industries" heading="Request a project quote" />
    </>
  )
}
