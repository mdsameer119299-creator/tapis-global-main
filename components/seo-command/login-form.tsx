'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/seo/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.ok) {
        router.replace('/admin/seo')
        router.refresh()
        return
      }
      setError(json.error ?? 'Sign-in failed.')
      setPassword('')
    } catch {
      setError('Network error.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-2xs uppercase text-ink-m">Email
        <input type="email" required autoComplete="username" className="mt-1 w-full rounded border border-ivory-k px-3 py-2 text-sm normal-case text-ink" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} />
      </label>
      <label className="block text-2xs uppercase text-ink-m">Password
        <input type="password" required autoComplete="current-password" className="mt-1 w-full rounded border border-ivory-k px-3 py-2 text-sm normal-case text-ink" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={200} />
      </label>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      <button disabled={busy} className="w-full rounded bg-ink px-4 py-2 text-sm text-white disabled:opacity-50">{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  )
}

export function LogoutButton() {
  const router = useRouter()
  async function logout() {
    await fetch('/api/admin/seo/auth/logout', { method: 'POST' }).catch(() => undefined)
    router.replace('/admin/seo/login')
    router.refresh()
  }
  return <button onClick={logout} className="text-2xs text-ink-s underline hover:text-ink">Sign out</button>
}
