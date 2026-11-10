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
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6 font-body">
      <div className="w-full max-w-sm rounded-lg border border-ivory-k bg-white p-6">
        <h1 className="font-display text-xl text-ink">SEO Command Centre</h1>
        <p className="mb-4 mt-1 text-sm text-ink-s">Separate sign-in for the SEO workspace.</p>
        {configured ? <LoginForm /> : <p className="text-sm text-amber-800">SEO sign-in is not configured for this environment. Set SEO_ADMIN_EMAIL, SEO_ADMIN_PASSWORD_HASH and SEO_SESSION_SECRET (Preview) and redeploy.</p>}
      </div>
    </div>
  )
}
