import { createHash } from 'crypto'
import { parse } from 'node-html-parser'
import type { PageFacts } from './types'

const SKIP_EXT = /\.(jpe?g|png|gif|webp|avif|svg|ico|pdf|css|js|mjs|json|xml|txt|zip|gz|mp4|webm|mp3|woff2?|ttf|eot|map)(\?.*)?$/i

/** Host comparison ignores a leading "www." so www/non-www count as one site. */
export function sameSite(a: string, b: string): boolean {
  const strip = (h: string) => h.toLowerCase().replace(/^www\./, '')
  try {
    return strip(new URL(a).hostname) === strip(new URL(b).hostname)
  } catch {
    return false
  }
}

/** Normalises a URL for crawl de-duplication: no fragment, no default port, no trailing-slash
 * variance except for the root, tracking params removed. Returns null if not http(s). */
export function normaliseUrl(raw: string, base?: string): string | null {
  let u: URL
  try {
    u = new URL(raw, base)
  } catch {
    return null
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
  u.hash = ''
  for (const key of Array.from(u.searchParams.keys())) {
    if (/^(utm_|gclid$|fbclid$|msclkid$)/i.test(key)) u.searchParams.delete(key)
  }
  u.searchParams.sort()
  let path = u.pathname.replace(/\/{2,}/g, '/')
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
  u.pathname = path
  return u.toString()
}

export function isCrawlableHref(url: string): boolean {
  try {
    return !SKIP_EXT.test(new URL(url).pathname)
  } catch {
    return false
  }
}

function clean(s: string | undefined | null): string {
  return (s ?? '').replace(/\s+/g, ' ').trim()
}

function collectJsonLdTypes(node: unknown, out: Set<string>): void {
  if (Array.isArray(node)) {
    node.forEach((n) => collectJsonLdTypes(n, out))
    return
  }
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>
    const t = obj['@type']
    if (typeof t === 'string') out.add(t)
    else if (Array.isArray(t)) t.forEach((x) => typeof x === 'string' && out.add(x))
    if (obj['@graph']) collectJsonLdTypes(obj['@graph'], out)
  }
}

export function extractPageFacts(html: string, pageUrl: string): PageFacts {
  const root = parse(html)

  const metaContent = (selector: string): string | null => {
    const v = root.querySelector(selector)?.getAttribute('content')
    const c = clean(v)
    return c ? c : null
  }

  const title = clean(root.querySelector('head title')?.text ?? root.querySelector('title')?.text) || null
  const canonicalRaw = root.querySelector('link[rel="canonical"]')?.getAttribute('href')
  let canonical: string | null = null
  if (canonicalRaw) {
    try {
      canonical = new URL(canonicalRaw, pageUrl).toString()
    } catch {
      canonical = canonicalRaw
    }
  }

  const jsonLd = new Set<string>()
  for (const s of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      collectJsonLdTypes(JSON.parse(s.rawText), jsonLd)
    } catch {
      jsonLd.add('INVALID_JSON')
    }
  }

  const images = root.querySelectorAll('img')
  const imagesMissingAlt = images.filter((i) => {
    const alt = i.getAttribute('alt')
    // alt="" is a valid way to mark a decorative image; only a missing attribute is flagged.
    return alt === undefined || alt === null
  }).length

  const internal = new Set<string>()
  let external = 0
  for (const a of root.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href') ?? ''
    if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:|sms:|whatsapp:)/i.test(href)) continue
    const n = normaliseUrl(href, pageUrl)
    if (!n) continue
    if (sameSite(n, pageUrl)) internal.add(n)
    else external++
  }

  // Visible text: drop non-content nodes before counting words and hashing.
  for (const el of root.querySelectorAll('script, style, noscript, template')) el.remove()
  const bodyText = clean(root.querySelector('body')?.text ?? root.text)
  const words = bodyText ? bodyText.split(' ').filter(Boolean) : []

  return {
    title,
    metaDescription: metaContent('meta[name="description"]'),
    canonical,
    robotsMeta: metaContent('meta[name="robots"]'),
    h1s: root.querySelectorAll('h1').map((h) => clean(h.text)).filter(Boolean),
    h2Count: root.querySelectorAll('h2').length,
    lang: root.querySelector('html')?.getAttribute('lang') ?? null,
    hreflangCount: root.querySelectorAll('link[rel="alternate"][hreflang]').length,
    jsonLdTypes: Array.from(jsonLd).sort(),
    ogTitle: metaContent('meta[property="og:title"]'),
    ogImage: metaContent('meta[property="og:image"]'),
    hasViewport: !!root.querySelector('meta[name="viewport"]'),
    imageCount: images.length,
    imagesMissingAlt,
    internalLinks: Array.from(internal),
    externalLinkCount: external,
    wordCount: words.length,
    textHash: createHash('sha1').update(bodyText.toLowerCase()).digest('hex'),
  }
}
