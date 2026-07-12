import { NextResponse } from 'next/server'
import { taraProviderAvailable, taraComplete, type TaraTurn } from '@/lib/tara/provider'
import { TARA_SYSTEM_PROMPT, retrieveContext, needsHandoff } from '@/lib/tara/knowledge'
import { getClientIp } from '@/lib/enquiry-rate-limit'

export const runtime = 'nodejs'

// Dedicated lightweight rate limiter for chat (separate from enquiry limiter).
const HITS = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 20
const MAX_TURNS = 12
const MAX_CHARS = 2000

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const arr = (HITS.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  if (arr.length >= MAX_PER_WINDOW) { HITS.set(ip, arr); return true }
  arr.push(now); HITS.set(ip, arr); return false
}

function sanitizeTurns(input: unknown): TaraTurn[] {
  if (!Array.isArray(input)) return []
  return input
    .filter((t): t is { role: string; content: string } => t && typeof t === 'object' && typeof (t as { content?: unknown }).content === 'string')
    .map((t): TaraTurn => ({ role: t.role === 'assistant' ? 'assistant' : 'user', content: String(t.content).slice(0, MAX_CHARS) }))
    .filter((t) => t.content.trim().length > 0)
    .slice(-MAX_TURNS)
}

export async function POST(req: Request) {
  // Availability: no key -> tell the client to use the deterministic flow (200).
  if (!taraProviderAvailable()) {
    return NextResponse.json({ available: false, reply: null })
  }

  const ip = getClientIp(req)
  if (rateLimited(ip)) {
    return NextResponse.json({ available: true, reply: 'You are sending messages quickly — please wait a moment and try again.' }, { status: 429 })
  }

  let body: { messages?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ available: true, reply: 'Sorry, I could not read that. Please try again.' }, { status: 400 }) }

  const turns = sanitizeTurns(body.messages)
  if (turns.length === 0) return NextResponse.json({ available: true, reply: 'Please type your question about carpets or rugs.' }, { status: 400 })

  const lastUser = [...turns].reverse().find((t) => t.role === 'user')?.content ?? ''
  const context = retrieveContext(lastUser)
  // System prompt (incl. guardrails) is assembled server-side only; user content
  // can never become the system message, blunting prompt-injection attempts.
  const system = context ? `${TARA_SYSTEM_PROMPT}\n\nRELEVANT VERIFIED CONTEXT:\n${context}` : TARA_SYSTEM_PROMPT

  try {
    const reply = await taraComplete(system, turns)
    return NextResponse.json({ available: true, reply, handoffSuggested: needsHandoff(lastUser) })
  } catch {
    // Never leak raw AI/transport errors. Offer the safe deterministic path.
    return NextResponse.json({
      available: true,
      reply: 'I could not reach the advisor just now. You can browse categories and materials, or share your project details and our team will assist you.',
      handoffSuggested: true,
    })
  }
}
