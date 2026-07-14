import { readFileSync } from 'fs'
import { resolve } from 'path'

const root = process.cwd()
const intelligence = readFileSync(resolve(root, 'lib/tara/conversation-intelligence.ts'), 'utf8')
const route = readFileSync(resolve(root, 'app/api/tara/route.ts'), 'utf8')
let pass = 0, fail = 0
const ok = (name, condition) => { if (condition) { pass++; console.log(`  ok  ${name}`) } else { fail++; console.log(`  FAIL ${name}`) } }

ok('conversation intelligence module exists', /export function buildConversationSignals/.test(intelligence))
ok('recent user turns are used for context', /filter\(\(turn\) => turn\.role === 'user'\)\.slice\(-4\)/.test(intelligence))
ok('common carpet typos are normalized', /capet: 'carpet'/.test(intelligence) && /quantiy: 'quantity'/.test(intelligence) && /tendor: 'tender'/.test(intelligence))
ok('tender intent expands to procurement concepts', /tender\|bid\|procurement/.test(intelligence) && /government.*procurement.*dhurrie.*carpet/s.test(intelligence))
ok('ready-stock intent expands to made-to-order context', /ready stock\|in stock/.test(intelligence) && /made to order.*custom manufacturing.*production/s.test(intelligence))
ok('premium and soft language expands material concepts', /soft\|silky\|luxury\|premium/.test(intelligence) && /new zealand wool/.test(intelligence) && /bamboo silk/.test(intelligence))
ok('hospitality buyer context is recognized', /hotel\|hospitality\|resort/.test(intelligence) && /commercial.*durability.*traffic/s.test(intelligence))
ok('short follow-ups are detected', /isShortFollowUp/.test(intelligence) && /length <= 5/.test(intelligence))
ok('retrieval query combines conversation context and concepts', /retrievalQuery = \[recentUserContext, \.\.\.concepts\]/.test(intelligence))
ok('guidance handles imperfect language and follow-ups', /Interpret imperfect English, spelling mistakes, shorthand, corrections and short follow-ups/.test(intelligence))
ok('guidance prevents repeated questions', /Do not repeat questions whose answers the visitor already provided/.test(intelligence))
ok('guidance limits next questions', /ask only one concise next question at a time/.test(intelligence))
ok('route builds conversation signals from sanitized turns', /buildConversationSignals\(turns\)/.test(route))
ok('route uses conversation-aware query for module retrieval', /retrieveContext\(signals\.retrievalQuery\)/.test(route))
ok('route uses conversation-aware query for article retrieval', /retrieveArticleContext\(signals\.retrievalQuery/.test(route))
ok('route injects conversation guidance into AI system prompt', /buildConversationGuidance\(signals\)/.test(route) && /TARA_SYSTEM_PROMPT.*guidance/s.test(route))
ok('degraded mode uses verified retrieval fallback', /function verifiedRetrievalFallback/.test(route) && /verifiedRetrievalFallback\(signals\.retrievalQuery\)/.test(route))
ok('generic outage reply remains last resort', /fallbackReply \|\| SAFE_FALLBACK/.test(route))
ok('healthy provider remains primary conversational path', /await taraComplete\(system, turns/.test(route))
ok('AI turn quota increments only after healthy completion', /await taraComplete[\s\S]*aiTurns \+= 1/.test(route))

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
