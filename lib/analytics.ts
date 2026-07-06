/**
 * lib/analytics.ts — lightweight, provider-agnostic event layer.
 *
 * Pushes events to Google Analytics 4 via gtag() and to the GTM dataLayer when
 * either is present. It is a NO-OP when neither is loaded (e.g. local dev, or
 * before a GA4 tag is installed), so call sites never need to guard.
 *
 * No secrets live here. The GA4 Measurement ID (public by design) is injected
 * only through the GA tag in the layout using NEXT_PUBLIC_GA_ID — see
 * docs/analytics-events.md. Never place API keys or tokens in this file.
 */

/** Canonical B2B lead event names. Keep in sync with docs/analytics-events.md. */
export const LEAD_EVENTS = {
  catalogueRequest: 'catalogue_request',
  quoteRequest: 'quote_request',
  sampleRequest: 'sample_request',
  customDevelopmentEnquiry: 'custom_development_enquiry',
  factoryCallRequest: 'factory_call_request',
  whatsappClick: 'whatsapp_click',
  emailClick: 'email_click',
  formSubmitSuccess: 'form_submit_success',
} as const

export type LeadEventName = (typeof LEAD_EVENTS)[keyof typeof LEAD_EVENTS]

/** Common, low-cardinality parameters shared by lead events. */
export interface LeadEventParams {
  /** Buyer segment, e.g. 'importer' | 'hospitality' | 'designer' | 'private-label' | 'large-buyer'. */
  buyer_type?: string
  /** Product / category interest, e.g. 'hand-tufted-carpet'. */
  product?: string
  /** Page path or logical source the event fired from, e.g. '/products'. */
  source?: string
  /** Destination market (country) when known. */
  destination?: string
  [key: string]: string | number | boolean | undefined
}

type Gtag = (command: 'event', name: string, params?: Record<string, unknown>) => void

interface AnalyticsWindow extends Window {
  gtag?: Gtag
  dataLayer?: Record<string, unknown>[]
}

/** Fire an analytics event. Safe on the server and when no tag is installed. */
export function trackEvent(name: LeadEventName | string, params: LeadEventParams = {}): void {
  if (typeof window === 'undefined') return
  const w = window as AnalyticsWindow
  const payload = { event_category: 'lead', ...clean(params) }

  try {
    if (typeof w.gtag === 'function') {
      w.gtag('event', name, payload)
    }
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event: name, ...payload })
    }
  } catch {
    /* analytics must never break the UX */
  }
}

/** Drop undefined values so GA4 reports stay clean. */
function clean(params: LeadEventParams): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {}
  for (const [k, v] of Object.entries(params)) if (v !== undefined) out[k] = v
  return out
}
