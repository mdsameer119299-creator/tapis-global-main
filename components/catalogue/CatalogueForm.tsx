'use client'

import { useState } from 'react'
import { BUYER_TYPES, CATALOGUE_SUCCESS } from '@/lib/catalogue'
import { submitEnquiry } from '@/lib/submit-enquiry'
import { Reveal } from '@/components/ui'

type FormState = {
  name:      string
  mobile:    string
  email:     string
  company:   string
  buyerType: string
}

const INITIAL: FormState = {
  name: '', mobile: '', email: '', company: '', buyerType: '',
}

const FIELD_ICONS: Record<string, React.ReactNode> = {
  name: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  mobile: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 01.07 3.33 2 2 0 012 .01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.54a16 16 0 005.55 5.55l.92-.92a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14z" strokeLinecap="round" />
    </svg>
  ),
  email: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" /><path d="M22 6l-10 7L2 6" strokeLinecap="round" />
    </svg>
  ),
  company: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" strokeLinecap="round" />
    </svg>
  ),
  buyerType: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" /><circle cx="9" cy="7" r="4" strokeLinecap="round" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" />
    </svg>
  ),
}

type FloatProps = {
  id:       string
  label:    string
  name:     keyof FormState
  iconKey:  string
  type?:    string
  value:    string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  optional?: boolean
  error?:   string
}

function FloatField({ id, label, name, iconKey, type = 'text', value, onChange, optional, error }: FloatProps) {
  const filled = value.length > 0
  return (
    <div>
      <div className="relative">
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 z-[1] pointer-events-none transition-colors duration-300"
          style={{ color: filled ? 'var(--gp)' : 'rgba(248,244,238,0.28)' }}
        >
          {FIELD_ICONS[iconKey]}
        </span>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder=" "
          className="peer w-full bg-transparent border rounded-md pl-11 pr-4 pt-6 pb-2.5 text-[14px] font-light outline-none transition-all duration-300 focus:border-[rgba(212,181,116,0.55)] focus:shadow-[0_0_0_3px_rgba(192,155,74,0.08)]"
          style={{
            borderColor: error ? 'rgba(180,60,60,0.6)' : 'rgba(255,255,255,0.12)',
            color: 'rgba(248,244,238,0.9)',
          }}
        />
        <label
          htmlFor={id}
          className={`absolute left-11 transition-all duration-300 pointer-events-none ${
            filled
              ? 'top-2 text-[9px] tracking-[0.18em] uppercase'
              : 'top-4 text-[13px] peer-focus:top-2 peer-focus:text-[9px] peer-focus:tracking-[0.18em] peer-focus:uppercase'
          }`}
          style={{ color: error ? 'rgba(220,120,120,0.9)' : filled ? 'var(--gp)' : 'rgba(248,244,238,0.4)' }}
        >
          {label}{optional ? ' (Optional)' : ''}
        </label>
      </div>
      {error && <p className="text-[11px] mt-1.5 pl-1" style={{ color: 'rgba(220,120,120,0.85)' }}>{error}</p>}
    </div>
  )
}

