'use client'

import { useState } from 'react'

type Props = {
  customerId: string
  hasPassword: boolean
}

/** Admin-triggered only — same action serves both "first-time login setup"
 * (no password yet) and "forgot password" (already has one), since both
 * just mean "email this customer a link to set a new password." */
export default function SendLoginLinkButton({ customerId, hasPassword }: Props) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function send() {
    setState('sending')
    setError(null)
    try {
      const res = await fetch(`/api/admin/crafttrack/customers/${customerId}/send-login-link`, { method: 'POST' })
      const data = (await res.json()) as { ok: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Could not send the link.')
        setState('error')
        return
      }
      setState('sent')
    } catch {
      setError('Could not send the link.')
      setState('error')
    }
  }

  if (state === 'sent') {
    return <span className="text-2xs text-ink-m">Link sent ✓</span>
  }

  return (
    <div>
      <button
        type="button"
        onClick={send}
        disabled={state === 'sending'}
        aria-busy={state === 'sending'}
        className="text-2xs text-ink underline underline-offset-4 disabled:opacity-50 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
      >
        {state === 'sending' ? 'Sending…' : hasPassword ? 'Send password reset link' : 'Send login setup link'}
      </button>
      {error && (
        <p role="alert" className="text-2xs text-red-600 mt-1 max-w-[12rem]">
          {error}
        </p>
      )}
    </div>
  )
}
