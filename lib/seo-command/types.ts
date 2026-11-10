// SEO Command Centre: shared types. Pure data shapes, no I/O.

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
export type DataQuality = 'VERIFIED' | 'DERIVED' | 'ESTIMATED' | 'UNAVAILABLE'

export interface PageFacts {
  title: string | null
  metaDescription: string | null
  canonical: string | null
  robotsMeta: string | null
  h1s: string[]
  h2Count: number
  lang: string | null
  hreflangCount: number
  jsonLdTypes: string[]
  ogTitle: string | null
  ogImage: string | null
  hasViewport: boolean
  imageCount: number
  imagesMissingAlt: number
  internalLinks: string[]
  externalLinkCount: number
  wordCount: number
  textHash: string
}

export interface PageResult {
  url: string // normalised URL that was requested
  finalUrl: string // after redirects
  statusCode: number | null // final status, null on network error
  redirectChain: { url: string; status: number }[]
  responseMs: number | null
  contentType: string | null
  facts: PageFacts | null // null for non-HTML or failed fetches
  inSitemap: boolean
  disallowedByRobots: boolean
  error: string | null
  linkedFrom: string[] // internal pages that link here (capped)
}

export interface Issue {
  code: string
  severity: Severity
  url: string | null
  detail: Record<string, unknown>
  dataQuality: DataQuality
  fingerprint: string
}
