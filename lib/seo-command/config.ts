/** Crawl size is configurable per environment (Vercel env var SEO_CRAWL_MAX_PAGES). Default stays 120 until changed on purpose. */
export const DEFAULT_CRAWL_MAX_PAGES = 120

export function crawlMaxPages(env: Record<string, string | undefined> = process.env): number {
  const n = Number(env.SEO_CRAWL_MAX_PAGES)
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_CRAWL_MAX_PAGES
  return Math.min(1000, Math.max(20, Math.floor(n)))
}
