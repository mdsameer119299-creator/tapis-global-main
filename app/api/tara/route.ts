import { NextResponse } from 'next/server'
import { taraProviderAvailable, taraComplete } from '@/lib/tara/provider'
import { TARA_SYSTEM_PROMPT, retrieveContext, needsHandoff } from '@/lib/tara/knowledge'
import { retrieveArticleContext } from '@/lib/knowledge/content'
import { getClientIp } from '@/lib/enquiry-rate-limit'
import { TARA_LIMITS, sanitizeTurns, decide, burst, parseCookies, isValidSid, newSessionId, signCounter, verifyCounter } from '@/lib/tara/guard'

export const runtime = 'nodejs'
const HANDOFF_MSG = 'I can keep helping you here. For project-specific prices, MOQ, payment terms, samples, quotations or confirmed capabilities, the TAPIS GLOBAL team must confirm the details. If you want, use Talk to the team to share your requirement; otherwise, continue chatting with me.'
const QUOTA_MSG = 'We have covered a lot here. You can continue browsing categories and materials, or use Talk to the team if you want the TAPIS GLOBAL team to review your project details.'
const SAFE_FALLBACK = 'I could not reach the advisor just now. Please try again in a moment. You can also ask me about carpets, rugs, materials, constructions, care or custom manufacturing.'
const GREETING_REPLY = 'Hello! 👋 I’m TARA, the AI Rug & Carpet Advisor for TAPIS GLOBAL INTERNATIONAL PVT LTD. How can I help you today? You can ask me about carpets, rugs, materials, constructions, care, custom manufacturing, or your project requirements.'

function isGreeting(message: string): boolean {
  const normalized = message.trim().toLowerCase().replace(/[.!?]+$/g, '').trim()
  return /^(hi|hii+|hey|hello|hello there|good morning|good afternoon|good evening|namaste|salaam|salam|assalamu alaikum|howdy)$/.test(normalized)
}
function withSession(res: NextResponse, sid: string, aiTurns: number): NextResponse {
  const common = { httpOnly: true, sameSite: 'lax' as const, secure: true, path: '/api/tara', maxAge: 60 * 60 * 6 }
  res.cookies.set('tara_sid', sid, common); res.cookies.set('tara_ai', signCounter(sid, aiTurns), common); return res
}
export async function POST(req: Request) {
  const declared = Number(req.headers.get('content-length') || 0)
  if (declared && declared > TARA_LIMITS.maxBodyBytes) return NextResponse.json({ available: true, reply: 'Your message is too large. Please shorten it.' }, { status: 413 })
  const cookies = parseCookies(req.headers.get('cookie'))
  const sid = isValidSid(cookies['tara_sid']) ? cookies['tara_sid'] : newSessionId()
  let aiTurns = verifyCounter(sid, cookies['tara_ai'])
  const ip = getClientIp(req)
  if (burst(`ip:${ip}`) || burst(`sid:${sid}`)) return withSession(NextResponse.json({ available: true, reply: 'You are sending messages quickly — please wait a moment and try again.' }, { status: 429 }), sid, aiTurns)
  let raw: string
  try { raw = await req.text() } catch { return withSession(NextResponse.json({ available: true, reply: 'Sorry, I could not read that. Please try again.' }, { status: 400 }), sid, aiTurns) }
  if (Buffer.byteLength(raw) > TARA_LIMITS.maxBodyBytes) return withSession(NextResponse.json({ available: true, reply: 'Your message is too large. Please shorten it.' }, { status: 413 }), sid, aiTurns)
  let body: { messages?: unknown }
  try { body = JSON.parse(raw) } catch { return withSession(NextResponse.json({ available: true, reply: 'Sorry, I could not read that. Please try again.' }, { status: 400 }), sid, aiTurns) }
  const turns = sanitizeTurns(body.messages)
  if (turns.length === 0) return withSession(NextResponse.json({ available: true, reply: 'Please type your question about carpets or rugs.' }, { status: 400 }), sid, aiTurns)
  const lastUser = [...turns].reverse().find((t) => t.role === 'user')?.content ?? ''
  if (isGreeting(lastUser)) return withSession(NextResponse.json({ available: true, reply: GREETING_REPLY, handoffSuggested: false }), sid, aiTurns)
  if (!taraProviderAvailable()) return withSession(NextResponse.json({ available: true, reply: SAFE_FALLBACK, handoffSuggested: false }), sid, aiTurns)
  const decision = decide(needsHandoff(lastUser), aiTurns)
  if (decision === 'handoff') return withSession(NextResponse.json({ available: true, reply: HANDOFF_MSG, handoffSuggested: true }), sid, aiTurns)
  if (decision === 'quota') return withSession(NextResponse.json({ available: true, reply: QUOTA_MSG, handoffSuggested: true }), sid, aiTurns)
  const moduleContext = retrieveContext(lastUser)
  const articleContext = retrieveArticleContext(lastUser, { maxChars: 1200, maxChunks: 4 })
  const context = [moduleContext, articleContext].filter(Boolean).join('\n')
  const system = context ? `${TARA_SYSTEM_PROMPT}\n\nRELEVANT VERIFIED CONTEXT:\n${context}` : TARA_SYSTEM_PROMPT
  try { const reply = await taraComplete(system, turns, TARA_LIMITS.timeoutMs()); aiTurns += 1; return withSession(NextResponse.json({ available: true, reply, handoffSuggested: false }), sid, aiTurns) }
  catch { return withSession(NextResponse.json({ available: true, reply: SAFE_FALLBACK, handoffSuggested: false }), sid, aiTurns) }
}
