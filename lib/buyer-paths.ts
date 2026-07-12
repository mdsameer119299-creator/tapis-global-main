/**
 * lib/buyer-paths.ts — buyer-segment → conversion-path configuration.
 *
 * Each of Tapis Global's five B2B buyer types gets a distinct primary CTA,
 * qualification intent, analytics event and pre-filled WhatsApp message. Used by
 * the BuyerPaths block and the QualificationForm so every page can route a
 * visitor to the right next step. Content here is descriptive guidance only — it
 * makes no claims about capacity, certifications, customers or pricing.
 */
import { LEAD_EVENTS, type LeadEventName } from '@/lib/analytics'
import type { EnquiryFormType } from '@/lib/submit-enquiry'

export type BuyerType = 'importer' | 'hospitality' | 'designer' | 'private-label' | 'large-buyer'

export interface BuyerPath {
  id: BuyerType
  /** Audience label shown on the card. */
  buyer: string
  /** One-line description of who this is for. */
  description: string
  /** Primary CTA button text. */
  ctaLabel: string
  /** Analytics event fired when this path is chosen / submitted. */
  event: LeadEventName
  /** Which enquiry pipeline the qualification form submits to. */
  formType: EnquiryFormType
  /** Human-readable intent recorded on the lead (email + CRM). */
  intent: string
  /** Pre-filled WhatsApp message for this buyer. */
  whatsappText: string
}

export const BUYER_PATHS: BuyerPath[] = [
  {
    id: 'importer',
    buyer: 'Importer / Wholesaler',
    description: 'Stock ranges, repeatable qualities and export-ready documentation for resale.',
    ctaLabel: 'Request Wholesale Catalogue',
    event: LEAD_EVENTS.catalogueRequest,
    formType: 'catalogue',
    intent: 'Wholesale catalogue request',
    whatsappText: "Hello Tapis Global, I'm an importer/wholesaler and would like your wholesale catalogue.",
  },
  {
    id: 'hospitality',
    buyer: 'Hotel / Hospitality Procurement',
    description: 'Contract-grade carpets for guestrooms, lobbies, banquet and F&B spaces.',
    ctaLabel: 'Request Project Quote',
    event: LEAD_EVENTS.quoteRequest,
    formType: 'inquiry',
    intent: 'Hospitality project quote',
    whatsappText: "Hello Tapis Global, I'm sourcing carpets for a hospitality project and would like a quote.",
  },
  {
    id: 'designer',
    buyer: 'Interior Designer / Architect',
    description: 'Custom colours, sizes and constructions with specification-ready details.',
    ctaLabel: 'Request Sample or Specification Pack',
    event: LEAD_EVENTS.sampleRequest,
    formType: 'inquiry',
    intent: 'Sample / specification pack request',
    whatsappText: "Hello Tapis Global, I'm a designer/architect and would like a sample or specification pack.",
  },
  {
    id: 'private-label',
    buyer: 'Private Label Brand',
    description: 'OEM / private-label development of your own rug range under your brand.',
    ctaLabel: 'Start Custom Rug Development',
    event: LEAD_EVENTS.customDevelopmentEnquiry,
    formType: 'custom',
    intent: 'Private-label / custom development',
    whatsappText: "Hello Tapis Global, I'd like to discuss private-label / custom rug development.",
  },
  {
    id: 'large-buyer',
    buyer: 'Large Buyer / Distributor',
    description: 'See the process first-hand and align on capabilities before committing.',
    ctaLabel: 'Request Factory Video Call',
    event: LEAD_EVENTS.factoryCallRequest,
    formType: 'inquiry',
    intent: 'Factory video call request',
    whatsappText: "Hello Tapis Global, I'd like to arrange a factory video call to review capabilities.",
  },
]

export function getBuyerPath(id: BuyerType): BuyerPath | undefined {
  return BUYER_PATHS.find((p) => p.id === id)
}
