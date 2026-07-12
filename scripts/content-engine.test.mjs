// scripts/content-engine.test.mjs
// Tests the Knowledge Centre content engine: external file loading, validation,
// automatic internal linking, TARA retrieval from content, and auto structured
// data generation. No test framework.

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
import { mkdtempSync, writeFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'

const require = createRequire(import.meta.url)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })

let pass = 0, fail = 0
const ok = (n, c, d = '') => { if (c) { pass++; console.log(`  ok  ${n}`) } else { fail++; console.log(`  FAIL ${n} ${d}`) } }

// ── Content loading from external files ──────────────────────────────────────
const content = jiti('../lib/knowledge/content.ts')
{
  const arts = content.getPublishedArticles()
  ok('loads articles from content/ files', arts.length >= 2, `(got ${arts.length})`)
  ok('every article has required fields', arts.every((a) => a.slug && a.title && a.summary && a.seo?.title && a.seo?.description && a.category))
  ok('slugs are URL-safe', arts.every((a) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a.slug)))
  ok('getKnowledgeArticle resolves', Boolean(content.getKnowledgeArticle('new-zealand-wool-for-custom-rugs')))
  ok('unknown slug returns undefined', content.getKnowledgeArticle('does-not-exist') === undefined)
  ok('published slugs helper works', content.getPublishedArticleSlugs().includes('how-to-source-custom-rugs-from-india'))
}

// ── TARA retrieval from content files ────────────────────────────────────────
{
  const hits = content.searchKnowledgeArticles('new zealand wool for a hotel', 3)
  ok('TARA retrieves relevant article from content', hits.length > 0 && hits[0].slug === 'new-zealand-wool-for-custom-rugs')
  const src = content.searchKnowledgeArticles('how to source custom rugs from india', 3)
  ok('TARA retrieves buying guide from content', src.some((a) => a.slug === 'how-to-source-custom-rugs-from-india'))
  ok('irrelevant query returns nothing', content.searchKnowledgeArticles('unrelated quantum topic xyz', 3).length === 0)
}

// ── Automatic internal linking ───────────────────────────────────────────────
{
  const { resolveArticleLinks } = jiti('../lib/knowledge/links.ts')
  const a = content.getKnowledgeArticle('new-zealand-wool-for-custom-rugs')
  const links = resolveArticleLinks(a)
  ok('resolves related products to real URLs', links.products.length > 0 && links.products.every((l) => l.href.startsWith('/products/')))
  ok('resolves related countries to real URLs', links.countries.some((l) => l.href === '/countries/usa'))
  ok('resolves related industries to real URLs', links.industries.some((l) => l.href === '/industries/hotel-carpets'))
  ok('resolves sibling articles', links.articles.some((l) => l.href === '/knowledge/how-to-source-custom-rugs-from-india'))
  ok('resolves material chips', links.materials.includes('New Zealand Wool'))
  // A bogus ref must be dropped (no dead links).
  const bogus = resolveArticleLinks({ ...a, relatedProducts: ['not-a-real-product'], relatedCountries: ['zzz'] })
  ok('bogus related refs are dropped', bogus.products.length === 0 && bogus.countries.length === 0)
}

// ── Automatic structured data generation ─────────────────────────────────────
{
  const sd = jiti('../lib/structured-data.ts')
  const seo = jiti('../lib/seo.ts')
  const a = content.getKnowledgeArticle('new-zealand-wool-for-custom-rugs')
  const url = `${seo.SEO_BASE_URL}/knowledge/${a.slug}`
  const graph = sd.buildJsonLd(
    sd.webPageSchema({ title: a.seo.title, description: a.seo.description, url, imageUrl: seo.OG_IMAGE.url }),
    sd.breadcrumbSchema([{ name: 'Home', url: seo.SEO_BASE_URL }, { name: 'Knowledge Centre', url: `${seo.SEO_BASE_URL}/knowledge` }, { name: a.title, url }]),
    sd.articleSchema({ title: a.title, description: a.summary, url, imageUrl: seo.OG_IMAGE.url }),
    a.faq && a.faq.length ? sd.faqSchema(a.faq.map((f) => ({ q: f.q, a: f.a }))) : null,
  )['@graph']
  const types = graph.map((n) => n['@type'])
  ok('auto JSON-LD includes Article', types.includes('Article'))
  ok('auto JSON-LD includes FAQPage', types.includes('FAQPage'))
  const bc = graph.find((n) => n['@type'] === 'BreadcrumbList')
  const wp = graph.find((n) => n['@type'] === 'WebPage')
  ok('auto breadcrumb has 3 valid items', bc && bc.itemListElement.length === 3)
  ok('WebPage breadcrumb @id resolves (intrinsic safety preserved)', wp && wp.breadcrumb && bc && wp.breadcrumb['@id'] === bc['@id'])
}

