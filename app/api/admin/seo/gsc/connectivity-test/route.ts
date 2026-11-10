import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { SEO_SESSION_COOKIE, verifySeoSession } from '@/lib/seo-command/auth-session'
import { originMatchesHost } from '@/lib/seo-command/auth'
import { isSeoDbConfigured, withSeoTx } from '@/lib/seo-command/db'
import { configuredBaseUrl } from '@/lib/seo-command/store'
import { gscOAuthConfig } from '@/lib/seo-command/gsc-oauth'
import { readRefreshTokenReadOnly, runConnectivityTest } from '@/lib/seo-command/gsc-connectivity'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Admin-only, same-origin, READ-ONLY connectivity test (sites.list, a <=10 row Search Analytics query, sitemaps.list).
 *  Deliberately does not use the standard API wrapper: it upserts seo_sites on every call, and this route must write nothing.
 *  The database work runs in a READ ONLY transaction, so Postgres rejects any write. Nothing is stored or imported. */
export async function POST() {
  const noStore = { headers: { 'cache-control': 'no-store' } }
  const session = await verifySeoSession(cookies().get(SEO_SESSION_COOKIE)?.value)
  if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401, ...noStore })
  if (!originMatchesHost(headers())) return NextResponse.json({ ok: false, error: 'Cross-origin request refused' }, { status: 403, ...noStore })
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
    const report = await runConnectivityTest({ refreshToken: read.refreshToken, cfg })
    return NextResponse.json({ ok: report.token.ok, report }, noStore)
  } catch (e) {
    console.error('[seo-command] gsc connectivity test failed:', e instanceof Error ? e.name : 'unknown')
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500, ...noStore })
  }
}