function validate(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {}
  if (!form.name.trim()) errors.name = 'Full name is required'
  if (!form.mobile.trim()) errors.mobile = 'Mobile number is required'
  else if (!/^[\d\s+\-()]{7,18}$/.test(form.mobile.trim())) errors.mobile = 'Enter a valid mobile number'
  if (!form.email.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address'
  if (!form.buyerType) errors.buyerType = 'Please select your profile'
  return errors
}

export default function CatalogueForm() {
  const [form, setForm]           = useState<FormState>(INITIAL)
  const [errors, setErrors]       = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors = validate(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    setSubmitError(null)
    setSubmitting(true)
    const result = await submitEnquiry('catalogue', {
      name: form.name,
      mobile: form.mobile,
      email: form.email,
      company: form.company,
      buyerType: form.buyerType,
    })
    setSubmitting(false)
    if (!result.ok) {
      setSubmitError(result.error)
      return
    }
    setSubmitted(true)
  }

  return (
    <section
      id="catalogue-form"
      className="relative px-12 max-lg:px-6 py-16 lg:py-20 scroll-mt-24"
      style={{ background: 'linear-gradient(165deg, #12100d 0%, #0a0806 50%, #151210 100%)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 0%, rgba(192,155,74,0.07) 0%, transparent 60%)' }}
      />

      <div className="max-w-xl mx-auto relative">
        {submitted ? (
          <Reveal>
            <div
              className="text-center rounded-xl px-8 py-14 catalogue-success-in"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(192,155,74,0.28)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
              }}
            >
              <div
                className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center catalogue-check-in"
                style={{ background: 'rgba(192,155,74,0.15)', border: '1px solid rgba(192,155,74,0.4)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gp)" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" className="catalogue-check-path" />
                </svg>
              </div>
              <h2
                className="font-display text-[28px] mb-4"
                style={{ fontFamily: '"Cormorant Garamond", serif', color: 'var(--gp)' }}
              >
                {CATALOGUE_SUCCESS.title}
              </h2>
              <p className="text-[15px] font-light leading-[1.85] mb-2" style={{ color: 'rgba(248,244,238,0.58)' }}>
                {CATALOGUE_SUCCESS.message}
              </p>
              <p className="text-[14px] font-light" style={{ color: 'rgba(248,244,238,0.42)' }}>
                {CATALOGUE_SUCCESS.subline}
              </p>
              <p className="text-[13px] mt-5 pt-5" style={{ color: 'rgba(248,244,238,0.3)', borderTop: '1px solid rgba(192,155,74,0.15)' }}>
                Delivery address: <span style={{ color: 'var(--gl)' }}>{form.email}</span>
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-xl p-8 lg:p-10 space-y-5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(192,155,74,0.18)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
              }}
            >
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="absolute opacity-0 pointer-events-none h-0 w-0" aria-hidden />
              <p className="text-[10px] tracking-[0.28em] uppercase text-center mb-2 font-medium" style={{ color: 'var(--gp)' }}>
                Complete to Receive Catalogue
              </p>

              <FloatField id="cat-name" label="Full Name" name="name" iconKey="name" value={form.name} onChange={handleChange} error={errors.name} />
              <FloatField id="cat-mobile" label="Mobile Number" name="mobile" iconKey="mobile" type="tel" value={form.mobile} onChange={handleChange} error={errors.mobile} />
              <FloatField id="cat-email" label="Email Address" name="email" iconKey="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
              <FloatField id="cat-company" label="Company Name" name="company" iconKey="company" value={form.company} onChange={handleChange} optional />

              <div>
                <div className="relative">
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-[1] pointer-events-none"
                    style={{ color: form.buyerType ? 'var(--gp)' : 'rgba(248,244,238,0.28)' }}
                  >
                    {FIELD_ICONS.buyerType}
                  </span>
                  <select
                    id="cat-buyer"
                    name="buyerType"
                    value={form.buyerType}
                    onChange={handleChange}
                    className="peer w-full bg-transparent border rounded-md pl-11 pr-10 pt-6 pb-2.5 text-[14px] font-light outline-none transition-all duration-300 appearance-none cursor-pointer focus:border-[rgba(212,181,116,0.55)]"
                    style={{
                      borderColor: errors.buyerType ? 'rgba(180,60,60,0.6)' : 'rgba(255,255,255,0.12)',
                      color: form.buyerType ? 'rgba(248,244,238,0.9)' : 'rgba(248,244,238,0.35)',
                    }}
                  >
                    <option value="" disabled hidden>Select profile</option>
                    {BUYER_TYPES.map((t) => (
                      <option key={t} value={t} style={{ background: '#12100d', color: '#fff' }}>{t}</option>
                    ))}
                  </select>
                  <label
                    htmlFor="cat-buyer"
                    className="absolute left-11 top-2 text-[9px] tracking-[0.18em] uppercase pointer-events-none"
                    style={{ color: errors.buyerType ? 'rgba(220,120,120,0.9)' : 'var(--gp)' }}
                  >
                    What best describes you?
                  </label>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]" style={{ color: 'rgba(248,244,238,0.3)' }}>▾</span>
                </div>
                {errors.buyerType && (
                  <p className="text-[11px] mt-1.5 pl-1" style={{ color: 'rgba(220,120,120,0.85)' }}>{errors.buyerType}</p>
                )}
              </div>

              {submitError && (
                <p className="text-[13px] font-light text-center" style={{ color: 'rgba(220,120,120,0.9)' }}>
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 mt-2 flex items-center justify-center gap-3 text-[11px] tracking-[0.22em] uppercase font-semibold rounded-md transition-all duration-400 disabled:opacity-70 hover:brightness-110 hover:tracking-[0.26em]"
                style={{
                  background: submitting
                    ? 'rgba(192,155,74,0.45)'
                    : 'linear-gradient(135deg, var(--g) 0%, #a8843a 100%)',
                  color: 'var(--ink)',
                  boxShadow: '0 8px 28px rgba(192,155,74,0.22)',
                }}
              >
                {submitting && (
                  <span
                    className="w-4 h-4 rounded-full border-2 border-[var(--ink)] border-t-transparent animate-spin flex-shrink-0"
                    aria-hidden="true"
                  />
                )}
                {submitting ? 'Processing…' : 'Get Catalogue'}
              </button>

              <p className="text-[11px] text-center pt-1 font-light" style={{ color: 'rgba(248,244,238,0.28)' }}>
                Your details are kept confidential. Catalogue delivered within 24 hours.
              </p>
            </form>
          </Reveal>
        )}
      </div>
    </section>
  )
}
