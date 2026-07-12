/**
 * lib/attribution.ts — silent conversion-attribution capture (client-side).
 *
 * Records where a lead came from so enquiries can be tied to source/campaign
 * (revenue attribution), not just traffic. First-touch UTMs + landing page +
 * referrer are persisted for the session so they survive internal navigation;
 * live context (device, browser, language, timezone, screen, time) is read at
 * submit. Everything is captured silently and is NOT user-editable — the form
 * merges these into the CRM payload as read-only fields.
 *
 * No personal data beyond what the browser exposes; no third-party calls.
 */

const FIRST_TOUCH_KEY = 'tgi_first_touch'

interface FirstTouch {
  landingPage?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  ts?: string
}

/** Store first-touch attribution once per session (call on first page load). */
export function persistFirstTouch(): void {
  if (typeof window === 'undefined') return
  try {
    if (sessionStorage.getItem(FIRST_TOUCH_KEY)) return
    const p = new URLSearchParams(window.location.search)
    const ft: FirstTouch = {
      landingPage: window.location.pathname + window.location.search,
      referrer: document.referrer || '',
      utmSource: p.get('utm_source') || '',
      utmMedium: p.get('utm_medium') || '',
      utmCampaign: p.get('utm_campaign') || '',
      utmTerm: p.get('utm_term') || '',
      utmContent: p.get('utm_content') || '',
      ts: new Date().toISOString(),
    }
    sessionStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(ft))
  } catch {
    /* storage may be unavailable (private mode) — attribution is best-effort */
  }
}

function readFirstTouch(): FirstTouch {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(sessionStorage.getItem(FIRST_TOUCH_KEY) || '{}') as FirstTouch
  } catch {
    return {}
  }
}

function detectDevice(): string {
  const ua = navigator.userAgent
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'Mobile'
  if (/iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobi/i.test(ua))) return 'Tablet'
  return 'Desktop'
}

function detectBrowser(): string {
  const ua = navigator.userAgent
  if (/Edg\//.test(ua)) return 'Edge'
  if (/OPR\/|Opera/.test(ua)) return 'Opera'
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return 'Chrome'
  if (/Firefox\//.test(ua)) return 'Firefox'
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return 'Safari'
  return 'Other'
}

/** Read the full attribution snapshot at submit time. Empty on the server. */
export function captureAttribution(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const ft = readFirstTouch()
  const p = new URLSearchParams(window.location.search)
  const utm = (k: keyof FirstTouch, param: string) => ft[k] || p.get(param) || ''

  const snapshot: Record<string, string> = {
    landingPage: ft.landingPage || window.location.pathname,
    currentUrl: window.location.href,
    referrer: ft.referrer ?? document.referrer ?? '',
    utmSource: utm('utmSource', 'utm_source'),
    utmMedium: utm('utmMedium', 'utm_medium'),
    utmCampaign: utm('utmCampaign', 'utm_campaign'),
    utmTerm: utm('utmTerm', 'utm_term'),
    utmContent: utm('utmContent', 'utm_content'),
    language: navigator.language || '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    screenSize: `${window.screen.width}x${window.screen.height}`,
    device: detectDevice(),
    browser: detectBrowser(),
    submittedAt: new Date().toISOString(),
  }

  // Drop empties so the CRM/email only shows what we actually know.
  return Object.fromEntries(Object.entries(snapshot).filter(([, v]) => v))
}
