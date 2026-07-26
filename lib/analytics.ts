/**
 * lib/analytics.ts — typed, centralized, privacy-safe analytics event layer.
 *
 * Sends events to Google Analytics 4 (via gtag) and mirrors to the GTM
 * dataLayer when present. It is a NO-OP on the server and when no tag is
 * installed (no env IDs), so call sites never need to guard.
 *
 * PRIVACY: This layer must NEVER receive PII. Do not pass name, email, phone,
 * WhatsApp, free-form chat text, uploaded file contents, or exact identifiers.
 * Only low-cardinality categorical metadata (buyer_type, category, material,
 * source path, coarse flags) is allowed. `sanitizeParams()` strips anything
 * that looks like an email/phone as a defensive backstop.
 *
 * No secrets live here. The GA4 Measurement ID and Clarity Project ID are
 * public-by-design and are injected only via NEXT_PUBLIC_* env vars in the
 * Analytics component — never API keys/tokens.
 */

/** Canonical B2B event names. Keep in sync with docs/ANALYTICS-SETUP.md. */
export const EVENTS = {
  // Catalogue funnel. NOTE: these track the REQUEST lifecycle (submission
  // accepted/failed server-side), NOT confirmed email delivery — the site does
  // not auto-deliver a catalogue file, so we must not imply delivery.
  catalogueRequestOpen:    'catalogue_request_open',
  catalogueRequestSubmit:  'catalogue_request_submit',
  catalogueRequestSuccess: 'catalogue_request_success',
  catalogueRequestFailure: 'catalogue_request_failure',
  // Quotation / sample / contact
  quotationStart:   'quotation_start',
  quotationSubmit:  'quotation_submit',
  sampleRequestStart:  'sample_request_start',
  sampleRequestSubmit: 'sample_request_submit',
  contactFormStart:  'contact_form_start',
  contactFormSubmit: 'contact_form_submit',
  // Micro-conversions
  whatsappClick: 'whatsapp_click',
  phoneClick:    'phone_click',
  emailClick:    'email_click',
  productCtaClick:     'product_cta_click',
  industryCtaClick:    'industry_cta_click',
  countryEnquiryClick: 'country_enquiry_click',
  indiaEnquiryClick:   'india_enquiry_click',
  guideToCommercialClick: 'guide_to_commercial_click',
  // TARA (AI Rug Advisor)
  taraOpen:  'tara_open',
  taraClose: 'tara_close',
  taraMessageSent:      'tara_message_sent',
  taraQuickAction:      'tara_quick_action',
  taraCategorySelected: 'tara_category_selected',
  taraMaterialSelected: 'tara_material_selected',
  taraProjectQualified: 'tara_project_qualified',
  taraLeadCaptureStart:  'tara_lead_capture_start',
  taraLeadCaptureSubmit: 'tara_lead_capture_submit',
  taraHandoffRequested:  'tara_handoff_requested',
  taraHandoffCompleted:  'tara_handoff_completed',
} as const

export type EventName = (typeof EVENTS)[keyof typeof EVENTS]

/** Low-cardinality, non-PII parameters only. */
export interface EventParams {
  buyer_type?: string
  category?: string
  material?: string
  construction?: string
  source?: string
  destination?: string
  lead_temperature?: 'hot' | 'warm' | 'nurture'
  value?: number
  [key: string]: string | number | boolean | undefined
}

type Gtag = (command: string, targetOrName: string, params?: Record<string, unknown>) => void
interface AnalyticsWindow extends Window {
  gtag?: Gtag
  dataLayer?: Record<string, unknown>[]
}

const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/
const PHONE_RE = /(?:\+?\d[\s-]?){7,}/

/** Defensive backstop: drop undefined + refuse anything that looks like PII. */
export function sanitizeParams(params: EventParams): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {}
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue
    if (typeof v === 'string') {
      if (EMAIL_RE.test(v) || PHONE_RE.test(v)) continue // never forward PII
      out[k] = v.slice(0, 100)
    } else {
      out[k] = v
    }
  }
  return out
}

// Dispatch mode. DEFAULT 'gtag' = direct GA4 via gtag.js — the ONLY canonical
// path, so an event is sent exactly once (gtag manages dataLayer internally; we
// must NOT also push the same event to dataLayer, which would double-process).
// Set NEXT_PUBLIC_ANALYTICS_MODE=gtm ONLY if a GTM container is installed; then
// events go to dataLayer as GTM custom events instead. The two modes are never
// mixed.
const GTM_MODE = process.env.NEXT_PUBLIC_ANALYTICS_MODE === 'gtm'

/** Single canonical dispatch. Exactly one sink per call; no double delivery. */
function dispatch(name: string, payload: Record<string, string | number | boolean>): void {
  if (typeof window === 'undefined') return
  const w = window as AnalyticsWindow
  try {
    if (GTM_MODE) {
      if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event: name, ...payload })
    } else if (typeof w.gtag === 'function') {
      w.gtag('event', name, payload)
    }
  } catch {
    /* analytics must never break UX */
  }
}

/** Fire an analytics event. Safe on the server and when no tag is installed. */
export function trackEvent(name: EventName | string, params: EventParams = {}): void {
  dispatch(name, { event_category: 'engagement', ...sanitizeParams(params) })
}

/** Manual GA4 page_view for App Router client navigation (no PII). */
export function trackPageView(path: string): void {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  dispatch('page_view', { page_path: path, page_location: origin + path })
}