// ── Bounded section/chunk retrieval (TARA gets BODY, capped in size) ─────────
{
  const full = content.retrieveArticleContext('new zealand wool for a hotel project')
  ok('retrieval returns article BODY content (not just title+summary)', /natural protein fibre|colour take-up|manufactured to order/i.test(full))
  const capped = content.retrieveArticleContext('new zealand wool custom rug sampling production', { maxChars: 300 })
  ok('retrieval respects maxChars bound', capped.length <= 300, `(len ${capped.length})`)
  const chunked = content.retrieveArticleContext('wool viscose sampling production timeline dispatch', { maxChars: 4000, maxChunks: 2 })
  ok('retrieval respects maxChunks bound', chunked.split('\n').filter(Boolean).length <= 2)
  ok('empty query returns empty context', content.retrieveArticleContext('') === '')
  ok('irrelevant query returns empty context', content.retrieveArticleContext('quantum astrophysics xyz') === '')
}

// ── Strict validation of malformed / duplicate / invalid content ─────────────
{
  const dir = mkdtempSync(join(tmpdir(), 'kb-'))
  const write = (name, obj) => writeFileSync(join(dir, name), typeof obj === 'string' ? obj : JSON.stringify(obj))
  const good = { slug: 'good-one', category: 'materials', status: 'published', title: 'Good', summary: 'A valid article.', seo: { title: 't', description: 'd' }, body: [{ h2: 'H', body: 'B' }] }
  write('good.json', good)
  write('draft.json', { ...good, slug: 'draft-one', status: 'draft' })
  write('malformed.json', '{ not valid json ,,,')
  write('dup-a.json', { ...good, slug: 'dup-slug' })
  write('dup-b.json', { ...good, slug: 'dup-slug', title: 'Dup B' })
  write('bad-category.json', { ...good, slug: 'bad-cat', category: 'not-a-real-category' })
  write('bad-structure.json', { ...good, slug: 'bad-struct', body: 'should-be-array', faq: [{ q: 'q' }] })
  write('missing-fields.json', { slug: 'missing', category: 'materials' })

  process.env.KNOWLEDGE_DIR = dir
  content._resetKnowledgeCache()
  const { articles, errors } = content.readAndValidateArticles()
  const joined = errors.join(' | ')
  ok('reports malformed JSON', /malformed JSON/i.test(joined))
  ok('reports duplicate slug', /duplicate slug "dup-slug"/i.test(joined))
  ok('reports invalid category', /invalid "category"/i.test(joined))
  ok('reports invalid body/faq structure', /invalid "body"/i.test(joined) && /invalid "faq"/i.test(joined))
  ok('reports missing required fields', /missing "summary"|missing "seo/i.test(joined))
  ok('strict validation collects >=5 errors', errors.length >= 5, `(got ${errors.length})`)

  // Loader is lenient (skips invalid) but honours drafts.
  content._resetKnowledgeCache()
  ok('draft excluded from published list', !content.getPublishedArticleSlugs().includes('draft-one'))
  ok('published-only lookup returns undefined for draft', content.getPublishedArticle('draft-one') === undefined)
  ok('internal lookup can still see draft', Boolean(content.getKnowledgeArticle('draft-one')))
  ok('invalid-shape files are skipped at runtime', content.getKnowledgeArticle('bad-struct') === undefined && content.getKnowledgeArticle('bad-cat') === undefined)

  delete process.env.KNOWLEDGE_DIR
  content._resetKnowledgeCache()
  rmSync(dir, { recursive: true, force: true })
}

// ── Registry categories (scalable) ───────────────────────────────────────────
{
  const reg = jiti('../lib/knowledge/registry.ts')
  ok('13 scalable knowledge categories', reg.KNOWLEDGE_CATEGORIES.length === 13)
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
