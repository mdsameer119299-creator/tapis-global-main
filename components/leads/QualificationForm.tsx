'use client'

/**
 * QualificationForm — reusable B2B lead-qualification form.
 *
 * Captures the fields a sales team needs to qualify and route an enquiry, with
 * consent handling, a hidden honeypot, and analytics on successful submit. It
 * posts to the existing /api/enquiry pipeline (rate-limited + validated
 * server-side) via submitEnquiry, so no new backend or secret is introduced.
 *
 * All qualification fields are forwarded as-is and rendered in the lead email by
 * lib/enquiry-email.ts (dynamic field labels), and map 1:1 to the CRM lead
 * schema in docs/lead-data-schema.md.
 */
import { useState } from 'react'
import Link from 'next/link'
import { submitEnquiry, type EnquiryFormType } from '@/lib/submit-enquiry'
import { trackEvent, LEAD_EVENTS, type LeadEventName } from '@/lib/analytics'
import { BUYER_PATHS, type BuyerType } from '@/lib/buyer-paths'
import { scoreLead } from '@/lib/lead-scoring'
import { captureAttribution } from '@/lib/attribution'

interface Props {
  /** Pre-select a buyer segment (locks routing) — otherwise the visitor picks. */
  defaultBuyerType?: BuyerType
  /** Pre-fill product interest, e.g. 'Hand Tufted Carpet'. */
  defaultProduct?: string
  /** Which enquiry pipeline to submit to; defaults to the buyer path's type. */
  formType?: EnquiryFormType
  /** Analytics event on success; defaults to the buyer path's event. */
  successEvent?: LeadEventName
  /** Logical source for analytics, e.g. '/products'. */
  source?: string
  /** Submit button label. */
  submitLabel?: string
}

const BUYER_OPTIONS = BUYER_PATHS.map((p) => ({ value: p.id, label: p.buyer }))
const TIMELINES = ['Immediate', 'Within 1 month', '1–3 months', '3–6 months', 'Just researching']

const inputCls =
  'w-full px-4 py-3 text-[15px] rounded-sm border bg-white/70 outline-none transition-colors focus:border-[var(--c)]'
const labelCls = 'block text-[13px] font-medium mb-1.5'

