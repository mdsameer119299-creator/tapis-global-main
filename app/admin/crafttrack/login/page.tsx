'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminTextField from '@/components/crafttrack/admin/AdminTextField'
import Spinner from '@/components/crafttrack/Spinner'

export default function CraftTrackLoginPage() {
  const router = useRouter()
  const emailRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/crafttrack/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }

      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setBusy(false)
        return
      }

      router.push('/admin/crafttrack')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory font-body flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-ink text-center mb-8">
          CraftTrack<span className="text-gold">™</span> Admin
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          {error && (
            <p role="alert" className="text-sm text-red-600 text-center">
              {error}
            </p>
          )}
          <AdminTextField
            ref={emailRef}
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <AdminTextField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className="mt-2 w-full bg-ink text-gold-p rounded-sm py-3 text-sm tracking-wide disabled:opacity-80 focus-visible:ring-2 focus-visible:ring-gold/50 flex items-center justify-center gap-2"
          >
            {busy && <Spinner />}
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
