import { NextResponse } from 'next/server'
import { seoApi } from '@/lib/seo-command/auth'
import { withSeoTx } from '@/lib/seo-command/db'
import { audit } from '@/lib/seo-command/store'
import { disconnect } from '@/lib/seo-command/gsc-connection'

export const dynamic = 'force-dynamic'

/** Revokes the grant at Google (best effort) and wipes the stored encrypted token. Already-synced data is kept. */
export const POST = seoApi({ mutating: true }, async ({ siteId, actor }) => {
  const out = await withSeoTx(async (c) => {
    const r = await disconnect((t, p) => c.query(t, p as unknown[]).then((x) => x.rows), siteId)
    if (r.ok) await audit(c, siteId, actor, 'gsc.disconnect', 'seo_oauth_connections', null, { revokedAtGoogle: r.revokedAtGoogle })
    return r
  })
  if (!out.ok) return NextResponse.json({ ok: false, error: 'The stored token cannot be decrypted with the configured key, so it was left untouched. Restore the correct key, or use Reconnect to replace it.' }, { status: 409 })
  return NextResponse.json({ ok: true, revokedAtGoogle: out.revokedAtGoogle })
})
