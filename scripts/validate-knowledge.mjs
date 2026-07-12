// scripts/validate-knowledge.mjs
// STRICT build/CI gate for external Knowledge Centre content.
// Runs as `prebuild` (before `next build`) and via `npm run knowledge:validate`.
// FAILS (exit 1) on: malformed JSON, missing/invalid required fields, invalid
// category, invalid body/faq/images/related structures, or duplicate slugs.
// Set KNOWLEDGE_DIR to validate a different content directory (used by tests).

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const require = createRequire(import.meta.url)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })

const { readAndValidateArticles } = jiti('../lib/knowledge/content.ts')

const { articles, errors } = readAndValidateArticles()
const published = articles.filter((a) => a.status !== 'draft').length
console.log(`\nKnowledge content: ${articles.length} valid article(s) (${published} published)${process.env.KNOWLEDGE_DIR ? ` in ${process.env.KNOWLEDGE_DIR}` : ''}.`)

const allErrors = [...errors]
// The build requires at least one PUBLISHED article — a missing directory or a
// drafts-only Knowledge Centre must fail the gate, not pass green with nothing.
// (Skip if a directory error already explains the emptiness.)
if (published === 0 && !errors.some((e) => /directory not found/i.test(e))) {
  allErrors.push('no published knowledge articles found — the build requires at least one published article')
}

if (allErrors.length) {
  console.log(`\n❌ ${allErrors.length} content error(s):`)
  for (const e of allErrors) console.log(`   - ${e}`)
  console.log('\nFix the content files above before building.\n')
  process.exit(1)
}
console.log('✅ All knowledge content is valid.\n')
