import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from '@/lib/crafttrack/session'
import LogoutButton from '@/components/crafttrack/admin/LogoutButton'

export const metadata = {
  robots: { index: false, follow: false },
}

export default async function CraftTrackAdminLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value
  const session = token ? await verifyAdminSession(token) : null

  // The login page itself renders without this shell (see login/page.tsx,
  // which is a route group sibling reached before a session exists) — but
  // middleware.ts already redirects every other /admin/crafttrack/* route
  // to /login when there's no valid session, so this check is a defensive
  // fallback, not the primary gate.
  if (!session) {
    redirect('/admin/crafttrack/login')
  }

  return (
    <div className="min-h-screen bg-ivory font-body">
      <header className="border-b border-ivory-k bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/admin/crafttrack" className="font-display text-lg text-ink">
            CraftTrack<span className="text-gold">™</span> Admin
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/admin/crafttrack" className="text-ink-s hover:text-ink">
              Orders
            </Link>
            <Link href="/admin/crafttrack/customers" className="text-ink-s hover:text-ink">
              Customers
            </Link>
            <span className="text-ink-m text-2xs">{session.email}</span>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  )
}
