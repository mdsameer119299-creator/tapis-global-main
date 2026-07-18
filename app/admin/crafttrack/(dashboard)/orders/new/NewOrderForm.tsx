'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminTextField from '@/components/crafttrack/admin/AdminTextField'
import AdminSelect from '@/components/crafttrack/admin/AdminSelect'
import AdminCombobox, { type CustomerRefValue } from '@/components/crafttrack/admin/AdminCombobox'

type Props = {
  templates: { id: string; name: string }[]
  products: { slug: string; name: string }[]
}

export default function NewOrderForm({ templates, products }: Props) {
  const router = useRouter()
  const [customer, setCustomer] = useState<CustomerRefValue>(null)
  const [productName, setProductName] = useState('')
  const [productSlug, setProductSlug] = useState('')
  // A single v1 template is pre-selected by default — genuinely selected,
  // not a blank "choose one" placeholder state, since there's only one to
  // pick from today.
  const [journeyTemplateId, setJourneyTemplateId] = useState(templates[0]?.id ?? '')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!customer) {
      setError('Choose an existing customer or create a new one.')
      return
    }
    if (customer.mode === 'new' && (!customer.name.trim() || !customer.email.trim())) {
      setError('Enter the new customer’s name and email.')
      return
    }
    if (!productName.trim()) {
      setError('Enter the product name.')
      return
    }
    if (!journeyTemplateId) {
      setError('Select a journey template.')
      return
    }

    setBusy(true)

    const payload = {
      customer:
        customer.mode === 'existing'
          ? { mode: 'existing' as const, customerId: customer.customerId }
          : { mode: 'new' as const, name: customer.name, email: customer.email },
      productName: productName.trim(),
      productSlug: productSlug || null,
      journeyTemplateId,
    }

    try {
      const res = await fetch('/api/admin/crafttrack/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { ok: boolean; error?: string; order?: { id: string } }

      if (!res.ok || !data.ok || !data.order) {
        setError(data.error ?? 'Could not create the order. Please try again.')
        setBusy(false)
        return
      }

      router.push(`/admin/crafttrack/orders/${data.order.id}`)
    } catch {
      setError('Could not create the order. Please try again.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <AdminCombobox label="Customer" value={customer} onChange={setCustomer} />

      <AdminTextField
        label="Product name"
        name="productName"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        placeholder="e.g. Premium Hand Tufted Carpet"
        required
      />

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
        className="mt-2 bg-ink text-gold-p rounded-sm px-5 py-3 text-sm tracking-wide self-start disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-gold/50"
      >
        {busy ? 'Creating order…' : 'Create order'}
      </button>
    </form>
  )
}
