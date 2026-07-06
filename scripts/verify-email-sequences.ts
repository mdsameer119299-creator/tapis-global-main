/**
 * Assertions for buyer-type email personalisation.
 * Run: npx tsx scripts/verify-email-sequences.ts
 */
import { selectBuyerEmailTemplate, absoluteResourceUrl } from '../lib/email-sequences'

let failed = 0
const ok = (c: boolean, m: string) => { if (c) console.log(`  PASS  ${m}`); else { failed++; console.error(`  FAIL  ${m}`) } }

ok(selectBuyerEmailTemplate('Importer / Wholesaler').key === 'importer', 'Importer → importer template')
ok(selectBuyerEmailTemplate('Hotel / Hospitality Procurement').key === 'hospitality', 'Hotel → hospitality template')
ok(selectBuyerEmailTemplate('Interior Designer / Architect').key === 'designer', 'Designer/Architect → designer template')
ok(selectBuyerEmailTemplate('Private Label Brand').key === 'private-label', 'Private Label → OEM template')
ok(selectBuyerEmailTemplate('Large Buyer / Distributor').key === 'large-buyer', 'Large Buyer → capabilities template')
ok(selectBuyerEmailTemplate('').key === 'general', 'empty buyer type → general template')
ok(selectBuyerEmailTemplate(undefined).key === 'general', 'undefined buyer type → general template')

const t = selectBuyerEmailTemplate('Importer / Wholesaler')
ok(t.resources.length > 0, 'template has resource links')
ok(t.resources.every((r) => absoluteResourceUrl(r.path).startsWith('https://www.tapisglobalinternational.com/')), 'resources resolve to real absolute site URLs')

console.log(failed === 0 ? '\nALL EMAIL-SEQUENCE ASSERTIONS PASSED' : `\n${failed} ASSERTION(S) FAILED`)
process.exit(failed === 0 ? 0 : 1)
