import Link from 'next/link'
import { requireCustomerSessionOrRedirect } from '@/lib/crafttrack/require-customer-session'
import { prisma } from '@/lib/prisma'
import CustomerLogoutButton from '@/components/crafttrack/CustomerLogoutButton'

export const metadata = { robots: { index: false, follow: false } }

export default async function CraftTrackDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireCustomerSessionOrRedirect()

  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    select: { name: true, passwordHash: true },
  })

  return (
    <div className="min-h-screen bg-ivory font-body">
      <header className="border-b border-ivory-k">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/crafttrack/dashboard" className="font-display text-lg text-ink">
            CraftTrack<span className="text-gold">™</span>
          </Link>
          <nav className="flex items-center gap-5 text-2xs">
            <span className="text-ink-m hidden sm:inline">{customer?.name}</span>
            <Link href="/crafttrack/dashboard/account/password" className="text-ink-m underline underline-offset-4">
              {customer?.passwordHash ? 'Change password' : 'Set up a password'}
            </Link>
            <CustomerLogoutButton />
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
