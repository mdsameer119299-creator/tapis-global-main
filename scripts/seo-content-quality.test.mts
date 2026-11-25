// scripts/seo-content-quality.test.mts — run: npm run test:seo-quality
// Content-quality and claim-hygiene gate for product pages (Phase 2).
// Source-level, no network. HARD checks fail the run; DEBT items are known
// items are reported with counts. Existing owner-approved business claims are preserved.
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { PRODUCT_CATEGORIES } from '@/lib/products'

let failed = 0
const fail = (m: string) => { failed++; console.log('  FAIL ' + m) }
const ok = (m: string) => console.log('  ok   ' + m)
const warn = (m: string) => console.log('  DEBT ' + m)

const ROOT = process.cwd()
const SEO_FIELDS = ['seoTitle', 'seoDescription', 'h1', 'tagline'] as const

const HANDMADE = /\bhand-?made\b|\bhandcrafted\b|\bhand-crafted\b/i

console.log('Product content')
// Handmade wording is reserved for hand-tufted and hand-knotted carpets.
const NOT_HANDMADE = ['wall-to-wall-carpets', 'carpet-tiles']
for (const c of PRODUCT_CATEGORIES) {
  if (!NOT_HANDMADE.includes(c.slug)) continue
  for (const f of SEO_FIELDS) {
    const v = String((c as any)[f] ?? '')
    if (HANDMADE.test(v)) fail(`${c.slug}.${f} uses handmade wording: "${v}"`)
  }
}
ok('carpet tiles / wall-to-wall: no handmade wording in SEO fields')

// Expansion: every product carries extra keywords and buyer FAQs.
for (const c of PRODUCT_CATEGORIES) {
  if (c.seoKeywords.length < 8) fail(`${c.slug} has only ${c.seoKeywords.length} keywords`)
  if (c.faqs.length < 6) fail(`${c.slug} has only ${c.faqs.length} FAQs`)
}
ok('every product has >= 8 keywords and >= 6 FAQs')

// 4. length limits
for (const c of PRODUCT_CATEGORIES) {
  if (c.seoTitle.length > 65) fail(`${c.slug} title ${c.seoTitle.length} chars`)
  if (c.seoDescription.length > 165) fail(`${c.slug} description ${c.seoDescription.length} chars`)
}
ok('titles <= 65 and descriptions <= 165 characters')

// 7. product pages stay distinct (5-word shingles over the full page text)
const text = (c: any) => JSON.stringify([c.intro, c.body, c.overview, c.bullets, c.applications, c.process, c.faqs, c.deepDive, c.materialDetails, c.useCases, c.exportInfo])
const shingles = (t: string) => {
  const w = t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 2500)
  const s = new Set<string>(); for (let i = 0; i + 5 <= w.length; i++) s.add(w.slice(i, i + 5).join(' ')); return s
}
const S_ = PRODUCT_CATEGORIES.map((c) => ({ slug: c.slug, s: shingles(text(c)) }))
let worst = { a: '', b: '', j: 0 }
for (let i = 0; i < S_.length; i++) for (let k = i + 1; k < S_.length; k++) {
  let inter = 0; S_[i].s.forEach((x) => { if (S_[k].s.has(x)) inter++ })
  const j = inter / (S_[i].s.size + S_[k].s.size - inter)
  if (j > worst.j) worst = { a: S_[i].slug, b: S_[k].slug, j }
}
worst.j > 0.35 ? fail(`product pages too similar: ${worst.a} vs ${worst.b} = ${(worst.j * 100).toFixed(0)}%`) : ok(`most similar pair ${worst.a} / ${worst.b} = ${(worst.j * 100).toFixed(0)}% (limit 35%)`)

// 8. heritage wording must not tie "since 1965" to the company in metadata
console.log('Heritage and alt-text debt (known, reported)')
const walk = (d: string, out: string[] = []) => {
  for (const f of readdirSync(d)) {
    if (['node_modules', '.next', '.git', 'public', 'docs'].includes(f)) continue
    const p = join(d, f); const st = statSync(p)
    if (st.isDirectory()) walk(p, out); else if (/\.(ts|tsx)$/.test(f)) out.push(p)
  }
  return out
}
const files = [...walk(join(ROOT, 'lib')), ...walk(join(ROOT, 'app')), ...walk(join(ROOT, 'components'))]
let since = 0, incorp = 0, altQc = 0
const altRe = /alt[:=]\s*[`'"{][^`'"\n]*(QC|quality inspection|inspection|artisan weaving|production)[^`'"\n]*/gi
for (const f of files) {
  if (/seo-content-quality/.test(f)) continue
  // ignore comment lines so documentation of the rule cannot trip the rule
  const t = readFileSync(f, 'utf8').split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n')
  since += (t.match(/since 1965|legacy since 1965/gi) || []).length
  incorp += (t.match(/incorporated in 1965|founded in 1965|established in 1965|est\. 1965/gi) || []).length
  altQc += (t.match(altRe) || []).length
}
incorp ? fail(`${incorp} place(s) imply the company was incorporated/founded in 1965`) : ok('no wording implies the Pvt Ltd was incorporated in 1965')
since ? warn(`${since} visible "since 1965" occurrences kept as production wording by owner decision (25 Nov); JSON-LD uses "roots dating back to 1965"`) : ok(`no "since 1965" wording`)
altQc ? warn(`${altQc} alt attributes mention QC/inspection/production/artisan weaving; each needs a photo check`) : ok('no process-describing alt text')

console.log(failed ? `\n${failed} check(s) FAILED` : '\nAll hard checks passed')
process.exit(failed ? 1 : 0)
