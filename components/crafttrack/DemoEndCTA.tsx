'use client'

import { useState } from 'react'
import { submitEnquiry } from '@/lib/submit-enquiry'

export default function DemoEndCTA() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState<'custom' | 'catalogue' | null>(null)
  const [result, setResult] = useState<string | null>(null)

  async function submit(formType: 'custom' | 'catalogue') {
    setBusy(formType)
    setResult(null)

    const fields: Record<string, string> = { fullName: name, email }
    if (formType === 'custom') {
      fields.message = message || `I'd like a quote for a project similar to the CraftTrack™ demo (Premium Hand Tufted Carpet).`
    }

    const res = await submitEnquiry(formType, fields)
    setResult(res.ok ? 'Thank you — our team will be in touch shortly.' : res.error)
    setBusy(null)
  }

  return (
    <div className="bg-ink px-8 py-16 text-center -mx-6 sm:mx-0 sm:rounded-sm mt-14">
      <h2 className="font-display text-3xl text-ivory mb-3">Ready to start your own CraftTrack™?</h2>
      <p className="font-serif text-sm text-ivory/70 mb-10 max-w-md mx-auto">
        Every TAPIS order carries this same visibility, from loom to delivery.
      </p>

      <div className="max-w-sm mx-auto flex flex-col gap-4 mb-8 text-left">
        <label className="flex flex-col gap-1.5">
          <span className="text-2xs uppercase tracking-wide text-ivory/60">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent border-0 border-b border-ivory/25 text-ivory py-2 text-sm outline-none focus:border-gold"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-2xs uppercase tracking-wide text-ivory/60">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent border-0 border-b border-ivory/25 text-ivory py-2 text-sm outline-none focus:border-gold"
          />
        </label>
      </div>

      {result && (
        <p role="status" className="text-sm text-gold-l mb-6">
          {result}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          type="button"
          onClick={() => submit('custom')}
          disabled={busy !== null || !name || !email}
          aria-busy={busy === 'custom'}
          className="border border-gold text-gold rounded-full px-8 py-3 text-sm tracking-wide disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          {busy === 'custom' ? 'Sending…' : 'Request a Quote'}
        </button>
        <button
          type="button"
          onClick={() => submit('catalogue')}
          disabled={busy !== null || !name || !email}
          aria-busy={busy === 'catalogue'}
          className="text-ivory/80 text-sm underline underline-offset-4 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-gold/60 rounded-sm"
        >
          {busy === 'catalogue' ? 'Sending…' : 'Request Catalogue'}
        </button>
      </div>
    </div>
  )
}
