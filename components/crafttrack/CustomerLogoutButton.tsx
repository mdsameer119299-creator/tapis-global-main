'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CustomerLogoutButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleLogout() {
    setBusy(true)
    await fetch('/api/crafttrack/logout', { method: 'POST' })
    router.push('/crafttrack/access')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={busy}
      aria-busy={busy}
      className="text-ink-m underline underline-offset-4 hover:text-ink focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm disabled:opacity-50"
    >
      Log out
    </button>
  )
}
