export interface SitemapEntry {
  loc: string
  lastmod: string | null
}
export interface ParsedSitemap {
  kind: 'urlset' | 'index' | 'invalid'
  entries: SitemapEntry[] // urlset entries, or child sitemaps for an index
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .trim()
}

export function parseSitemap(xml: string): ParsedSitemap {
  const isIndex = /<sitemapindex[\s>]/i.test(xml)
  const isUrlset = /<urlset[\s>]/i.test(xml)
  if (!isIndex && !isUrlset) return { kind: 'invalid', entries: [] }
  const tag = isIndex ? 'sitemap' : 'url'
  const re = new RegExp(`<${tag}[\\s>]([\\s\\S]*?)</${tag}>`, 'gi')
  const entries: SitemapEntry[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(xml))) {
    const loc = /<loc>([\s\S]*?)<\/loc>/i.exec(m[1])
    if (!loc) continue
    const lm = /<lastmod>([\s\S]*?)<\/lastmod>/i.exec(m[1])
    entries.push({ loc: decode(loc[1]), lastmod: lm ? decode(lm[1]) : null })
  }
  return { kind: isIndex ? 'index' : 'urlset', entries }
}

export interface SitemapFinding {
  code: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  message: string
  detail?: Record<string, unknown>
}

const MAX_URLS = 50000

export function validateSitemapEntries(entries: SitemapEntry[], siteOrigin: string, sitemapUrl: string): SitemapFinding[] {
  const out: SitemapFinding[] = []
  if (entries.length === 0) {
    out.push({ code: 'SITEMAP_EMPTY', severity: 'HIGH', message: 'The sitemap lists no URLs.', detail: { sitemap: sitemapUrl } })
    return out
  }
  if (entries.length > MAX_URLS) {
    out.push({ code: 'SITEMAP_TOO_LARGE', severity: 'HIGH', message: `A sitemap may list at most ${MAX_URLS} URLs.`, detail: { sitemap: sitemapUrl, count: entries.length } })
  }
  const seen = new Set<string>()
  const dupes: string[] = []
  const wrongHost: string[] = []
  const badLastmod: string[] = []
  const insecure: string[] = []
  const siteHost = new URL(siteOrigin).host.replace(/^www\./, '')
  for (const e of entries) {
    if (seen.has(e.loc)) dupes.push(e.loc)
    seen.add(e.loc)
    try {
      const u = new URL(e.loc)
      if (u.host.replace(/^www\./, '') !== siteHost) wrongHost.push(e.loc)
      if (u.protocol !== 'https:') insecure.push(e.loc)
    } catch {
      wrongHost.push(e.loc)
    }
    if (e.lastmod && Number.isNaN(Date.parse(e.lastmod))) badLastmod.push(e.loc)
  }
  if (dupes.length) out.push({ code: 'SITEMAP_DUPLICATE_URLS', severity: 'LOW', message: `${dupes.length} duplicate URL(s) in the sitemap.`, detail: { sitemap: sitemapUrl, examples: dupes.slice(0, 10) } })
  if (wrongHost.length) out.push({ code: 'SITEMAP_WRONG_HOST', severity: 'HIGH', message: `${wrongHost.length} URL(s) belong to a different host.`, detail: { sitemap: sitemapUrl, examples: wrongHost.slice(0, 10) } })
  if (insecure.length) out.push({ code: 'SITEMAP_NON_HTTPS', severity: 'MEDIUM', message: `${insecure.length} URL(s) are not HTTPS.`, detail: { sitemap: sitemapUrl, examples: insecure.slice(0, 10) } })
  if (badLastmod.length) out.push({ code: 'SITEMAP_BAD_LASTMOD', severity: 'LOW', message: `${badLastmod.length} URL(s) have an unparseable <lastmod>.`, detail: { sitemap: sitemapUrl, examples: badLastmod.slice(0, 10) } })
  return out
}
