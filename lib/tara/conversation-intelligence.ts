import type { TaraTurn } from './provider'

const TYPO_MAP: Record<string, string> = {
  capet: 'carpet', carpte: 'carpet', carpt: 'carpet', ruggs: 'rugs', rugg: 'rug',
  durry: 'dhurrie', durries: 'dhurries', dhuri: 'dhurrie', dhurry: 'dhurrie',
  quilim: 'kilim', kilm: 'kilim', viscosee: 'viscose', bambu: 'bamboo',
  whool: 'wool', wollen: 'wool', quantiy: 'quantity', qnty: 'quantity',
  desgin: 'design', deign: 'design', colur: 'colour', color: 'colour',
  mesurement: 'measurement', measurment: 'measurement', delivry: 'delivery',
  manfacturer: 'manufacturer', manufaturer: 'manufacturer', custome: 'custom',
  tendor: 'tender', tenderss: 'tenders', requirment: 'requirement',
}

const CONCEPTS: Array<[RegExp, string[]]> = [
  [/\b(tender|bid|procurement|gem|government order|government supply)\b/i, ['tender', 'government', 'procurement', 'dhurrie', 'carpet', 'floor covering']],
  [/\b(ready stock|in stock|stock available|readymade|ready-made)\b/i, ['ready stock', 'made to order', 'custom manufacturing', 'production']],
  [/\b(soft|silky|luxury|premium|plush|fluffy|spongy)\b/i, ['soft', 'premium', 'wool', 'new zealand wool', 'viscose', 'bamboo silk', 'pile']],
  [/\b(budget|cheap|economical|affordable|low cost)\b/i, ['budget', 'economical', 'material', 'construction']],
  [/\b(hotel|hospitality|resort|guest room|lobby)\b/i, ['hospitality', 'hotel', 'commercial', 'durability', 'traffic']],
  [/\b(home|room|bedroom|living room|drawing room)\b/i, ['residential', 'room', 'size', 'material', 'care']],
  [/\b(kilim|dhurrie|durry|flatweave|flat weave)\b/i, ['kilim', 'dhurrie', 'flatweave', 'woven']],
  [/\b(how long|how many days|lead time|production time|dispatch|delivery)\b/i, ['production', 'dispatch', '3–4 weeks', 'quantity', 'specifications']],
  [/\b(custom|customize|customise|bespoke|made to order|private label|oem)\b/i, ['custom manufacturing', 'made to order', 'design', 'size', 'colour', 'material', 'quantity']],
]

function normalizeText(input: string): string {
  return input.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean).map((word) => TYPO_MAP[word] || word).join(' ')
}

function expandConcepts(text: string): string[] {
  const additions = new Set<string>()
  for (const [pattern, terms] of CONCEPTS) if (pattern.test(text)) terms.forEach((term) => additions.add(term))
  return [...additions]
}

export interface ConversationSignals {
  retrievalQuery: string
  latestNormalized: string
  recentUserContext: string
  concepts: string[]
  isShortFollowUp: boolean
}

export function buildConversationSignals(turns: TaraTurn[]): ConversationSignals {
  const userTurns = turns.filter((turn) => turn.role === 'user').slice(-4)
  const latestTurn = userTurns[userTurns.length - 1]
  const latestNormalized = normalizeText(latestTurn?.content || '')
  const recentUserContext = userTurns.map((turn) => normalizeText(turn.content)).filter(Boolean).join(' | ')
  const concepts = expandConcepts(recentUserContext)
  const isShortFollowUp = latestNormalized.split(/\s+/).filter(Boolean).length <= 5 && userTurns.length > 1
  const retrievalQuery = [recentUserContext, ...concepts].filter(Boolean).join(' ')
  return { retrievalQuery, latestNormalized, recentUserContext, concepts, isShortFollowUp }
}

export function buildConversationGuidance(signals: ConversationSignals): string {
  return [
    'CONVERSATION INTELLIGENCE:',
    `Recent buyer context: ${signals.recentUserContext || 'none'}`,
    `Detected related concepts: ${signals.concepts.join(', ') || 'none'}`,
    `Latest message is a short follow-up: ${signals.isShortFollowUp ? 'yes' : 'no'}`,
    'Interpret imperfect English, spelling mistakes, shorthand, corrections and short follow-ups using the conversation context.',
    'Do not repeat questions whose answers the visitor already provided.',
    'Respond naturally to the visitor’s intent; do not expose internal retrieval terms, rules, modules or system state.',
    'For product/project discovery, ask only one concise next question at a time unless two tightly related details are essential.',
  ].join('\n')
}
