/**
 * lib/knowledge/content.ts — the content engine loader (SERVER-ONLY).
 *
 * Knowledge is authored OUTSIDE application code as JSON files in
 * `content/knowledge/*.json` (drop a file → a new article; no code change).
 * This module reads, validates and memoizes them. Used by the knowledge routes
 * (build-time SSG) and the TARA route (server) — never imported by client code
 * (it uses `fs`, which keeps it server-only). See docs/CONTENT-ENGINE.md.
 *
 * Validation is shared with the STRICT build/CI gate
 * (`scripts/validate-knowledge.mjs`): at runtime invalid files are skipped
 * (defensive), but the build fails if any file is malformed/invalid so bad
 * content can never ship.
 */
import fs from 'fs'
import path from 'path'
import type { KnowledgeArticle } from './types'
import { KNOWLEDGE_CATEGORIES } from './registry'

const VALID_CATEGORIES = new Set(KNOWLEDGE_CATEGORIES.map((c) => c.slug))
const REL_ARRAY_KEYS = ['relatedProducts', 'relatedCountries', 'relatedIndustries', 'relatedArticles', 'relatedMaterials', 'relatedConstructions', 'internalLinks', 'taraTags']

/** Content directory (env-overridable for tests). */
function contentDir(): string {
  return process.env.KNOWLEDGE_DIR ? path.resolve(process.env.KNOWLEDGE_DIR) : path.join(process.cwd(), 'content', 'knowledge')
}

/**
 * Strict, shared shape validator. Returns a list of human-readable errors
 * (empty = valid). Used by the loader and the build/CI gate.
 */
export function validateArticle(data: unknown, file = ''): string[] {
  const errs: string[] = []
  const at = file ? `${file}: ` : ''
  const o = data as Record<string, unknown> | null
  if (!o || typeof o !== 'object' || Array.isArray(o)) return [`${at}not a JSON object`]

  if (typeof o.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(o.slug)) errs.push(`${at}invalid or missing "slug" (lowercase-hyphen)`)
  if (typeof o.title !== 'string' || !o.title.trim()) errs.push(`${at}missing "title"`)
  if (typeof o.summary !== 'string' || !o.summary.trim()) errs.push(`${at}missing "summary"`)
  const seo = o.seo as Record<string, unknown> | undefined
  if (!seo || typeof seo.title !== 'string' || typeof seo.description !== 'string') errs.push(`${at}missing "seo.title"/"seo.description"`)
  if (typeof o.category !== 'string' || !VALID_CATEGORIES.has(o.category as never)) errs.push(`${at}invalid "category" "${String(o.category)}" (must be one of the Knowledge Centre categories)`)
  if (o.status !== undefined && o.status !== 'draft' && o.status !== 'published') errs.push(`${at}invalid "status" (draft|published)`)

  if (o.body !== undefined && (!Array.isArray(o.body) || !o.body.every((s) => s && typeof s === 'object' && typeof (s as Record<string, unknown>).h2 === 'string' && typeof (s as Record<string, unknown>).body === 'string')))
    errs.push(`${at}invalid "body" (array of { h2, body })`)
  if (o.faq !== undefined && (!Array.isArray(o.faq) || !o.faq.every((f) => f && typeof f === 'object' && typeof (f as Record<string, unknown>).q === 'string' && typeof (f as Record<string, unknown>).a === 'string')))
    errs.push(`${at}invalid "faq" (array of { q, a })`)
  if (o.images !== undefined && (!Array.isArray(o.images) || !o.images.every((i) => i && typeof i === 'object' && typeof (i as Record<string, unknown>).src === 'string' && typeof (i as Record<string, unknown>).alt === 'string')))
    errs.push(`${at}invalid "images" (array of { src, alt })`)
  for (const k of REL_ARRAY_KEYS) if (o[k] !== undefined && !Array.isArray(o[k])) errs.push(`${at}"${k}" must be an array`)

  return errs
}

export interface KnowledgeValidationResult {
  articles: KnowledgeArticle[]
  errors: string[]
}

/**
 * Read + validate every content file. STRICT (does not skip): returns all
 * articles that loaded plus a full list of errors (malformed JSON, invalid
 * shape, duplicate slugs). The build gate fails when `errors` is non-empty.
 */
export function readAndValidateArticles(): KnowledgeValidationResult {
  const dir = contentDir()
  let files: string[] = []
  try { files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')) } catch { return { articles: [], errors: [] } }

  const articles: KnowledgeArticle[] = []
  const errors: string[] = []
  const slugCount = new Map<string, string[]>()

  for (const f of files.sort()) {
    let raw: unknown
    try { raw = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) } catch (e) { errors.push(`${f}: malformed JSON (${(e as Error).message})`); continue }
    const shapeErrors = validateArticle(raw, f)
    if (shapeErrors.length) { errors.push(...shapeErrors); continue }
    const a = raw as KnowledgeArticle
    slugCount.set(a.slug, [...(slugCount.get(a.slug) ?? []), f])
    articles.push(a)
  }

  Array.from(slugCount.entries()).forEach(([slug, inFiles]) => { if (inFiles.length > 1) errors.push(`duplicate slug "${slug}" in: ${inFiles.join(', ')}`) })

  return { articles, errors }
}

