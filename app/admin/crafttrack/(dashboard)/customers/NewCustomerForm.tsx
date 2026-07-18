'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminTextField from '@/components/crafttrack/admin/AdminTextField'

export default function NewCustomerForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)

    try {
      const res = await fetch('/api/admin/crafttrack/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }

      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Could not create the customer. Please try again.')
        return
      }

      setName('')
      setEmail('')
      router.refresh()
    } catch {
      setError('Could not create the customer. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <AdminTextField label="Full name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
      <AdminTextField label="Email address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <button
        type="submit"
        disabled={busy}
        aria-busy={busy}
        className="bg-ink text-gold-p rounded-sm px-4 py-2.5 text-sm self-start disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-gold/50"
      >
        {busy ? 'Creating…' : 'Create customer'}
      </button>
    </form>
  )
}
