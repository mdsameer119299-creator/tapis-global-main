import { readFileSync } from 'fs'
import { resolve } from 'path'

const root = process.cwd()
const client = readFileSync(resolve(root, 'components/tara/Tara.tsx'), 'utf8')
const route = readFileSync(resolve(root, 'app/api/tara/route.ts'), 'utf8')
let pass = 0, fail = 0
const ok = (name, condition) => { if (condition) { pass++; console.log(`  ok  ${name}`) } else { fail++; console.log(`  FAIL ${name}`) } }

ok('client does not force handoff from needsHandoff', !client.includes("if (needsHandoff(q))"))
ok('client does not auto-open form from handoffSuggested', !/handoffSuggested\)\s*setTimeout/.test(client))
ok('lead form has explicit Back to chat', client.includes('Back to chat'))
ok('successful lead flow has Continue chatting', client.includes('Continue chatting'))
ok('catalogue and human lead modes are distinct', client.includes("type LeadMode = 'catalogue' | 'human' | null"))
ok('company info does not open a lead form', /function showCompanyInfo\(\)[\s\S]*?setLeadMode\(null\)/.test(client))
ok('company info is idempotent', client.includes('companyInfoShown.current'))
ok('only latest discovery cards stay active', client.includes("x.cards ? { ...x, cards: null } : x"))
ok('restart invalidates in-flight requests', /function restart\(\)[\s\S]*?requestId\.current \+= 1/.test(client))
ok('send is locked while busy', client.includes('if (!q || busy) return'))
ok('stale async replies are ignored', client.includes('currentRequest !== requestId.current'))
ok('API handoff message explicitly allows continued chat', HANDOFF_OK(route))
ok('API fallback does not force lead capture', /SAFE_FALLBACK = '[^']*continue/.test(route))

function HANDOFF_OK(source) {
  const match = source.match(/const HANDOFF_MSG = '([^']+)'/)
  return Boolean(match && /keep helping|continue chatting/i.test(match[1]))
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