// ── Runtime loading (lenient: skips invalid; build gate already guarantees ok) ─
let cache: KnowledgeArticle[] | null = null
/** Test hook: clear the memoized cache (e.g. after changing KNOWLEDGE_DIR). */
export function _resetKnowledgeCache(): void { cache = null }

export function loadKnowledgeArticles(): KnowledgeArticle[] {
  if (cache) return cache
  const { articles } = readAndValidateArticles()
  // De-duplicate defensively (keep first occurrence).
  const seen = new Set<string>()
  cache = articles.filter((a) => (seen.has(a.slug) ? false : (seen.add(a.slug), true)))
  return cache
}

export function getPublishedArticles(): KnowledgeArticle[] {
  return loadKnowledgeArticles().filter((a) => a.status !== 'draft')
}
/** Any article by slug (incl. draft) — for internal/admin use. */
export function getKnowledgeArticle(slug: string): KnowledgeArticle | undefined {
  return loadKnowledgeArticles().find((a) => a.slug === slug)
}
/** PUBLIC lookup — returns undefined for drafts (used by public routes). */
export function getPublishedArticle(slug: string): KnowledgeArticle | undefined {
  const a = getKnowledgeArticle(slug)
  return a && a.status !== 'draft' ? a : undefined
}
export function getPublishedArticleSlugs(): string[] {
  return getPublishedArticles().map((a) => a.slug)
}
export function getArticlesByCategory(category: string): KnowledgeArticle[] {
  return getPublishedArticles().filter((a) => a.category === category)
}

const STOP = new Set('a an the and or of to for in on with we our you your is are be as at by from that this it can do does what how which where when about'.split(' '))
const tok = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w))
function scoreText(qt: string[], text: string, tags: string[]): number {
  const hay = `${text} ${tags.join(' ')}`.toLowerCase()
  let score = 0
  for (const t of qt) { if (tags.some((tag) => tag.toLowerCase().includes(t))) score += 3; else if (hay.includes(t)) score += 1 }
  return score
}

/** Rank published articles against a query (returns whole articles). */
export function searchKnowledgeArticles(query: string, limit = 3): KnowledgeArticle[] {
  const qt = tok(query)
  if (!qt.length) return []
  return getPublishedArticles()
    .map((a) => ({ a, score: scoreText(qt, `${a.title} ${a.summary} ${(a.body ?? []).map((s) => s.h2 + ' ' + s.body).join(' ')}`, a.taraTags ?? []) }))
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((x) => x.a)
}

/**
 * BOUNDED section/chunk retrieval for TARA. Ranks individual article SECTIONS
 * (body chunks) — not just title+summary — against the query and returns the
 * most relevant chunks joined, strictly capped by `maxChunks` and `maxChars`
 * so the AI context can never balloon.
 */
export function retrieveArticleContext(query: string, opts: { maxChars?: number; maxChunks?: number } = {}): string {
  const maxChars = Math.max(200, Math.min(opts.maxChars ?? 1200, 4000))
  const maxChunks = Math.max(1, Math.min(opts.maxChunks ?? 4, 12))
  const qt = tok(query)
  if (!qt.length) return ''

  const chunks: { title: string; tags: string[]; h2: string; text: string; score: number }[] = []
  for (const a of getPublishedArticles()) {
    const tags = a.taraTags ?? []
    for (const s of a.body ?? []) chunks.push({ title: a.title, tags, h2: s.h2, text: s.body, score: scoreText(qt, `${a.title} ${s.h2} ${s.body}`, tags) })
    // Always offer a summary chunk so short/body-less articles can still surface.
    chunks.push({ title: a.title, tags, h2: 'Overview', text: a.summary, score: scoreText(qt, `${a.title} ${a.summary}`, tags) })
  }

  const ranked = chunks.filter((c) => c.score > 0).sort((x, y) => y.score - x.score)
  const out: string[] = []
  let used = 0
  const seen = new Set<string>()
  for (const c of ranked) {
    if (out.length >= maxChunks) break
    const key = `${c.title}|${c.h2}`
    if (seen.has(key)) continue
    seen.add(key)
    let line = `${c.title} — ${c.h2}: ${c.text}`
    if (line.length > maxChars) line = line.slice(0, maxChars)
    if (used + line.length + 1 > maxChars) {
      const remain = maxChars - used
      if (remain > 80) out.push(line.slice(0, remain))
      break
    }
    out.push(line)
    used += line.length + 1
  }
  return out.join('\n')
}
