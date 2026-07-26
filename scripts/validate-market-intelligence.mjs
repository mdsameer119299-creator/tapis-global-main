// scripts/validate-market-intelligence.mjs
// STRICT build/CI gate for Market Intelligence content.
// Runs as part of `prebuild` (before `next build`) and via
// `npm run market-intelligence:validate`.
// FAILS (exit 1) on: malformed JSON, missing/invalid required fields, an
// unrecognised countrySlug/styleArchetypeSlug, or a duplicate countrySlug.
// Unlike the Knowledge Centre gate, ZERO published entries is valid here —
// this content lands country by country as real research is verified
// (see docs/MARKET-INTELLIGENCE-ENGINE.md). Set MARKET_INTELLIGENCE_DIR to
// validate a different content directory (used by tests).

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const require = createRequire(import.meta.url)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })

const { readAndValidateMarketIntelligence } = jiti('../lib/market-intelligence/content.ts')

const { entries, errors } = readAndValidateMarketIntelligence()
const published = entries.filter((e) => e.status !== 'draft').length
console.log(`\nMarket Intelligence content: ${entries.length} valid entr${entries.length === 1 ? 'y' : 'ies'} (${published} published)${process.env.MARKET_INTELLIGENCE_DIR ? ` in ${process.env.MARKET_INTELLIGENCE_DIR}` : ''}.`)

if (errors.length) {
  console.log(`\n❌ ${errors.length} content error(s):`)
  for (const e of errors) console.log(`   - ${e}`)
  console.log('\nFix the content files above before building.\n')
  process.exit(1)
}
console.log('✅ All Market Intelligence content is valid.\n')
