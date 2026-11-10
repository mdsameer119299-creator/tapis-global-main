import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SEO_SESSION_COOKIE, verifySeoSession } from '@/lib/seo-command/auth-session'
import { isLoginConfigured } from '@/lib/seo-command/auth-password'
import { isSeoSessionConfigured } from '@/lib/seo-command/auth-session'
import { LoginForm } from '@/components/seo-command/login-form'

export const metadata = { title: 'SEO Command Centre sign in', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function SeoLoginPage() {
  if (await verifySeoSession(cookies().get(SEO_SESSION_COOKIE)?.value)) redirect('/admin/seo')
  const configured = isLoginConfigured() && isSeoSessionConfigured()
  // Value-free diagnostics: booleans and shape hints only, never any secret content.
  const rawHash = process.env.SEO_ADMIN_PASSWORD_HASH
  const checks: string[] = []
  if (!configured) {
    checks.push(`SEO_ADMIN_EMAIL: ${process.env.SEO_ADMIN_EMAIL ? 'present' : 'MISSING'}`)
    checks.push(`SEO_SESSION_SECRET: ${isSeoSessionConfigured() ? 'ok' : process.env.SEO_SESSION_SECRET ? `too short (${process.env.SEO_SESSION_SECRET.length} chars, need 32+)` : 'MISSING'}`)
    checks.push(`SEO_ADMIN_PASSWORD_HASH: ${!rawHash ? 'MISSING' : isLoginConfigured() ? 'ok' : `present but invalid format (${rawHash.length} chars, ${rawHash.split(':').length} colon-separated parts, starts with "scrypt:" = ${rawHash.trim().startsWith('scrypt:')}, has quote/space/newline = ${/["'\s]/.test(rawHash)})`}`)
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6 font-body">
      <div className="w-full max-w-sm rounded-lg border border-ivory-k bg-white p-6">
        <h1 className="font-display text-xl text-ink">SEO Command Centre</h1>
        <p className="mb-4 mt-1 text-sm text-ink-s">Separate sign-in for the SEO workspace.</p>
        {configured ? <LoginForm /> : <p className="text-sm text-amber-800">SEO sign-in is not configured for this environment. Set SEO_ADMIN_EMAIL, SEO_ADMIN_PASSWORD_HASH and SEO_SESSION_SECRET (Preview) and redeploy.</p>}
        {!configured && <ul className="mt-3 list-disc pl-5 text-xs text-ink-s">{checks.map(c => <li key={c}>{c}</li>)}</ul>}
      </div>
    </div>
  )
}
