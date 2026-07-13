/**
 * lib/consent.ts — first-party analytics consent (client-only).
 *
 * GA4 and Microsoft Clarity load ONLY after the visitor grants consent. Until
 * then (and if declined) no third-party analytics script is injected. Consent
 * is stored first-party; changes broadcast a window event so the Analytics
 * component can react without a reload.
 */

export const CONSENT_KEY = 'tgi_analytics_consent'
export const CONSENT_EVENT = 'tgi-consent'
export type Consent = 'granted' | 'denied'

/**
 * The visitor's decision persists for 12 months. Returning visitors within this
 * window are not asked again; after it lapses the record is dropped so consent
 * can be re-confirmed. Stored as { v, t } so we can honour the expiry.
 */
export const CONSENT_MAX_AGE_DAYS = 365
const CONSENT_MAX_AGE_MS = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000

export function readConsent(): Consent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    // Legacy plain-string records (pre-expiry format) stay valid.
    if (raw === 'granted' || raw === 'denied') return raw
    const parsed = JSON.parse(raw) as { v?: unknown; t?: unknown }
    const v = parsed?.v
    const t = parsed?.t
    if ((v !== 'granted' && v !== 'denied') || typeof t !== 'number') return null
    if (Date.now() - t > CONSENT_MAX_AGE_MS) {
      localStorage.removeItem(CONSENT_KEY) // expired — ask again
      return null
    }
    return v
  } catch {
    return null
  }
}

export function setConsent(v: Consent): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ v, t: Date.now() })) } catch { /* private mode */ }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: v }))
}
