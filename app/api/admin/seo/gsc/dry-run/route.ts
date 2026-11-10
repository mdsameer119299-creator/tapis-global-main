import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { SEO_SESSION_COOKIE, verifySeoSession } from '@/lib/seo-command/auth-session'
import { originMatchesHost } from '@/lib/seo-command/auth'
import { isSeoDbConfigured, withSeoTx } from '@/lib/seo-command/db'
import { configuredBaseUrl } from '@/lib/seo-command/store'
import { gscOAuthConfig } from '@/lib/seo-command/gsc-oauth'
import { readRefreshTokenReadOnly } from '@/lib/seo-command/gsc-connectivity'
import { buildWindows, runDryRunStep, type DryRunStep } from '@/lib/seo-command/gsc-dryrun'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** TEMPORARY admin-only, same-origin, READ-ONLY 90-day Search Console dry-run. Remove this file (and gsc-dryrun.ts + its test) to remove it.
 *  Body: {"step":"daily"} | {"step":"window","index":1..13,"startRow"?:n} | {"step":"sitemaps"}. Property and date range are fixed server-side.
 *  Not wrapped in the standard API wrapper because that upserts seo_sites; this route writes nothing: the database is only READ
 *  (READ ONLY transaction), no audit/sync rows, no connection timestamps. Returns aggregate counts only. */
export async function POST(req: Request) {
  const noStore = { headers: { 'cache-control': 'no-store' } }
  const session = await verifySeoSession(cookies().get(SEO_SESSION_COOKIE)?.value)
  if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401, ...noStore })
  if (!originMatchesHost(headers())) return NextResponse.json({ ok: false, error: 'Cross-origin request refused' }, { status: 403, ...noStore })
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  let step: DryRunStep | null = null
  if (body?.step === 'daily' || body?.step === 'sitemaps') step = { step: body.step }
  else if (body?.step === 'window' && Number.isInteger(body.index) && (body.index as number) >= 1 && (body.index as number) <= buildWindows().length) {
    const sr = body.startRow === undefined ? 0 : body.startRow
    if (Number.isInteger(sr) && (sr as number) >= 0 && (sr as number) <= 1_000_000) step = { step: 'window', index: body.index as number, startRow: sr as number }
  }
  if (!step) return NextResponse.json({ ok: false, error: 'Invalid step' }, { status: 400, ...noStore })
  const cfg = gscOAuthConfig()
  if (!cfg) return NextResponse.json({ ok: false, error: 'Search Console connection is not configured for this environment.' }, { status: 503, ...noStore })
  if (!isSeoDbConfigured()) return NextResponse.json({ ok: false, error: 'SEO database is not configured' }, { status: 503, ...noStore })
  try {
    const domain = new URL(configuredBaseUrl()).hostname.replace(/^www\./, '')
    const read = await withSeoTx(async (c) => {
      await c.query('SET TRANSACTION READ ONLY')
      const q = (t: string, p?: unknown[]) => c.query(t, p as unknown[]).then((x) => x.rows)
      const site = await q(`SELECT id FROM seo_sites WHERE domain=$1`, [domain])
      if (!site[0]) return { ok: false as const, reason: 'not_connected' as const }
      return readRefreshTokenReadOnly(q, site[0].id, cfg.property)
    })
    if (!read.ok) return NextResponse.json({ ok: false, error: `Connection is not usable: ${read.reason}` }, { status: 409, ...noStore })
    const result = await runDryRunStep({ refreshToken: read.refreshToken, cfg, req: step })
    return NextResponse.json({ ok: result.ok, result }, noStore)
  } catch (e) {
    console.error('[seo-command] gsc dry-run failed:', e instanceof Error ? e.name : 'unknown')
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500, ...noStore })
  }
}
