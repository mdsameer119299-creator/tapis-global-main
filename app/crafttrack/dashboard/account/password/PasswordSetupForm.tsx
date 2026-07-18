'use client'

import { useState } from 'react'
import AdminTextField from '@/components/crafttrack/admin/AdminTextField'

export default function PasswordSetupForm({ hasPassword }: { hasPassword: boolean }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setBusy(true)
    try {
      const res = await fetch('/api/crafttrack/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          confirmPassword,
          ...(hasPassword ? { currentPassword } : {}),
        }),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }

      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Could not update your password. Please try again.')
        return
      }

      setSuccess(true)
      setCurrentPassword('')
      setPassword('')
      setConfirmPassword('')
    } catch {
      setError('Could not update your password. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-sm text-ink-s">
          Your password has been updated.
        </p>
      )}

      {hasPassword && (
        <AdminTextField
          label="Current password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      )}
      <AdminTextField
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <AdminTextField
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={busy}
        aria-busy={busy}
        className="mt-2 bg-ink text-gold-p rounded-sm py-3 text-sm tracking-wide disabled:opacity-60 self-start px-6 focus-visible:ring-2 focus-visible:ring-gold/50"
      >
        {busy ? 'Saving…' : hasPassword ? 'Update password' : 'Set password'}
      </button>
    </form>
  )
}
