/**
 * lib/attribution.ts — privacy-conscious first-touch & last-touch attribution.
 *
 * Ties an enquiry to its marketing source without invasive fingerprinting.
 * We persist ONLY: landing page, referrer, UTMs, gclid, fbclid, and timestamps
 * — first-touch (once, persisted) and last-touch (updated when a new campaign
 * context appears). No device/screen/timezone fingerprint, no exact location.
 *
 * Storage is first-party localStorage. On submit, `captureAttribution()` returns
 * a flat snapshot merged into the lead payload server-side; it is not re-exposed
 * to the browser after submission.
 */

export interface Touch {
  landing_page?: string
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  gclid?: string
  fbclid?: string
  at?: string
}

export interface AttributionSnapshot {
  first_touch_at?: string
  last_touch_at?: string
  landing_page?: string        // first-touch landing
  current_page?: string        // last-touch landing
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  gclid?: string
  fbclid?: string
}

const FIRST_KEY = 'tgi_first_touch'
const LAST_KEY = 'tgi_last_touch'

function readTouch(params: URLSearchParams): Touch {
  const g = (k: string) => params.get(k) || undefined
  return {
    landing_page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    referrer: typeof document !== 'undefined' ? (document.referrer || undefined) : undefined,
    utm_source: g('utm_source'),
    utm_medium: g('utm_medium'),
    utm_campaign: g('utm_campaign'),
    utm_content: g('utm_content'),
    utm_term: g('utm_term'),
    gclid: g('gclid'),
    fbclid: g('fbclid'),
    at: new Date().toISOString(),
  }
}

function hasCampaignSignal(t: Touch): boolean {
  return Boolean(t.utm_source || t.utm_medium || t.utm_campaign || t.gclid || t.fbclid || t.referrer)
}

function get(key: string): Touch | null {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as Touch) : null } catch { return null }
}
function set(key: string, t: Touch): void {
  try { localStorage.setItem(key, JSON.stringify(t)) } catch { /* private mode — best effort */ }
}

/**
 * Call once on each page load. Sets first-touch if unset; updates last-touch
 * when the current visit carries a new campaign signal (or has no last-touch).
 */
export function persistAttribution(): void {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const now = readTouch(params)
  if (!get(FIRST_KEY)) set(FIRST_KEY, now)
  const last = get(LAST_KEY)
  if (!last || hasCampaignSignal(now)) set(LAST_KEY, now)
}

/** Flat, PII-free attribution snapshot for the lead payload. Empty on server. */
export function captureAttribution(): AttributionSnapshot {
  if (typeof window === 'undefined') return {}
  const first = get(FIRST_KEY) || readTouch(new URLSearchParams(window.location.search))
  const last = get(LAST_KEY) || first
  const snap: AttributionSnapshot = {
    first_touch_at: first.at,
    last_touch_at: last.at,
    landing_page: first.landing_page,
    current_page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    referrer: first.referrer,
    utm_source: last.utm_source || first.utm_source,
    utm_medium: last.utm_medium || first.utm_medium,
    utm_campaign: last.utm_campaign || first.utm_campaign,
    utm_content: last.utm_content || first.utm_content,
    utm_term: last.utm_term || first.utm_term,
    gclid: last.gclid || first.gclid,
    fbclid: last.fbclid || first.fbclid,
  }
  return Object.fromEntries(Object.entries(snap).filter(([, v]) => v)) as AttributionSnapshot
}
