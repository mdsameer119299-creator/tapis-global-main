'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { SITE } from '@/lib/data'
import { ENQUIRY_SUBMIT_ERROR } from '@/lib/enquiry-form'
import { submitEnquiryWithFile } from '@/lib/submit-enquiry'
import EnquirySuccessModal from '@/components/enquiry/EnquirySuccessModal'
import { Reveal, Eyebrow } from '@/components/ui'

type InquiryForm = {
  fullName:    string
  companyName: string
  mobile:      string
  email:       string
  requirement: string
}

type SubmitIntent = 'catalogue' | 'quote'

const INITIAL: InquiryForm = {
  fullName:    '',
  companyName: '',
  mobile:      '',
  email:       '',
  requirement: '',
}

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

function validate(form: InquiryForm): Partial<Record<keyof InquiryForm, string>> {
  const errors: Partial<Record<keyof InquiryForm, string>> = {}
  if (!form.fullName.trim()) errors.fullName = 'Name is required'
  if (!form.mobile.trim() && !form.email.trim()) {
    errors.mobile = 'Phone or email required'
    errors.email  = 'Phone or email required'
  }
  if (!form.requirement.trim()) errors.requirement = 'Please describe your requirement'
  return errors
}

export default function Inquiry() {
  const [form, setForm]               = useState<InquiryForm>(INITIAL)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [submitIntent, setSubmitIntent] = useState<SubmitIntent>('catalogue')
  const [formError, setFormError]     = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof InquiryForm, string>>>({})
  const [touched, setTouched]         = useState<Partial<Record<keyof InquiryForm, boolean>>>({})
  const lastSubmitAt                  = useRef(0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const next = { ...form, [name]: value }
    setForm(next)
    setFormError(null)
    if (touched[name as keyof InquiryForm]) {
      const errs = validate(next)
      setFieldErrors((prev) => ({ ...prev, [name]: errs[name as keyof InquiryForm] ?? undefined }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const key = e.target.name as keyof InquiryForm
    if (key === 'fullName') setForm((p) => ({ ...p, fullName: normalizeName(p.fullName) }))
    setTouched((p) => ({ ...p, [key]: true }))
    const errs = validate({ ...form, fullName: key === 'fullName' ? normalizeName(form.fullName) : form.fullName })
    setFieldErrors((p) => ({ ...p, [key]: errs[key] }))
  }

  const handleSubmit = useCallback(async (intent: SubmitIntent) => {
    setFormError(null)
    setSubmitIntent(intent)

    const normalized = {
      ...form,
      fullName: normalizeName(form.fullName),
      email:    form.email.trim(),
      mobile:   form.mobile.trim(),
    }
    setForm(normalized)

    const errs = validate(normalized)
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      setTouched({ fullName: true, mobile: true, email: true, requirement: true })
      return
    }

    const now = Date.now()
    if (now - lastSubmitAt.current < 15_000) {
      setFormError('Please wait a moment before submitting again.')
      return
    }

    setSubmitting(true)
    lastSubmitAt.current = now

    const result = await submitEnquiryWithFile(
      intent === 'catalogue' ? 'catalogue' : 'inquiry',
      {
        fullName:      normalized.fullName,
        contactPerson: normalized.fullName,
        companyName:   normalized.companyName,
        mobile:        normalized.mobile,
        email:         normalized.email,
        message:       `[${intent === 'catalogue' ? 'Catalogue Request' : 'Quote Request'}] ${normalized.requirement}`,
        location:      '',
        attachment:    '',
      },
      null,
    )

    setSubmitting(false)

    if (!result.ok) {
      setFormError(result.error ?? ENQUIRY_SUBMIT_ERROR)
      return
    }

    setForm(INITIAL)
    setFieldErrors({})
    setTouched({})
    setShowSuccess(true)
  }, [form])

  return (
    <>
      <EnquirySuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      <section
        id="contact"
        className="grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden"
        style={{ background: 'var(--ink)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 50% 60% at 14% 50%, rgba(107,31,31,0.38) 0%, transparent 70%)' }}
        />

        {/* Left — brand messaging */}
        <div className="px-5 sm:px-8 lg:px-12 py-14 sm:py-18 lg:py-24 flex flex-col justify-center relative z-[1] min-w-0">
          <Reveal direction="left">
            <Eyebrow white>Handmade Carpet Manufacturer, Bhadohi</Eyebrow>
            <h2
              className="font-normal leading-[1.08] mb-5"
              style={{
                fontFamily: '"Cormorant Garamond",serif',
                fontSize:   'clamp(30px,3vw,48px)',
                color:      '#fff',
              }}
            >
              Request a Catalogue
              <br />
              <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}>or Get a Quote</em>
            </h2>
            <p
              className="text-[17px] font-light leading-[1.82] max-w-[48ch] mb-10"
              style={{ color: 'rgba(255,255,255,0.62)' }}
            >
              Serving hospitality, commercial and residential projects across India and international markets. Share your requirement — our team responds within 12 working hours.
            </p>

            <div className="flex flex-col gap-5 mb-8">
              <InquiryContactBlock label="Phone / WhatsApp" icon="phone">
                <a href={`tel:${SITE.phoneTel}`} className="hover:text-[var(--gp)] transition-colors">{SITE.phone}</a>
              </InquiryContactBlock>
              <InquiryContactBlock label="Email" icon="mail">
                <a href={`mailto:${SITE.emails[0]?.address}`} className="hover:text-[var(--gp)] transition-colors">
                  {SITE.emails[0]?.address}
                </a>
              </InquiryContactBlock>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                'Carpet Manufacturer & Supplier — Bhadohi, India',
                'Hand Tufted · Hand Knotted · Jute · Wall-to-Wall',
                'Pan India Projects & International Markets',
              ].map((item) => (
                <p
                  key={item}
                  className="flex items-center gap-2 text-[15px] font-light tracking-wide"
                  style={{ color: 'rgba(255,255,255,0.50)' }}
                >
                  <span style={{ color: 'var(--g)', fontSize: 12 }} aria-hidden>✦</span>
                  {item}
                </p>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Right — simplified form */}
        <div className="px-5 sm:px-8 lg:px-10 py-14 sm:py-18 lg:py-24 lg:pr-14 relative z-[1] flex items-center min-w-0">
          <Reveal direction="right" delay={100} className="w-full">
            <div
              className="p-7 sm:p-9 enquiry-form-panel w-full"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
              }}
            >
              <p
                className="text-[13px] tracking-[0.28em] uppercase font-medium mb-6"
                style={{ color: 'var(--gl)' }}
              >
                Get in Touch
              </p>

              <div className="flex flex-col gap-4">
                <Field
                  label="Full Name *"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Your full name"
                  autoComplete="name"
                  error={touched.fullName ? fieldErrors.fullName : undefined}
                />

                <Field
                  label="Company Name"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Company / Studio / Organisation"
                  autoComplete="organization"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Phone / WhatsApp *"
                    name="mobile"
                    type="tel"
                    inputMode="tel"
                    value={form.mobile}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="+91 XXXXX XXXXX"
                    autoComplete="tel"
                    error={touched.mobile ? fieldErrors.mobile : undefined}
                  />
                  <Field
                    label="Email Address"
                    name="email"
                    type="email"
                    inputMode="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="name@company.com"
                    autoComplete="email"
                    error={touched.email ? fieldErrors.email : undefined}
                  />
                </div>

                <Field
                  label="Your Requirement *"
                  name="requirement"
                  value={form.requirement}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Describe your project — product type, quantity, dimensions, materials or any design requirements..."
                  multiline
                  rows={4}
                  error={touched.requirement ? fieldErrors.requirement : undefined}
                />

                {formError && (
                  <p className="enquiry-form-error text-[15px] font-light text-center py-2 px-3 rounded-sm" role="alert">
                    {formError}
                  </p>
                )}

                {/* Dual CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 mt-1">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmit('catalogue')}
                    className="flex-1 py-4 text-[14px] tracking-[0.2em] uppercase font-semibold transition-all duration-300 hover:brightness-110 hover:shadow-[0_6px_24px_rgba(192,155,74,0.22)] disabled:opacity-55 disabled:cursor-not-allowed min-h-[52px]"
                    style={{ background: 'linear-gradient(135deg, var(--g) 0%, #a8843a 100%)', color: 'var(--ink)' }}
                  >
                    {submitting && submitIntent === 'catalogue' ? 'Sending…' : 'Request Catalogue'}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmit('quote')}
                    className="flex-1 py-4 text-[14px] tracking-[0.2em] uppercase font-medium border transition-all duration-300 disabled:opacity-55 disabled:cursor-not-allowed min-h-[52px]"
                    style={{ border: '1px solid rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.75)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(192,155,74,0.5)'
                      e.currentTarget.style.color = 'var(--gp)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
                    }}
                  >
                    {submitting && submitIntent === 'quote' ? 'Sending…' : 'Get Quote'}
                  </button>
                </div>

                <p className="text-[13px] font-light text-center mt-1" style={{ color: 'rgba(255,255,255,0.32)' }}>
                  Or{' '}
                  <Link href="/catalogue" className="underline underline-offset-2 hover:text-[var(--gl)] transition-colors">
                    browse our catalogue page
                  </Link>
                  {' '}for more options.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}

function Field({
  label, name, value, onChange, onBlur, placeholder,
  type = 'text', inputMode, autoComplete, error, multiline, rows,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  placeholder?: string
  type?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  autoComplete?: string
  error?: string
  multiline?: boolean
  rows?: number
}) {
  const base = `enquiry-field w-full bg-transparent border px-4 py-3 text-[16px] font-light text-white outline-none transition-all duration-200 ${error ? 'enquiry-field--invalid' : ''}`

  return (
    <div>
      <label className="block text-[13px] tracking-[0.16em] uppercase font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.42)' }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={rows ?? 4}
          className={base}
          style={{ resize: 'none' }}
        />
      ) : (
        <input
          name={name}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={base}
        />
      )}
      {error && (
        <p className="enquiry-field-error mt-1" role="alert">{error}</p>
      )}
    </div>
  )
}

function InquiryContactBlock({
  label,
  icon,
  children,
}: {
  label: string
  icon: 'phone' | 'mail'
  children: React.ReactNode
}) {
  const paths = {
    phone: (
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.07 1.18 2 2 0 012 .01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14z" />
    ),
    mail: (
      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    ),
  }

  return (
    <div className="flex items-start gap-3 min-w-0">
      <div
        className="flex-shrink-0 mt-0.5 flex items-center justify-center w-8 h-8 rounded-full border"
        style={{ borderColor: 'rgba(192,155,74,0.28)', background: 'rgba(192,155,74,0.06)', color: 'var(--g)' }}
      >
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          {paths[icon]}
        </svg>
      </div>
      <div className="text-[16px] font-light min-w-0 break-words" style={{ color: 'rgba(255,255,255,0.65)' }}>
        <span className="text-[13px] tracking-[0.22em] uppercase mr-2 block font-medium" style={{ color: 'var(--gl)' }}>{label}</span>
        <span className="break-all sm:break-normal">{children}</span>
      </div>
    </div>
  )
}
