/**
 * lib/email-sequences.ts — buyer-type personalised acknowledgement templates.
 *
 * The immediate reply a buyer receives is tailored to their segment and points
 * to the RELEVANT existing pages (catalogue, industry, OEM, guides). No
 * fabricated brochures/PDFs — every resource link is a real page on the site.
 * A full multi-touch drip sequence would be continued by an ESP; these templates
 * + the buyer-type mapping are the content that feeds it.
 */
import { SEO_BASE_URL } from '@/lib/seo'

export interface BuyerEmailTemplate {
  key: string
  /** Matches the submitted buyerType label (case-insensitive). */
  match: RegExp
  headline: string
  intro: string
  resources: { label: string; path: string }[]
}

const TEMPLATES: BuyerEmailTemplate[] = [
  {
    key: 'importer',
    match: /importer|wholesaler/i,
    headline: 'Thank you — your wholesale enquiry is with our export team',
    intro:
      'Thanks for your interest in sourcing from Tapis Global International. We are reviewing your requirement and will follow up with range and ordering details for wholesale buyers.',
    resources: [
      { label: 'Request the wholesale catalogue', path: '/catalogue' },
      { label: 'Wholesale supply overview', path: '/solutions/wholesale-carpet-supplier' },
      { label: 'How to import carpets from India', path: '/guides/how-to-import-carpets-from-india' },
    ],
  },
  {
    key: 'hospitality',
    match: /hospitality|hotel/i,
    headline: 'Thank you — your hospitality project enquiry is being reviewed',
    intro:
      'Thanks for considering Tapis Global International for your project. A consultant will review your spaces and specifications and prepare the right contract-grade options.',
    resources: [
      { label: 'Hospitality & hotel carpets', path: '/industries/hotel-carpets' },
      { label: 'Hotel carpet buying guide', path: '/guides/hotel-carpet-buying-guide' },
      { label: 'Request a project quote', path: '/contact' },
    ],
  },
  {
    key: 'designer',
    match: /designer|architect/i,
    headline: 'Thank you — samples & specifications for your project',
    intro:
      'Thanks for reaching out. For designers and architects we can provide a catalogue, samples and specification-ready detail (construction, fibre, sizing) for your drawings.',
    resources: [
      { label: 'Request catalogue & samples', path: '/catalogue' },
      { label: 'Designer rugs', path: '/solutions/designer-rugs' },
      { label: 'Specification reference: constructions compared', path: '/guides/hand-tufted-vs-hand-knotted-carpet' },
    ],
  },
  {
    key: 'private-label',
    match: /private label|oem/i,
    headline: 'Thank you — starting your private-label development',
    intro:
      'Thanks for your interest in developing your own range with us. We will follow up on OEM / private-label development under your brand.',
    resources: [
      { label: 'OEM & private-label overview', path: '/company/oem-private-label' },
      { label: 'How custom rug development works', path: '/guides/how-custom-rug-manufacturing-works' },
      { label: 'Custom manufacturing', path: '/company/custom-manufacturing' },
    ],
  },
  {
    key: 'large-buyer',
    match: /large buyer|distributor/i,
    headline: 'Thank you — let’s align on capabilities',
    intro:
      'Thanks for reaching out. We can walk you through our capabilities and arrange a factory video call so you can review the process before committing.',
    resources: [
      { label: 'Inside the factory', path: '/company/factory' },
      { label: 'Our export process', path: '/company/export-process' },
      { label: 'Request a factory video call', path: '/contact' },
    ],
  },
]

const DEFAULT_TEMPLATE: BuyerEmailTemplate = {
  key: 'general',
  match: /.*/,
  headline: 'Thank You for Contacting Us',
  intro:
    'We have received your enquiry and appreciate your interest in Tapis Global International. Our project team is reviewing your requirements and will contact you shortly.',
  resources: [
    { label: 'Browse product collections', path: '/products' },
    { label: 'Request the catalogue', path: '/catalogue' },
  ],
}

/** Pick the acknowledgement template for a buyer type (falls back to general). */
export function selectBuyerEmailTemplate(buyerType?: string): BuyerEmailTemplate {
  const value = (buyerType ?? '').trim()
  if (value) {
    const match = TEMPLATES.find((t) => t.match.test(value))
    if (match) return match
  }
  return DEFAULT_TEMPLATE
}

export function absoluteResourceUrl(path: string): string {
  return path.startsWith('http') ? path : `${SEO_BASE_URL}${path}`
}
