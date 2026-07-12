/**
 * lib/knowledge/content.ts — the content engine loader (SERVER-ONLY).
 *
 * Knowledge is authored OUTSIDE application code as JSON files in
 * `content/knowledge/*.json` (drop a file → a new article; no code change).
 * This module reads, validates and memoizes them. Used by the knowledge routes
 * (build-time SSG) and the TARA route (server) — never imported by client code
 * (it uses `fs`, which keeps it server-only). See docs/CONTENT-ENGINE.md.
 */
import fs from 'fs'
import path from 'path'
import type { KnowledgeArticle } from './types'

const DIR = path.join(process.cwd(), 'content', 'knowledge')

let cache: KnowledgeArticle[] | null = null

function isValid(a: unknown): a is KnowledgeArticle {
  const o = a as Partial<KnowledgeArticle>
  return Boolean(o && typeof o.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(o.slug)
    && typeof o.category === 'string' && typeof o.title === 'string' && typeof o.summary === 'string'
    && o.seo && typeof o.seo.title === 'string' && typeof o.seo.description === 'string')
}

/** Load + validate all article files. Memoized. Malformed files are skipped. */
export function loadKnowledgeArticles(): KnowledgeArticle[] {
  if (cache) return cache
  let files: string[] = []
  try { files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json')) } catch { cache = []; return cache }
  const out: KnowledgeArticle[] = []
  const seen = new Set<string>()
  for (const f of files.sort()) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))
      if (isValid(raw) && !seen.has(raw.slug)) { seen.add(raw.slug); out.push(raw) }
    } catch { /* skip malformed file */ }
  }
  cache = out
  return out
}

export function getPublishedArticles(): KnowledgeArticle[] {
  return loadKnowledgeArticles().filter((a) => a.status !== 'draft')
}
export function getKnowledgeArticle(slug: string): KnowledgeArticle | undefined {
  return loadKnowledgeArticles().find((a) => a.slug === slug)
}
export function getPublishedArticleSlugs(): string[] {
  return getPublishedArticles().map((a) => a.slug)
}
export function getArticlesByCategory(category: string): KnowledgeArticle[] {
  return getPublishedArticles().filter((a) => a.category === category)
}

const STOP = new Set('a an the and or of to for in on with we our you your is are be as at by from that this it can do does what how which where when about'.split(' '))
const tok = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w))

/** Rank published articles against a query (for TARA retrieval). */
export function searchKnowledgeArticles(query: string, limit = 3): KnowledgeArticle[] {
  const qt = tok(query)
  if (!qt.length) return []
  return getPublishedArticles()
    .map((a) => {
      const hay = `${a.title} ${a.summary} ${(a.taraTags ?? []).join(' ')} ${(a.body ?? []).map((s) => s.h2 + ' ' + s.body).join(' ')}`.toLowerCase()
      let score = 0
      for (const t of qt) { if ((a.taraTags ?? []).some((tag) => tag.toLowerCase().includes(t))) score += 3; else if (hay.includes(t)) score += 1 }
      return { a, score }
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((x) => x.a)
}
