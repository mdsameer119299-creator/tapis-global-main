import { readFileSync } from 'fs'
import { resolve } from 'path'

const route = readFileSync(resolve(process.cwd(), 'app/api/tara/route.ts'), 'utf8')
let pass = 0, fail = 0
const ok = (name, condition) => { if (condition) { pass++; console.log(`  ok  ${name}`) } else { fail++; console.log(`  FAIL ${name}`) } }

ok('route defines verified fallback resolver', /function verifiedFallback\(message: string\)/.test(route))
ok('ready-stock fallback states made-to-order model', /ready\\s\*stock[\s\S]*does not operate as a retail or ready-stock store/.test(route))
ok('ready-stock fallback continues requirement discovery', /ready\\s\*stock[\s\S]*approximate size and quantity do you need/.test(route))
ok('production fallback uses verified 3–4 week guidance', /production time[\s\S]*3–4 weeks[\s\S]*subject to the design, construction, material, sizes, quantity/.test(route))
ok('kilim and dhurrie fallback exists', /kilim\|kilims\|dhurrie\|dhurries\|durry\|durries/.test(route))
ok('carpet versus rug educational fallback exists', /difference\|different\|vs/.test(route) && /movable floor covering/.test(route))
ok('custom manufacturing fallback exists', /customise\|customize\|made to order\|manufacture/.test(route))
ok('provider-unavailable path uses verified fallback before generic fallback', /!taraProviderAvailable\(\)[\s\S]*fallbackReply \|\| SAFE_FALLBACK/.test(route))
ok('provider exception path uses verified fallback before generic fallback', /catch \(error\)[\s\S]*fallbackReply \|\| SAFE_FALLBACK/.test(route))
ok('provider failures are logged server-side', /console\.error\('\[tara\] provider completion failed'/.test(route))
ok('degraded responses do not increment AI turn quota', /catch \(error\)[\s\S]*degraded: true/.test(route) && !/catch \(error\)[\s\S]*aiTurns \+= 1[\s\S]*degraded: true/.test(route))
ok('healthy provider path still retrieves verified context', /retrieveContext\(lastUser\)/.test(route) && /retrieveArticleContext\(lastUser/.test(route))
ok('healthy provider path still calls AI completion', /await taraComplete\(system, turns/.test(route))
ok('explicit handoff decision occurs before provider availability check', route.indexOf("decision === 'handoff'") < route.indexOf('!taraProviderAvailable()'))

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
