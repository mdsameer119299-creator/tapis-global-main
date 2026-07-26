import { NextResponse } from 'next/server'
import { taraProviderAvailable, taraComplete } from '@/lib/tara/provider'
import { TARA_SYSTEM_PROMPT, retrieveContext, needsHandoff, TARA_GREETING } from '@/lib/tara/knowledge'
import { buildConversationSignals, buildConversationGuidance } from '@/lib/tara/conversation-intelligence'
import { buildRecommendation } from '@/lib/tara/recommend'
import { buildComparison } from '@/lib/tara/compare'
import { retrieveArticleContext } from '@/lib/knowledge/content'
import { getClientIp } from '@/lib/enquiry-rate-limit'
import {
  TARA_LIMITS, sanitizeTurns, decide, burst, parseCookies,
  isValidSid, newSessionId, signCounter, verifyCounter,
} from '@/lib/tara/guard'

export const runtime = 'nodejs'

const HANDOFF_MSG = 'I can keep helping you here. For project-specific prices, MOQ, payment terms, samples, quotations or confirmed capabilities, the TAPIS GLOBAL team must confirm the details. If you want, use Talk to the team to share your requirement; otherwise, continue chatting with me.'
const QUOTA_MSG = 'We have covered a lot here. You can continue browsing categories and materials, or use Talk to the team if you want the TAPIS GLOBAL team to review your project details.'
// Exact wording is intentional: never invent an answer when nothing verified
// matched — say so plainly and offer the human handoff, then keep the door
// open to continued chat (retains "ask your question again" for that reason).
const SAFE_FALLBACK = 'I could not verify that information from our knowledge base. Let me connect you with our team. In the meantime, please ask your question again or use Talk to the team for project-specific confirmation.'
// Single source of truth for TARA's greeting (see lib/tara/knowledge/personality.ts) — reused as-is here.
const GREETING_REPLY = TARA_GREETING

function isGreeting(message: string): boolean {
  const normalized = message.trim().toLowerCase().replace(/[.!?]+$/g, '').trim()
  return /^(hi|hii+|hey|hello|hello there|good morning|good afternoon|good evening|namaste|salaam|salam|assalamu alaikum|howdy)$/.test(normalized)
}

function verifiedFallback(message: string): string | null {
  const text = message.trim().toLowerCase()

  if (/\b(ready\s*stock|in stock|available stock|stock available|ready-made|readymade)\b/.test(text)) {
    return 'TAPIS GLOBAL INTERNATIONAL PVT LTD primarily manufactures carpets and rugs to order and does not operate as a retail or ready-stock store. We can manufacture according to your required design, size, colours, material, construction and quantity. What type of carpet or rug, approximate size and quantity do you need?'
  }

  if (/\b(how (?:many|much) (?:days|weeks)|how long|lead time|production time|dispatch time|delivery time|when (?:will|can).*(?:ready|dispatch))\b/.test(text)) {
    return 'Typical production and dispatch is approximately 3–4 weeks, subject to the design, construction, material, sizes, quantity and other order specifications. If you share the product type, approximate sizes and quantity, I can help you clarify the requirement before the TAPIS GLOBAL team confirms the project-specific timeline.'
  }

  if (/\b(kilim|kilims|dhurrie|dhurries|durry|durries)\b/.test(text)) {
    return 'Yes, TAPIS GLOBAL INTERNATIONAL PVT LTD supports made-to-order carpet and rug categories including flatwoven products such as kilims and dhurries, subject to the required design, size, colours, material and quantity. Are you sourcing them for a home, retail/wholesale business, hospitality project or another application?'
  }

  if (/\b(difference|different|vs\.?|versus)\b/.test(text) && /\bcarpet(s)?\b/.test(text) && /\brug(s)?\b/.test(text)) {
    return 'The terms carpet and rug are sometimes used interchangeably, but generally a rug is a movable floor covering that covers part of a room, while carpet can also refer to larger floor coverings or wall-to-wall installations. Terminology varies by market and buyer. Are you choosing a floor covering for a particular room or project?'
  }

  if (/\b(custom|customise|customize|made to order|manufacture|manufacturer)\b/.test(text)) {
    return 'Yes. TAPIS GLOBAL INTERNATIONAL PVT LTD is a B2B made-to-order carpet and rug manufacturer. Products can be developed to buyer specifications including design, size, colours, material, fibre quality, construction and quantity. What type of carpet or rug are you looking to manufacture?'
  }

  return null
}

function verifiedRetrievalFallback(query: string): string | null {
  const context = retrieveContext(query).split('\n').map((line) => line.trim()).filter(Boolean)
  if (context.length === 0) return null
  const concise = context.slice(0, 2).join(' ')
  return `${concise.slice(0, 700)}${concise.length > 700 ? '…' : ''} If you tell me a little more about what you are looking for, I can narrow this down further.`
}

