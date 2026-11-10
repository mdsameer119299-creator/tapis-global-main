import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { SEO_SESSION_COOKIE, verifySeoSession } from '@/lib/seo-command/auth-session'
import { originMatchesHost } from '@/lib/seo-command/auth'
import { getSeoPool, isSeoDbConfigured } from '@/lib/seo-command/db'
import { gscOAuthConfig } from '@/lib/seo-command/gsc-oauth'
import { refreshAccessToken } from '@/lib/seo-command/gsc-google'
import { readRefreshTokenReadOnly } from '@/lib/seo-command/gsc-connectivity'
import { IMPORT_BASELINE } from '@/lib/seo-command/gsc-import-baseline'
import {
  IMPORT_CONFIRM_PHRASE, IMPORT_EXPECTED_DB_REF, IMPORT_PROPERTY, IMPORT_SITE_DOMAIN, IMPORT_WINDOWS, ImportError, createGscSource, failImport, finishImport, importDaily, importStatus, importTx, importWindow,
  resumeImport, rollbackImport, startImport, type ImportRun,
} from '@/lib/seo-command/gsc-import'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** One-time Search Console 90-day import (2026-08-11..2026-11-08, sc-domain:tapisglobalinternational.com). Admin-only, same-origin, Preview-only, explicitly enabled.
 *  One request = one step (Vercel Hobby 60 s limit). Writes only the four approved tables (see lib/seo-command/gsc-import.ts). Responses carry counts and fixed codes only:
 *  never query text, URLs, tokens, credentials or database error text.
 *  Body: {action:'start',confirm} | {action:'daily'|'finish'|'status'|'resume'|'rollback', runId, confirm?} | {action:'window', runId, index:1..13}.
 *  No cron, no background job: nothing here runs unless an admin calls it. */
const noStore = { headers: { 'cache-control': 'no-store' } }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status, ...noStore })

export async function POST(req: Request) {
  const session = await verifySeoSession(cookies().get(SEO_SESSION_COOKIE)?.value)
  if (!session) return fail('Unauthorized', 401)
  if (!originMatchesHost(headers())) return fail('Cross-origin request refused', 403)
  // Preview-only, and only when explicitly enabled; the database must be the approved SEO development project.
  if (process.env.VERCEL_ENV !== 'preview') return fail('The import is available only in the Preview environment.', 403)
  if (process.env.SEO_GSC_IMPORT_ENABLED !== 'true') return fail('The import is not enabled for this environment.', 403)
  if ((process.env.SEO_DATABASE_EXPECTED_REF ?? '').toLowerCase() !== IMPORT_EXPECTED_DB_REF || !(process.env.SEO_DATABASE_URL ?? '').toLowerCase().includes(IMPORT_EXPECTED_DB_REF)) return fail('The SEO database is not the approved development project.', 403)
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  const action = typeof body?.action === 'string' ? body.action : ''
  const runId = typeof body?.runId === 'string' && UUID.test(body.runId) ? body.runId : ''
  if (!['start', 'daily', 'window', 'finish', 'status', 'resume', 'rollback'].includes(action)) return fail('Invalid action', 400)
  if (action !== 'start' && !runId) return fail('Invalid runId', 400)
  if ((action === 'start' || action === 'rollback') && body?.confirm !== IMPORT_CONFIRM_PHRASE) return fail('Confirmation phrase missing or incorrect.', 400)
  const index = Number(body?.index)
  if (action === 'window' && !(Number.isInteger(index) && index >= 1 && index <= IMPORT_WINDOWS.length)) return fail('Invalid window index', 400)
  const cfg = gscOAuthConfig()
  if (!cfg || cfg.property !== IMPORT_PROPERTY) return fail('Search Console connection is not configured for this environment.', 503)
  if (!isSeoDbConfigured()) return fail('SEO database is not configured', 503)

  const pool = getSeoPool()
  const actor = session.email
  try {
    if (action === 'start') return NextResponse.json({ ok: true, ...(await startImport(pool, IMPORT_BASELINE, actor)) }, noStore)
    if (action === 'status') return NextResponse.json({ ok: true, ...(await importStatus(pool, runId)) }, noStore)
    if (action === 'resume') return NextResponse.json({ ok: true, ...(await resumeImport(pool, runId, actor)) }, noStore)
    if (action === 'rollback') return NextResponse.json({ ok: true, ...(await rollbackImport(pool, runId, actor)) }, noStore)

    const st = await importStatus(pool, runId)
    const run: ImportRun = await importTx(pool, async (c) => ({ runId, siteId: (await c.query(`SELECT "siteId" FROM seo_gsc_sync_runs WHERE id=$1`, [runId])).rows[0].siteId as string }), { readOnly: true })
    if (action === 'finish') return NextResponse.json({ ok: true, runId, ...(await finishImport(pool, run, IMPORT_BASELINE)) }, noStore)
    if (st.status !== 'RUNNING') return fail('Run is not RUNNING.', 409)

    // The refresh token is read through the importer role (READ ONLY transaction) and exchanged for a short-lived access token; neither is ever returned or logged.
    const read = await importTx(pool, async (c) => {
      const q = (t: string, p?: unknown[]) => c.query(t, p as unknown[]).then((x) => x.rows)
      const site = await q(`SELECT id FROM seo_sites WHERE domain=$1`, [IMPORT_SITE_DOMAIN])
      return site[0] ? readRefreshTokenReadOnly(q, site[0].id, cfg.property) : ({ ok: false, reason: 'not_connected' } as const)
    }, { readOnly: true })
    if (!read.ok) return fail(`Connection is not usable: ${read.reason}`, 409)
    const tok = await refreshAccessToken(cfg, read.refreshToken)
    if (!tok.ok) return fail('Could not obtain a Search Console access token.', 502)
    const src = createGscSource(tok.accessToken)
    try {
      const out = action === 'daily' ? await importDaily(pool, run, src, IMPORT_BASELINE) : await importWindow(pool, run, src, IMPORT_BASELINE, IMPORT_WINDOWS[index - 1])
      return NextResponse.json({ ok: true, runId, step: action === 'daily' ? 'daily' : index, ...out }, noStore)
    } catch (e) {
      const err = e instanceof ImportError ? e : new ImportError('DB_ERROR')
      if (action === 'window') err.diag = { ...err.diag, window: index }
      const f = await failImport(pool, run, err)
      return NextResponse.json({ ok: false, runId, code: err.code, window: err.diag.window ?? null, stable: err.diag.stable ?? null, observed: err.diag.observed ?? null, expected: err.diag.expected ?? null, ...f }, { status: 409, ...noStore })
    }
  } catch (e) {
    const code = e instanceof ImportError ? e.code : 'INTERNAL'
    console.error('[seo-command] gsc import failed:', e instanceof Error ? e.name : 'unknown', code)
    return NextResponse.json({ ok: false, code }, { status: e instanceof ImportError ? 409 : 500, ...noStore })
  }
}
