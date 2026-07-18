import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { CUSTOMER_SESSION_COOKIE, verifyCustomerSession } from '@/lib/crafttrack/session'
import AccessForm from './AccessForm'

export const metadata = { robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function CraftTrackAccessPage() {
  const token = cookies().get(CUSTOMER_SESSION_COOKIE)?.value
  const session = token ? await verifyCustomerSession(token) : null

  if (session) {
    redirect('/crafttrack/dashboard')
  }

  return (
    <div className="min-h-screen bg-ivory font-body flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-ink text-center mb-2">
          CraftTrack<span className="text-gold">™</span>
        </h1>
        <p className="text-center text-sm text-ink-m mb-10">Track the Craft. Trust the Process.</p>
        <AccessForm />
      </div>
    </div>
  )
}