export default function QualificationForm({
  defaultBuyerType,
  defaultProduct,
  formType,
  successEvent,
  source,
  submitLabel = 'Send Enquiry',
}: Props) {
  const [buyerType, setBuyerType] = useState<BuyerType>(defaultBuyerType ?? 'importer')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [error, setError] = useState('')
  const [honeypot, setHoneypot] = useState('')

  const path = BUYER_PATHS.find((p) => p.id === buyerType)
  const resolvedFormType: EnquiryFormType = formType ?? path?.formType ?? 'inquiry'
  const resolvedEvent = successEvent ?? path?.event ?? LEAD_EVENTS.formSubmitSuccess

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (!consent) {
      setError('Please accept the privacy consent to continue.')
      return
    }
    const form = e.currentTarget
    const data = new FormData(form)
    const val = (k: string) => String(data.get(k) ?? '').trim()

    const fields: Record<string, string> = {
      fullName: val('fullName'),
      companyName: val('companyName'),
      companyWebsite: val('companyWebsite'),
      email: val('email'),
      whatsapp: val('whatsapp'),
      country: val('country'),
      buyerType: BUYER_OPTIONS.find((o) => o.value === buyerType)?.label ?? buyerType,
      productInterest: val('productInterest'),
      quantity: val('quantity'),
      destination: val('destination'),
      timeline: val('timeline'),
      message: val('message'),
      intent: path?.intent ?? 'General enquiry',
      consent: 'Yes — agreed to Privacy Policy',
      sourcePage: source ?? '',
      // Silent conversion attribution — read-only, merged into the CRM payload.
      ...captureAttribution(),
    }

    setStatus('sending')
    const result = await submitEnquiry(resolvedFormType, fields, honeypot)
    if (result.ok) {
      setStatus('ok')
      const { tier, score } = scoreLead(fields)
      trackEvent(resolvedEvent, { buyer_type: buyerType, product: defaultProduct, source, destination: fields.destination, lead_tier: tier })
      trackEvent(LEAD_EVENTS.formSubmitSuccess, { buyer_type: buyerType, source, form_type: resolvedFormType, lead_tier: tier, lead_score: score })
      form.reset()
      setConsent(false)
    } else {
      setStatus('error')
      setError(result.error)
    }
  }

  if (status === 'ok') {
    return (
      <div className="rounded-sm border p-6 text-[15px]" style={{ borderColor: 'var(--bd)', color: 'var(--ink)' }}>
        <p className="font-medium mb-1">Thank you — your enquiry has been received.</p>
        <p style={{ color: 'var(--inkm)' }}>Our team will respond by email or WhatsApp. For anything urgent, message us directly.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4 max-sm:grid-cols-1" noValidate>
      {/* Honeypot — visually hidden, off the tab order; bots fill it, humans don't */}
      <div aria-hidden className="hidden">
        <label>Website
          <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </label>
      </div>

      <Field label="Full name*"><input name="fullName" required className={inputCls} style={borderStyle} /></Field>
      <Field label="Business email*"><input name="email" type="email" required className={inputCls} style={borderStyle} /></Field>
      <Field label="Company name"><input name="companyName" className={inputCls} style={borderStyle} /></Field>
      <Field label="Company website"><input name="companyWebsite" placeholder="https://" className={inputCls} style={borderStyle} /></Field>
      <Field label="Country*"><input name="country" required className={inputCls} style={borderStyle} /></Field>
      <Field label="WhatsApp (optional)"><input name="whatsapp" className={inputCls} style={borderStyle} /></Field>

      <Field label="Buyer type*">
        <select value={buyerType} onChange={(e) => setBuyerType(e.target.value as BuyerType)} className={inputCls} style={borderStyle}>
          {BUYER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>
      <Field label="Product interest">
        <input name="productInterest" defaultValue={defaultProduct} placeholder="e.g. Hand Tufted Carpet" className={inputCls} style={borderStyle} />
      </Field>

      <Field label="Quantity / project size"><input name="quantity" placeholder="e.g. 500 sqm, 20 rooms, 1 container" className={inputCls} style={borderStyle} /></Field>
      <Field label="Destination country / port"><input name="destination" placeholder="e.g. Hamburg, DE" className={inputCls} style={borderStyle} /></Field>

      <Field label="Timeline">
        <select name="timeline" className={inputCls} style={borderStyle} defaultValue="">
          <option value="" disabled>Select…</option>
          {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>

      <div className="col-span-2 max-sm:col-span-1">
        <label className={labelCls} style={{ color: 'var(--inks)' }}>Message / specifications</label>
        <textarea name="message" rows={4} placeholder="Sizes, colours, construction, deadlines, references…" className={inputCls} style={borderStyle} />
      </div>

      <label className="col-span-2 max-sm:col-span-1 flex items-start gap-2.5 text-[13px]" style={{ color: 'var(--inkm)' }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        <span>
          I agree that Tapis Global International may contact me about this enquiry and store these details per the{' '}
          <Link href="/privacy-policy" className="underline" style={{ color: 'var(--c)' }}>Privacy Policy</Link>.
        </span>
      </label>

      {error && <p className="col-span-2 max-sm:col-span-1 text-[13px]" style={{ color: '#b91c1c' }}>{error}</p>}

      <div className="col-span-2 max-sm:col-span-1">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="px-9 py-3.5 text-[15px] tracking-[0.16em] uppercase font-semibold rounded-sm transition-all duration-300 hover:brightness-110 disabled:opacity-60"
          style={{ background: 'var(--g)', color: 'var(--ink)' }}
        >
          {status === 'sending' ? 'Sending…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

const borderStyle = { borderColor: 'var(--bd)', color: 'var(--ink)' } as const

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls} style={{ color: 'var(--inks)' }}>{label}</label>
      {children}
    </div>
  )
}
