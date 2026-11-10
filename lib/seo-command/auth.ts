import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { ADMIN_SESSION_COOKIE, verifyAdminSession, type AdminSessionPayload } from '@/lib/crafttrack/session'
import { isSeoDbConfigured, SeoDbNotConfiguredError } from './db'
import { getOrCreateSiteId } from './store'

/** Page guard. Layout guards alone are unreliable in the App Router (layouts do not re-run on client navigation), so every page calls this. */
export async function requireSeoPageSession(): Promise<AdminSessionPayload> {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value
  const session = token ? await verifyAdminSession(token) : null
  if (!session) redirect('/admin/crafttrack/login')
  return session
}

export type PageData<T> = { state: 'ok'; data: T } | { state: 'not_configured' } | { state: 'error'; message: string }

/** Loads dashboard data without ever throwing at render time and without leaking internals. */
export async function loadSeo<T>(fn: (siteId: string) => Promise<T>): Promise<PageData<T>> {
  if (!isSeoDbConfigured()) return { state: 'not_configured' }
  try {
    const siteId = await getOrCreateSiteId()
    return { state: 'ok', data: await fn(siteId) }
  } catch (e) {
    if (e instanceof SeoDbNotConfiguredError) return { state: 'not_configured' }
    console.error('[seo-command] load failed:', e instanceof Error ? e.message : 'unknown')
    return { state: 'error', message: 'The SEO database could not be reached. Check the SEO_DATABASE_URL setting and database status.' }
  }
}

/** Mutating requests must originate from this site (defence in depth on top of the session cookie). */
export function isSameOrigin(): boolean {
  const h = headers()
  const origin = h.get('origin')
  const host = h.get('x-forwarded-host') ?? h.get('host')
  if (!origin || !host) return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

interface Ctx {
  session: AdminSessionPayload
  actor: string
  siteId: string
}

export function seoApi<A extends unknown[]>(opts: { mutating: boolean }, handler: (ctx: Ctx, ...args: A) => Promise<NextResponse | Response>) {
  return async (...args: A): Promise<NextResponse | Response> => {
    const token = cookies().get(ADMIN_SESSION_COOKIE)?.value
    const session = token ? await verifyAdminSession(token) : null
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    if (opts.mutating && !isSameOrigin()) return NextResponse.json({ ok: false, error: 'Cross-origin request refused' }, { status: 403 })
    if (!isSeoDbConfigured()) return NextResponse.json({ ok: false, error: 'SEO database is not configured (SEO_DATABASE_URL)' }, { status: 503 })
    try {
      const siteId = await getOrCreateSiteId()
      return await handler({ session, actor: session.email, siteId }, ...args)
    } catch (e) {
      if (e instanceof SeoDbNotConfiguredError) return NextResponse.json({ ok: false, error: 'SEO database is not configured' }, { status: 503 })
      const name = e instanceof Error ? e.name : ''
      const msg = e instanceof Error ? e.message : 'unknown'
      if (name === 'CrawlBusyError') return NextResponse.json({ ok: false, error: msg }, { status: 409 })
      if (name === 'ApprovalError') {
        const code = (e as { code?: string }).code
        const status = code === 'NOT_FOUND' ? 404 : code === 'FORBIDDEN' ? 403 : code === 'CONFLICT' ? 409 : 400
        return NextResponse.json({ ok: false, error: msg }, { status })
      }
      if (name === 'CompetitorError') return NextResponse.json({ ok: false, error: msg }, { status: 400 })
      console.error('[seo-command] api failed:', msg)
      return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
    }
  }
}

export function bearerMatches(header: string | null, secret: string | undefined): boolean {
  if (!secret || secret.length < 16 || !header?.startsWith('Bearer ')) return false
  const a = Buffer.from(header.slice(7))
  const b = Buffer.from(secret)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  const text = await req.text()
  if (text.length > 20_000) throw Object.assign(new Error('Request too large'), { name: 'CompetitorError' })
  try {
    const v = JSON.parse(text || '{}')
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {}
  } catch {
    throw Object.assign(new Error('Invalid JSON body'), { name: 'CompetitorError' })
  }
}
export const str = (v: unknown, max = 500): string => (typeof v === 'string' ? v.slice(0, max) : '')
