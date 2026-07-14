import { readFileSync } from 'fs'
import { resolve } from 'path'

const root = process.cwd()
const prompt = readFileSync(resolve(root, 'lib/tara/knowledge/prompt.ts'), 'utf8')
const safety = readFileSync(resolve(root, 'lib/tara/knowledge/commercial-safety.ts'), 'utf8')
let pass = 0, fail = 0
const ok = (name, condition) => { if (condition) { pass++; console.log(`  ok  ${name}`) } else { fail++; console.log(`  FAIL ${name}`) } }

ok('prompt requires natural multi-turn conversation', /natural multi-turn conversation/i.test(prompt))
ok('prompt requires remembering provided details', /remember details the user already provided/i.test(prompt))
ok('prompt prevents repeated qualification questions', /Never ask for the same information twice/i.test(prompt))
ok('prompt answers direct question before follow-up', /Answer the user's direct question first/i.test(prompt))
ok('prompt limits follow-up questions', /at most one focused follow-up question/i.test(prompt))
ok('prompt prevents option dumping', /Do not dump long lists/i.test(prompt) && /2–3 relevant choices/i.test(prompt))
ok('ready-stock behavior is made-to-order and conversational', /ready-stock questions[\s\S]*manufactures to order[\s\S]*Continue helping/i.test(prompt))
ok('production timing uses verified 3–4 week guidance', /production-time questions[\s\S]*3–4 weeks[\s\S]*subject to specifications and quantity/i.test(prompt))
ok('educational carpet and rug questions are explicitly supported', /difference between carpets and rugs/i.test(prompt))
ok('kilims and dhurries are explicitly supported', /kilims, dhurries/i.test(prompt))
ok('commercial questions continue conversation', /Commercial questions[\s\S]*must not abruptly end the conversation/i.test(prompt))
ok('project summary is required before useful handoff', /summarize the known requirement concisely/i.test(prompt))
ok('commercial safety forbids invented prices and MOQ', /Never invent or state: prices, MOQ/i.test(safety))
ok('commercial safety tells TARA to continue clarifying requirements', /continue helping the visitor clarify the requirement/i.test(safety))
ok('price does not trigger deterministic handoff', !/return \/[^/]*price/.test(safety))
ok('quotation does not trigger deterministic handoff', !/return \/[^/]*(quotation|quote)/.test(safety))
ok('MOQ does not trigger deterministic handoff', !/return \/[^/]*moq/.test(safety))
ok('delivery questions do not trigger deterministic handoff', !/return \/[^/]*deliver/.test(safety))
ok('sample and catalogue questions do not trigger deterministic handoff', !/return \/[^/]*(sample|catalog)/.test(safety))
ok('explicit human contact still triggers handoff', /human\|agent\|sales/.test(safety) && /contact me/.test(safety) && /call me/.test(safety))

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