function withSession(res: NextResponse, sid: string, aiTurns: number): NextResponse {
  const common = { httpOnly: true, sameSite: 'lax' as const, secure: true, path: '/api/tara', maxAge: 60 * 60 * 6 }
  res.cookies.set('tara_sid', sid, common)
  res.cookies.set('tara_ai', signCounter(sid, aiTurns), common)
  return res
}

export async function POST(req: Request) {
  const declared = Number(req.headers.get('content-length') || 0)
  if (declared && declared > TARA_LIMITS.maxBodyBytes) {
    return NextResponse.json({ available: true, reply: 'Your message is too large. Please shorten it.' }, { status: 413 })
  }

  const cookies = parseCookies(req.headers.get('cookie'))
  const sid = isValidSid(cookies['tara_sid']) ? cookies['tara_sid'] : newSessionId()
  let aiTurns = verifyCounter(sid, cookies['tara_ai'])

  const ip = getClientIp(req)
  if (burst(`ip:${ip}`) || burst(`sid:${sid}`)) {
    return withSession(NextResponse.json({ available: true, reply: 'You are sending messages quickly — please wait a moment and try again.' }, { status: 429 }), sid, aiTurns)
  }

  let raw: string
  try { raw = await req.text() } catch {
    return withSession(NextResponse.json({ available: true, reply: 'Sorry, I could not read that. Please try again.' }, { status: 400 }), sid, aiTurns)
  }
  if (Buffer.byteLength(raw) > TARA_LIMITS.maxBodyBytes) {
    return withSession(NextResponse.json({ available: true, reply: 'Your message is too large. Please shorten it.' }, { status: 413 }), sid, aiTurns)
  }
  let body: { messages?: unknown }
  try { body = JSON.parse(raw) } catch {
    return withSession(NextResponse.json({ available: true, reply: 'Sorry, I could not read that. Please try again.' }, { status: 400 }), sid, aiTurns)
  }
  const turns = sanitizeTurns(body.messages)
  if (turns.length === 0) {
    return withSession(NextResponse.json({ available: true, reply: 'Please type your question about carpets or rugs.' }, { status: 400 }), sid, aiTurns)
  }

  const lastUser = [...turns].reverse().find((t) => t.role === 'user')?.content ?? ''
  if (isGreeting(lastUser)) {
    return withSession(NextResponse.json({ available: true, reply: GREETING_REPLY, handoffSuggested: false }), sid, aiTurns)
  }

  const decision = decide(needsHandoff(lastUser), aiTurns)
  if (decision === 'handoff') {
    return withSession(NextResponse.json({ available: true, reply: HANDOFF_MSG, handoffSuggested: true }), sid, aiTurns)
  }
  if (decision === 'quota') {
    return withSession(NextResponse.json({ available: true, reply: QUOTA_MSG, handoffSuggested: true }), sid, aiTurns)
  }

  const signals = buildConversationSignals(turns)
  // A product comparison, when detected, is answered directly (works even with
  // no AI key). Otherwise fall back to verified answers / retrieval.
  const comparison = buildComparison(signals)
  const fallbackReply = comparison || verifiedFallback(signals.latestNormalized) || verifiedRetrievalFallback(signals.retrievalQuery)
  if (!taraProviderAvailable()) {
    return withSession(NextResponse.json({ available: true, reply: fallbackReply || SAFE_FALLBACK, handoffSuggested: false, degraded: true }), sid, aiTurns)
  }

  // Retrieval prioritizes verified product knowledge (module corpus) BEFORE
  // generic website content — product knowledge is always placed first.
  const moduleContext = retrieveContext(signals.retrievalQuery)
  const articleContext = retrieveArticleContext(signals.retrievalQuery, { maxChars: 1200, maxChunks: 4 })
  const context = [moduleContext, articleContext].filter(Boolean).join('\n')
  const guidance = buildConversationGuidance(signals)
  // Comparison intent takes priority; otherwise offer a recommendation when there's enough signal.
  const recommendation = buildRecommendation(signals)
  const guidanceBlock = comparison
    ? `${guidance}\nCOMPARISON (explain this naturally, in your own words, using these verified points): ${comparison}`
    : recommendation ? `${guidance}\n${recommendation}` : guidance
  const system = `${TARA_SYSTEM_PROMPT}\n\n${guidanceBlock}${context ? `\n\nRELEVANT VERIFIED CONTEXT:\n${context}` : ''}`
  try {
    const reply = await taraComplete(system, turns, TARA_LIMITS.timeoutMs())
    aiTurns += 1
    return withSession(NextResponse.json({ available: true, reply, handoffSuggested: false }), sid, aiTurns)
  } catch (error) {
    console.error('[tara] provider completion failed', error instanceof Error ? error.message : 'unknown provider error')
    return withSession(NextResponse.json({ available: true, reply: fallbackReply || SAFE_FALLBACK, handoffSuggested: false, degraded: true }), sid, aiTurns)
  }
}
