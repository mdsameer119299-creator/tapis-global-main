import { randomUUID } from 'crypto'
import { withSeoTx } from './db'
import { audit } from './store'

export interface PsiMetrics {
  perfScore: number | null
  lcpMs: number | null
  cls: number | null
  inpMs: number | null
  tbtMs: number | null
  fcpMs: number | null
  fieldDataAvailable: boolean
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)

/** Parses a PageSpeed Insights v5 response. Lab values (Lighthouse) are measured; field data (CrUX) is only flagged when present. */
export function parsePsi(json: any): PsiMetrics {
  const lh = json?.lighthouseResult
  const a = lh?.audits ?? {}
  const score = num(lh?.categories?.performance?.score)
  const field = json?.loadingExperience?.metrics
  return {
    perfScore: score === null ? null : Math.round(score * 100),
    lcpMs: num(a['largest-contentful-paint']?.numericValue) === null ? null : Math.round(a['largest-contentful-paint'].numericValue),
    cls: num(a['cumulative-layout-shift']?.numericValue),
    inpMs: num(field?.INTERACTION_TO_NEXT_PAINT?.percentile),
    tbtMs: num(a['total-blocking-time']?.numericValue) === null ? null : Math.round(a['total-blocking-time'].numericValue),
    fcpMs: num(a['first-contentful-paint']?.numericValue) === null ? null : Math.round(a['first-contentful-paint'].numericValue),
    fieldDataAvailable: !!field && Object.keys(field).length > 0,
  }
}

export async function measurePageSpeed(opts: { siteId: string; url: string; strategy: 'mobile' | 'desktop'; actor: string; fetchImpl?: typeof fetch; apiKey?: string | undefined }) {
  const f = opts.fetchImpl ?? fetch
  const key = opts.apiKey ?? process.env.PSI_API_KEY
  const api = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed')
  api.searchParams.set('url', opts.url)
  api.searchParams.set('strategy', opts.strategy)
  api.searchParams.set('category', 'performance')
  if (key) api.searchParams.set('key', key)
  let metrics: PsiMetrics | null = null
  let error: string | null = null
  try {
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), 55_000)
    try {
      const res = await f(api.toString(), { signal: ctl.signal })
      const body = await res.json().catch(() => null)
      if (!res.ok) error = `PageSpeed API HTTP ${res.status}${body?.error?.message ? ': ' + String(body.error.message).slice(0, 160) : ''}`
      else metrics = parsePsi(body)
    } finally {
      clearTimeout(timer)
    }
  } catch (e) {
    error = (e instanceof Error ? (e.name === 'AbortError' ? 'timeout' : e.message) : String(e)).slice(0, 200)
  }
  const m = metrics
  await withSeoTx(async (c) => {
    await c.query(
      `INSERT INTO seo_page_speed (id,"siteId",url,strategy,"perfScore","lcpMs",cls,"inpMs","tbtMs","fcpMs","fieldDataAvailable","dataQuality",source,error) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::"SeoDataQuality",'PSI',$13)`,
      [randomUUID(), opts.siteId, opts.url, opts.strategy, m?.perfScore ?? null, m?.lcpMs ?? null, m?.cls ?? null, m?.inpMs ?? null, m?.tbtMs ?? null, m?.fcpMs ?? null, m?.fieldDataAvailable ?? false, m ? 'VERIFIED' : 'UNAVAILABLE', error],
    )
    await audit(c, opts.siteId, opts.actor, 'pagespeed.measured', 'seo_page_speed', null, { url: opts.url, strategy: opts.strategy, error })
  })
  return { metrics: m, error }
}
