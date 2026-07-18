import { prisma } from '@/lib/prisma'
import { requireCustomerSessionOrRedirect } from '@/lib/crafttrack/require-customer-session'
import PasswordSetupForm from './PasswordSetupForm'

export const metadata = { robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function AccountPasswordPage() {
  const session = await requireCustomerSessionOrRedirect()

  const customer = await prisma.customer.findUniqueOrThrow({
    where: { id: session.customerId },
    select: { passwordHash: true },
  })

  const hasPassword = Boolean(customer.passwordHash)

  return (
    <div className="min-h-screen bg-ivory font-body px-6 py-16">
      <div className="max-w-sm mx-auto">
        <h1 className="font-display text-2xl text-ink mb-2">
          {hasPassword ? 'Change your password' : 'Set up a password'}
        </h1>
        <p className="text-sm text-ink-m mb-8">
          {hasPassword
            ? 'Update the password you use to access all your orders.'
            : 'So you can access all your orders anytime, without needing your order number.'}
        </p>
        <PasswordSetupForm hasPassword={hasPassword} />
      </div>
    </div>
  )
}
