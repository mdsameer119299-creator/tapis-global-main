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
import HubGuidance from '@/components/leads/HubGuidance'
import LeadSection from '@/components/leads/LeadSection'

const COUNTRIES_GUIDANCE = {
  eyebrow: 'Sourcing from India',
  heading: 'Importing carpets from India, step by step',
  intro:
    'Buying manufacturer-direct from Bhadohi means clearer specifications, custom capability and coordinated freight. A little planning up front — Incoterms, documentation and destination logistics — keeps your first order smooth. Share your market and we will guide the rest.',
  points: [
    {
      title: 'Choose the right Incoterms',
      body: 'Decide whether you want to handle freight (e.g. FOB/EXW) or receive a landed price (e.g. CIF/DAP). Your choice affects quoting, insurance and who arranges shipping — tell us your preference and destination port.',
    },
    {
      title: 'Documentation and compliance',
      body: 'Export orders travel with standard trade documents (invoice, packing list, transport and origin paperwork). If your market requires specific labelling, fibre or fire declarations, flag them early so paperwork is prepared correctly.',
    },
    {
      title: 'Lead times and logistics',
      body: 'Handmade and custom orders need production plus transit time; plan backwards from your in-market date. Consolidating designs into a single shipment usually improves freight economics — we can advise once we know your volumes.',
    },
    {
      title: 'What to prepare for an export quote',
      body: 'Destination country and port, product and construction interest, quantity or container target, and timeline. With these we can prepare an accurate quote and a realistic delivery schedule.',
    },
  ],
  links: [
    { href: '/guides/how-to-import-carpets-from-india', label: 'How to import carpets from India' },
    { href: '/guides/why-buy-carpets-from-india', label: 'Why buy carpets from India' },
    { href: '/guides/why-bhadohi-carpet-capital', label: 'Why Bhadohi — the carpet capital' },
    { href: '/company/export-process', label: 'Our export process' },
    { href: '/countries/usa', label: 'Carpets to the USA' },
    { href: '/countries/uk', label: 'Carpets to the UK' },
    { href: '/countries/germany', label: 'Carpets to Germany' },
    { href: '/countries/uae', label: 'Carpets to the UAE' },
  ],
}

export const metadata: Metadata = buildMetadata({
  title:       'Carpet Export Markets | Indian Carpet & Rug Exporter — Tapis Global International',
  description: 'Tapis Global International exports handmade carpets and rugs from Bhadohi, India to the USA, UK, Germany, France, Italy, Spain, Netherlands, Belgium, Australia, UAE, Saudi Arabia and Qatar — with full documentation and freight. Request a catalogue.',
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
      <HubGuidance {...COUNTRIES_GUIDANCE} />
      <LeadSection source="/countries" heading="Request an export quote or catalogue" />
    </>
  )
}
