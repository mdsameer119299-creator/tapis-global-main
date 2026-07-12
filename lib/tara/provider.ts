/**
 * lib/tara/provider.ts — server-only AI provider abstraction for TARA.
 *
 * ONE configured provider (Anthropic) via env vars. The API key is read ONLY on
 * the server and NEVER shipped to the browser. When no key is configured the
 * provider reports unavailable and TARA falls back to its deterministic flow —
 * the build and feature keep working with no AI configured.
 *
 * Env:
 *   ANTHROPIC_API_KEY   (secret, server-only)   — enables the AI layer
 *   TARA_MODEL          (optional)              — model id, defaults to Haiku
 */

const API_URL = 'https://api.anthropic.com/v1/messages'
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001'

export interface TaraTurn { role: 'user' | 'assistant'; content: string }

export function taraProviderAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

/**
 * Complete a TARA turn. Server-only. Throws on transport/timeout errors so the
 * route can convert them into a safe, non-leaking fallback message.
 */
export async function taraComplete(system: string, turns: TaraTurn[], timeoutMs = 15000): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('provider unavailable')

  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), timeoutMs)
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      signal: ac.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.TARA_MODEL || DEFAULT_MODEL,
        max_tokens: 400,
        temperature: 0.3,
        system,
        messages: turns.map((t) => ({ role: t.role, content: t.content })),
      }),
    })
    if (!res.ok) throw new Error(`provider status ${res.status}`)
    const data = await res.json()
    const text = Array.isArray(data?.content)
      ? data.content.filter((b: { type?: string }) => b?.type === 'text').map((b: { text?: string }) => b.text).join('').trim()
      : ''
    if (!text) throw new Error('empty completion')
    return text
  } finally {
    clearTimeout(timer)
  }
}
