'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminTextField from '@/components/crafttrack/admin/AdminTextField'

type Mode = 'lookup' | 'login'

export default function AccessForm() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('lookup')
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstFieldRef.current?.focus()
  }, [mode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)

    const url = mode === 'lookup' ? '/api/crafttrack/order-lookup' : '/api/crafttrack/login'
    const body = mode === 'lookup' ? { orderNumber, email } : { email, password }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }

      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setBusy(false)
        return
      }

      router.push('/crafttrack/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-8" role="group" aria-label="Access mode">
        <button
          type="button"
          onClick={() => setMode('lookup')}
          aria-pressed={mode === 'lookup'}
          className={`flex-1 text-center py-2.5 text-2xs tracking-wide uppercase rounded-sm border focus-visible:ring-2 focus-visible:ring-gold/50 ${
            mode === 'lookup' ? 'bg-ink text-gold-p border-ink' : 'bg-transparent text-ink-m border-ivory-k'
          }`}
        >
          I have an order number
        </button>
        <button
          type="button"
          onClick={() => setMode('login')}
          aria-pressed={mode === 'login'}
          className={`flex-1 text-center py-2.5 text-2xs tracking-wide uppercase rounded-sm border focus-visible:ring-2 focus-visible:ring-gold/50 ${
            mode === 'login' ? 'bg-ink text-gold-p border-ink' : 'bg-transparent text-ink-m border-ivory-k'
          }`}
        >
          I have an account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {error && (
          <p role="alert" className="text-sm text-red-600 text-center">
            {error}
          </p>
        )}

        {mode === 'lookup' ? (
          <>
            <AdminTextField
              ref={firstFieldRef}
              label="Order number"
              name="orderNumber"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="TGI-2026-0158"
              required
            />
            <AdminTextField
              label="Email address on the order"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </>
        ) : (
          <>
            <AdminTextField
              ref={firstFieldRef}
              label="Email address"
              name="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <AdminTextField
              label="Password"
              name="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </>
        )}

        <button
          type="submit"
          disabled={busy}
          aria-busy={busy}
          className="mt-2 w-full bg-ink text-gold-p rounded-sm py-3 text-sm tracking-wide disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-gold/50"
        >
          {busy ? 'Checking…' : mode === 'lookup' ? 'View my order' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
