'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminTextField from '@/components/crafttrack/admin/AdminTextField'
import AdminSelect from '@/components/crafttrack/admin/AdminSelect'

type Props = {
  orderId: string
  templates: { id: string; name: string }[]
  products: { slug: string; name: string }[]
}

export default function AddJourneyForm({ orderId, templates, products }: Props) {
  const router = useRouter()
  const [productName, setProductName] = useState('')
  const [productSlug, setProductSlug] = useState('')
  const [journeyTemplateId, setJourneyTemplateId] = useState(templates[0]?.id ?? '')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!productName.trim() || !journeyTemplateId) {
      setError('Enter a product name and select a journey template.')
      return
    }

    setBusy(true)

    try {
      const res = await fetch(`/api/admin/crafttrack/orders/${orderId}/journeys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: productName.trim(), productSlug: productSlug || null, journeyTemplateId }),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }

      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Could not add the journey. Please try again.')
        return
      }

      setProductName('')
      setProductSlug('')
      router.refresh()
    } catch {
      setError('Could not add the journey. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md" noValidate>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <AdminTextField label="Product name" name="productName" value={productName} onChange={(e) => setProductName(e.target.value)} required />
      <AdminSelect
        label="Catalogue link (optional)"
        name="productSlug"
        value={productSlug}
        onChange={(e) => setProductSlug(e.target.value)}
        placeholder="None — custom / bespoke piece"
        options={products.map((p) => ({ value: p.slug, label: p.name }))}
      />
      <AdminSelect
        label="Journey template"
        name="journeyTemplateId"
        value={journeyTemplateId}
        onChange={(e) => setJourneyTemplateId(e.target.value)}
        options={templates.map((t) => ({ value: t.id, label: t.name }))}
        required
      />
      <button
        type="submit"
        disabled={busy}
        aria-busy={busy}
        className="bg-ink text-gold-p rounded-sm px-4 py-2.5 text-sm self-start disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-gold/50"
      >
        {busy ? 'Adding…' : 'Add journey'}
      </button>
    </form>
  )
}
