/** First-party keyword intelligence from Search Console data ONLY. Pure functions over aggregated rows (the SQL lives in daily-report.ts).
 *  Rankings here are Google Search Console impression-weighted AVERAGE positions for the stated period, not exact rank checks. No third-party ranking, volume or competitor-traffic data is used or invented.
 *  Thresholds are transparent heuristics (exported constants), not Google facts. */
export interface QueryAgg { query: string; clicks: number; impressions: number; position: number }
export interface QueryAggPrev { query: string; clicks: number; impressions: number }
export interface QueryPageAgg { query: string; page: string; clicks: number; impressions: number }
export interface CountryAgg { country: string; clicks: number; impressions: number; position: number }

export const THRESHOLDS = {
  lowCtrMinImpressions: 50, lowCtrMaxCtr: 0.02, lowCtrMaxPosition: 10,
  strikingMinPosition: 4, strikingMaxPosition: 20, strikingMinImpressions: 20,
  declineMinPrevImpressions: 50, declineMinDropRatio: 0.3,
  countryMinImpressions: 100, countryMaxCtr: 0.015,
} as const

export const PRODUCT_CATEGORIES: [string, RegExp][] = [
  ['Hand-tufted carpets', /hand[\s-]*tuft/i], ['Hand-knotted carpets', /hand[\s-]*knott?ed/i], ['Wool carpets', /\bwool(l?en)?\b/i],
  ['Jute rugs', /\bjute\b/i], ['Coir mats', /\bcoir\b/i], ['Dhurries', /dhurr?ie|durrie|dhurry/i], ['Custom carpets and rugs', /\bcustom|bespoke|personali[sz]ed|made[\s-]*to[\s-]*order/i],
  ['Carpets and rugs (general)', /\b(carpets?|rugs?)\b/i],
]
const COMMERCIAL = /\b(manufacturer|manufacturers|exporter|exporters|wholesale|wholesaler|supplier|suppliers|bulk|b2b|oem|factory|price|prices|buy|buyers?|export|import|vendor)\b/i

export const categoryOf = (q: string): string => PRODUCT_CATEGORIES.find(([, re]) => re.test(q))?.[0] ?? 'Other / unclassified'
export const isCommercial = (q: string): boolean => COMMERCIAL.test(q)
const ctr = (c: number, i: number) => (i > 0 ? c / i : 0)
const pct = (x: number) => Math.round(x * 1000) / 10

export interface KeywordIntel {
  window: { start: string; end: string; previousStart: string; previousEnd: string }
  anonymizedNote: string
  lowCtr: { query: string; impressions: number; clicks: number; ctrPct: number; position: number; category: string }[]
  striking: { query: string; impressions: number; clicks: number; position: number; category: string }[]
  declining: { query: string; clicksNow: number; clicksBefore: number; impressionsNow: number; impressionsBefore: number; dropPct: number }[]
  categories: { category: string; queries: number; clicks: number; impressions: number; commercialImpressions: number }[]
  countries: { country: string; impressions: number; clicks: number; ctrPct: number; position: number; flag: 'LOW_CTR' | null }[]
  pageMap: { page: string; clicks: number; impressions: number; topQueries: string[] }[]
}

export function analyseKeywords(a: { window: KeywordIntel['window']; current: QueryAgg[]; previous: QueryAggPrev[]; queryPages: QueryPageAgg[]; countries: CountryAgg[]; limit?: number }): KeywordIntel {
  const L = a.limit ?? 15, T = THRESHOLDS
  const lowCtr = a.current.filter((r) => r.impressions >= T.lowCtrMinImpressions && ctr(r.clicks, r.impressions) < T.lowCtrMaxCtr && r.position <= T.lowCtrMaxPosition)
    .sort((x, y) => y.impressions - x.impressions).slice(0, L).map((r) => ({ query: r.query, impressions: r.impressions, clicks: r.clicks, ctrPct: pct(ctr(r.clicks, r.impressions)), position: Math.round(r.position * 10) / 10, category: categoryOf(r.query) }))
  const striking = a.current.filter((r) => r.position >= T.strikingMinPosition && r.position <= T.strikingMaxPosition && r.impressions >= T.strikingMinImpressions)
    .sort((x, y) => y.impressions - x.impressions).slice(0, L).map((r) => ({ query: r.query, impressions: r.impressions, clicks: r.clicks, position: Math.round(r.position * 10) / 10, category: categoryOf(r.query) }))
  const now = new Map(a.current.map((r) => [r.query, r]))
  const declining = a.previous.filter((p) => p.impressions >= T.declineMinPrevImpressions).map((p) => {
    const c = now.get(p.query); const impNow = c?.impressions ?? 0; const clkNow = c?.clicks ?? 0
    return { query: p.query, clicksNow: clkNow, clicksBefore: p.clicks, impressionsNow: impNow, impressionsBefore: p.impressions, dropPct: pct(1 - impNow / p.impressions) }
  }).filter((r) => r.dropPct >= T.declineMinDropRatio * 100).sort((x, y) => y.impressionsBefore - x.impressionsBefore).slice(0, L)
  const cat = new Map<string, { queries: number; clicks: number; impressions: number; commercialImpressions: number }>()
  for (const r of a.current) { const k = categoryOf(r.query); const e = cat.get(k) ?? { queries: 0, clicks: 0, impressions: 0, commercialImpressions: 0 }; e.queries++; e.clicks += r.clicks; e.impressions += r.impressions; if (isCommercial(r.query)) e.commercialImpressions += r.impressions; cat.set(k, e) }
  const categories = Array.from(cat.entries()).map(([category, v]) => ({ category, ...v })).sort((x, y) => y.impressions - x.impressions)
  const countries = a.countries.map((r) => ({ country: r.country, impressions: r.impressions, clicks: r.clicks, ctrPct: pct(ctr(r.clicks, r.impressions)), position: Math.round(r.position * 10) / 10,
    flag: (r.impressions >= T.countryMinImpressions && ctr(r.clicks, r.impressions) < T.countryMaxCtr ? 'LOW_CTR' : null) as 'LOW_CTR' | null })).sort((x, y) => y.impressions - x.impressions).slice(0, L)
  const pages = new Map<string, { clicks: number; impressions: number; qs: QueryPageAgg[] }>()
  for (const r of a.queryPages) { const e = pages.get(r.page) ?? { clicks: 0, impressions: 0, qs: [] }; e.clicks += r.clicks; e.impressions += r.impressions; e.qs.push(r); pages.set(r.page, e) }
  const pageMap = Array.from(pages.entries()).map(([page, v]) => ({ page, clicks: v.clicks, impressions: v.impressions, topQueries: v.qs.sort((x, y) => y.impressions - x.impressions).slice(0, 5).map((x) => x.query) })).sort((x, y) => y.impressions - x.impressions).slice(0, L)
  return { window: a.window, anonymizedNote: 'Search Console omits anonymized queries from query-level data, so query-level totals are lower than the daily totals.', lowCtr, striking, declining, categories, countries, pageMap }
}
