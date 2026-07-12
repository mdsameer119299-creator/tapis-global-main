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

export function readConsent(): Consent | null {
  if (typeof window === 'undefined') return null
  try {
    const v = localStorage.getItem(CONSENT_KEY)
    return v === 'granted' || v === 'denied' ? v : null
  } catch {
    return null
  }
}

export function setConsent(v: Consent): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(CONSENT_KEY, v) } catch { /* private mode */ }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: v }))
}
