import { NextResponse } from 'next/server'
import { taraProviderAvailable, taraComplete } from '@/lib/tara/provider'
import { TARA_SYSTEM_PROMPT, retrieveContext, needsHandoff } from '@/lib/tara/knowledge'
import { retrieveArticleContext } from '@/lib/knowledge/content'
import { getClientIp } from '@/lib/enquiry-rate-limit'
import {
  TARA_LIMITS, sanitizeTurns, decide, burst, parseCookies,
  isValidSid, newSessionId, signCounter, verifyCounter,
} from '@/lib/tara/guard'

export const runtime = 'nodejs'

const HANDOFF_MSG = 'That is best handled by the TAPIS GLOBAL team, who can confirm the specifics for your project. Could you share your details so they can assist you?'
const QUOTA_MSG = 'We have covered a lot here — to go further, the TAPIS GLOBAL team can help directly. You can keep browsing categories and materials, or share your details and they will assist you.'
const SAFE_FALLBACK = 'I could not reach the advisor just now. You can browse categories and materials, or share your project details and our team will assist you.'

/** Attach the session id + signed AI-turn cookies (httpOnly, scoped, no PII). */
function withSession(res: NextResponse, sid: string, aiTurns: number): NextResponse {
  const common = { httpOnly: true, sameSite: 'lax' as const, secure: true, path: '/api/tara', maxAge: 60 * 60 * 6 }
  res.cookies.set('tara_sid', sid, common)
  res.cookies.set('tara_ai', signCounter(sid, aiTurns), common)
  return res
}

export async function POST(req: Request) {
  // No key -> deterministic guided mode. No cookies / no provider call.
  if (!taraProviderAvailable()) return NextResponse.json({ available: false, reply: null })

  // 1. Reject oversized requests before any parsing / provider work.
  const declared = Number(req.headers.get('content-length') || 0)
  if (declared && declared > TARA_LIMITS.maxBodyBytes) {
    return NextResponse.json({ available: true, reply: 'Your message is too large. Please shorten it.' }, { status: 413 })
  }

  // 2. Server-issued session (httpOnly, signed). Never trust a client-set id.
  const cookies = parseCookies(req.headers.get('cookie'))
  const sid = isValidSid(cookies['tara_sid']) ? cookies['tara_sid'] : newSessionId()
  let aiTurns = verifyCounter(sid, cookies['tara_ai'])

  // 3. Burst limiter (instance-local, defense-in-depth) per IP and per session.
  const ip = getClientIp(req)
  if (burst(`ip:${ip}`) || burst(`sid:${sid}`)) {
    return withSession(NextResponse.json({ available: true, reply: 'You are sending messages quickly — please wait a moment and try again.' }, { status: 429 }), sid, aiTurns)
  }

  // 4. Read + size-guard + parse. The Content-Length pre-check above is a fast
  //    reject for compliant clients; this byte check is the reliable guard
  //    (Content-Length can be absent or spoofed).
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

  // 5. Decide — handoff & quota NEVER call the paid provider.
  const decision = decide(needsHandoff(lastUser), aiTurns)
  if (decision === 'handoff') {
    return withSession(NextResponse.json({ available: true, reply: HANDOFF_MSG, handoffSuggested: true }), sid, aiTurns)
  }
  if (decision === 'quota') {
    return withSession(NextResponse.json({ available: true, reply: QUOTA_MSG, handoffSuggested: true }), sid, aiTurns)
  }

  // 6. Proceed to the provider (bounded timeout; system assembled server-side
  //    only so user content can never become the system prompt).
  // Retrieve from BOTH the in-code knowledge modules and the external Knowledge
  // Centre content files (server-side). TARA answers only from verified content.
  const moduleContext = retrieveContext(lastUser)
  // Bounded body-chunk retrieval: TARA receives the most relevant ARTICLE
  // SECTIONS (not just title+summary), strictly capped in size.
  const articleContext = retrieveArticleContext(lastUser, { maxChars: 1200, maxChunks: 4 })
  const context = [moduleContext, articleContext].filter(Boolean).join('\n')
  const system = context ? `${TARA_SYSTEM_PROMPT}\n\nRELEVANT VERIFIED CONTEXT:\n${context}` : TARA_SYSTEM_PROMPT
  try {
    const reply = await taraComplete(system, turns, TARA_LIMITS.timeoutMs())
    aiTurns += 1 // consume one AI turn only on a successful provider call
    return withSession(NextResponse.json({ available: true, reply, handoffSuggested: false }), sid, aiTurns)
  } catch {
    // Never leak raw provider/transport errors. No AI turn consumed.
    return withSession(NextResponse.json({ available: true, reply: SAFE_FALLBACK, handoffSuggested: true }), sid, aiTurns)
  }
}
