/**
 * lib/attribution-server.ts — server-side validation/normalization of the
 * attribution + UTM + click-id fields that arrive from the (untrusted) client.
 *
 * The browser sends these in the lead payload; we must not store/forward them
 * raw. This trims, length-caps, strips control chars, and restricts the charset
 * so nothing malformed or oversized reaches the sales email / records.
 */

type Fields = Record<string, string>

const SHORT = 200
const PATH = 512

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
const CLICK_KEYS = ['gclid', 'fbclid'] as const
const PAGE_KEYS = ['landing_page', 'current_page', 'referrer'] as const
const TS_KEYS = ['first_touch_at', 'last_touch_at'] as const

/** Remove ASCII control chars (0x00–0x1F, 0x7F) without literal control bytes. */
function stripCtrl(v: string): string {
  let out = ''
  for (let i = 0; i < v.length; i++) {
    const c = v.charCodeAt(i)
    if (c > 31 && c !== 127) out += v[i]
  }
  return out.trim()
}

export function normalizeAttribution(fields: Fields): Fields {
  const out: Fields = { ...fields }

  for (const k of [...UTM_KEYS, ...CLICK_KEYS]) {
    if (out[k] == null) continue
    // UTMs / click ids: conservative charset, short.
    const v = stripCtrl(out[k]).replace(/[^\w .\-/+%:@]/g, '').slice(0, SHORT)
    if (v) out[k] = v; else delete out[k]
  }
  for (const k of PAGE_KEYS) {
    if (out[k] == null) continue
    const v = stripCtrl(out[k]).replace(/[^\w\-./?=&%#:~]/g, '').slice(0, PATH)
    if (v) out[k] = v; else delete out[k]
  }
  for (const k of TS_KEYS) {
    if (out[k] == null) continue
    // Keep only if it parses as a date; store normalized ISO.
    const t = Date.parse(out[k])
    if (Number.isFinite(t)) out[k] = new Date(t).toISOString(); else delete out[k]
  }
  return out
}
