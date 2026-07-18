import SetPasswordForm from './SetPasswordForm'

export const metadata = { robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default function SetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token ?? ''

  return (
    <div className="min-h-screen bg-ivory font-body flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-ink text-center mb-2">
          CraftTrack<span className="text-gold">™</span>
        </h1>
        <p className="text-center text-sm text-ink-m mb-10">Set a password to access your order.</p>
        {token ? (
          <SetPasswordForm token={token} />
        ) : (
          <p role="alert" className="text-sm text-red-600 text-center">
            This link is missing its token. Please use the exact link from your email, or ask us to send a new one.
          </p>
        )}
      </div>
    </div>
  )
}
