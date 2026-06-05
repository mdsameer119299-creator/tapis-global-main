'use client'

import { useState, useRef, useCallback } from 'react'
import { SITE } from '@/lib/data'
import { ENQUIRY_TRUST_INDICATORS, ENQUIRY_SUBMIT_ERROR } from '@/lib/enquiry-form'
import {
  type EnquiryFieldErrors,
  validateFullName,
  validateMessage,
  validateContactChannel,
  hasEnquiryFieldErrors,
} from '@/lib/enquiry-validation'
import { INQUIRY_LEGALS } from '@/lib/home'
import { submitEnquiryWithFile } from '@/lib/submit-enquiry'
import EnquirySuccessModal from '@/components/enquiry/EnquirySuccessModal'
import EnquiryAttachmentField from '@/components/enquiry/EnquiryAttachmentField'
import EnquiryTextField from '@/components/enquiry/EnquiryTextField'
import { Reveal, Eyebrow } from '@/components/ui'

type InquiryForm = {
  fullName: string
  mobile:   string
  email:    string
  location: string
  message:  string
}

type FieldKey = keyof EnquiryFieldErrors

const INITIAL: InquiryForm = {
  fullName: '',
  mobile: '',
  email: '',
  location: '',
  message: '',
}

const CLIENT_MIN_SUBMIT_MS = 30_000

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export default function Inquiry() {
  const [form, setForm]               = useState<InquiryForm>(INITIAL)
  const [file, setFile]               = useState<File | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [formError, setFormError]     = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<EnquiryFieldErrors>({})
  const [touched, setTouched]         = useState<Partial<Record<FieldKey, boolean>>>({})

  const fileInputKey = useRef(0)
  const lastSubmitAt = useRef(0)
  const fieldRefs = useRef<Partial<Record<FieldKey, HTMLInputElement | HTMLTextAreaElement | null>>>({})

  const validateField = useCallback((key: FieldKey, values: InquiryForm): string | null => {
    switch (key) {
      case 'fullName': return validateFullName(values.fullName)
      case 'message':  return validateMessage(values.message)
      case 'mobile':
      case 'email': {
        const contact = validateContactChannel(values.email, values.mobile)
        return contact[key] ?? null
      }
      default: return null
    }
  }, [])

  const runValidation = useCallback(
    (values: InquiryForm, touchAll = false): EnquiryFieldErrors => {
      const errors: EnquiryFieldErrors = {}
      const nameErr = validateFullName(values.fullName)
      if (nameErr) errors.fullName = nameErr

      const contact = validateContactChannel(values.email, values.mobile)
      if (contact.email) errors.email = contact.email
      if (contact.mobile) errors.mobile = contact.mobile

      const messageErr = validateMessage(values.message)
      if (messageErr) errors.message = messageErr

      if (touchAll) {
        setTouched({ fullName: true, mobile: true, email: true, message: true })
      }

      setFieldErrors(errors)
      return errors
    },
    [validateField],
  )

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    let nextValue = value

    if (name === 'fullName') {
      nextValue = value.replace(/\s{2,}/g, ' ')
    }

    const next = { ...form, [name]: nextValue }
    setForm(next)
    setFormError(null)

    const key = name as FieldKey
    if (touched[key]) {
      const err = validateField(key, next)
      setFieldErrors((prev) => {
        const updated = { ...prev }
        if (err) updated[key] = err
        else delete updated[key]
        return updated
      })
    }
  }

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const key = e.target.name as FieldKey
    if (key === 'fullName') {
      setForm((prev) => ({ ...prev, fullName: normalizeName(prev.fullName) }))
    }
    setTouched((prev) => ({ ...prev, [key]: true }))
    const err = validateField(key, {
      ...form,
      fullName: key === 'fullName' ? normalizeName(form.fullName) : form.fullName,
    })
    setFieldErrors((prev) => {
      const updated = { ...prev }
      if (err) updated[key] = err
      else delete updated[key]
      return updated
    })
  }

  const focusFirstInvalid = (errors: EnquiryFieldErrors) => {
    const order: FieldKey[] = ['fullName', 'mobile', 'email', 'message']
    const first = order.find((k) => errors[k])
    if (!first) return
    const el = fieldRefs.current[first]
    if (el) {
      el.focus()
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const resetForm = () => {
    setForm(INITIAL)
    setFile(null)
    setFieldErrors({})
    setTouched({})
    setFormError(null)
    fileInputKey.current += 1
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const now = Date.now()
    if (now - lastSubmitAt.current < CLIENT_MIN_SUBMIT_MS) {
      setFormError('Please wait a moment before submitting again.')
      return
    }

    const normalized = {
      ...form,
      fullName: normalizeName(form.fullName),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      location: form.location.trim(),
      message: form.message.trim(),
    }

    setForm(normalized)
    const errors = runValidation(normalized, true)
    if (hasEnquiryFieldErrors(errors)) {
      focusFirstInvalid(errors)
      return
    }

    setSubmitting(true)
    lastSubmitAt.current = now

    const result = await submitEnquiryWithFile(
      'inquiry',
      {
        fullName: normalized.fullName,
        contactPerson: normalized.fullName,
        mobile: normalized.mobile,
        email: normalized.email,
        location: normalized.location,
        message: normalized.message,
        attachment: file ? file.name : '',
      },
      file,
    )

    setSubmitting(false)

    if (!result.ok) {
      setFormError(result.error ?? ENQUIRY_SUBMIT_ERROR)
      return
    }

    resetForm()
    setShowSuccess(true)
  }

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

        <div className="px-5 sm:px-6 lg:px-10 py-12 sm:py-16 lg:py-20 flex flex-col justify-center relative z-[1] min-w-0">
          <Reveal direction="left">
            <Eyebrow white>Project Enquiry</Eyebrow>
            <h2
              className="font-normal leading-[1.08] mb-5"
              style={{
                fontFamily: '"Cormorant Garamond",serif',
                fontSize:   'clamp(30px,3vw,46px)',
                color:      '#fff',
              }}
            >
              Begin Your
              <br />
              <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}>Design Consultation</em>
            </h2>
            <p
              className="text-[17px] font-light leading-[1.8] max-w-[52ch] mb-8"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Share your vision — our consultants respond within 12 working hours with guidance tailored to your project.
            </p>

            <div className="flex flex-col gap-4 mb-7">
              <InquiryContactBlock label="Phone / WhatsApp" icon="phone">
                <a href={`tel:${SITE.phoneTel}`} className="hover:text-[var(--gp)] transition-colors">{SITE.phone}</a>
              </InquiryContactBlock>
              <InquiryContactBlock label="Email" icon="mail">
                <a href={`mailto:${SITE.emails[0]?.address}`} className="hover:text-[var(--gp)] transition-colors">
                  {SITE.emails[0]?.address}
                </a>
              </InquiryContactBlock>
            </div>

            <div className="flex flex-wrap gap-2">
              {INQUIRY_LEGALS.slice(0, 2).map((lp) => (
                <span
                  key={lp}
                  className="text-[14px] tracking-[0.08em] px-2 py-1 border"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.22)' }}
                >
                  {lp}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="px-5 sm:px-6 lg:px-10 py-12 sm:py-16 lg:py-20 lg:pr-12 lg:pl-10 relative z-[1] flex items-center min-w-0">
          <Reveal direction="right" delay={100} className="w-full">
            <div
              className="p-6 sm:p-8 enquiry-form-panel w-full"
              style={{
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <p
                className="text-[15px] tracking-[0.26em] uppercase font-medium mb-5"
                style={{ color: 'var(--gl)' }}
              >
                Project Enquiry
              </p>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  hidden
                  defaultValue=""
                />

                <EnquiryTextField
                  ref={(el) => { fieldRefs.current.fullName = el }}
                  label="Full Name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Full Name"
                  autoComplete="name"
                  error={fieldErrors.fullName}
                  showError={touched.fullName}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <EnquiryTextField
                    ref={(el) => { fieldRefs.current.mobile = el }}
                    label="Mobile Number (email or mobile required)"
                    name="mobile"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.mobile}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="+91 XXX XXX XXXX"
                    error={fieldErrors.mobile}
                    showError={touched.mobile}
                  />
                  <EnquiryTextField
                    ref={(el) => { fieldRefs.current.email = el }}
                    label="Email Address (email or mobile required)"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="name@company.com"
                    error={fieldErrors.email}
                    showError={touched.email}
                  />
                </div>

                <EnquiryTextField
                  label="Location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="City, State, Country"
                  autoComplete="address-level2"
                />

                <EnquiryTextField
                  ref={(el) => { fieldRefs.current.message = el }}
                  label="Project Requirement / Message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Tell us about your project, dimensions, quantity, materials or design preferences..."
                  multiline
                  rows={3}
                  error={fieldErrors.message}
                  showError={touched.message}
                />

                <EnquiryAttachmentField key={fileInputKey.current} file={file} onFileChange={setFile} />

                <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-0.5">
                  {ENQUIRY_TRUST_INDICATORS.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-1.5 text-[15px] font-light tracking-wide"
                      style={{ color: 'rgba(255,255,255,0.38)' }}
                    >
                      <span style={{ color: 'var(--g)', fontSize: 14 }} aria-hidden>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>

                {formError && (
                  <p className="enquiry-form-error text-[17px] font-light text-center py-2 px-3 rounded-sm" role="alert">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 text-[15px] tracking-[0.22em] uppercase font-semibold transition-all duration-300 hover:brightness-110 hover:shadow-[0_6px_24px_rgba(192,155,74,0.2)] disabled:opacity-55 disabled:cursor-not-allowed min-h-[48px] mt-0.5"
                  style={{ background: 'linear-gradient(135deg, var(--g) 0%, #a8843a 100%)', color: 'var(--ink)' }}
                >
                  {submitting ? 'Sending…' : 'Request Consultation'}
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </section>
    </>
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
    <div className="flex items-start gap-2.5 min-w-0">
      <svg className="flex-shrink-0 mt-0.5" width="13" height="13" fill="none" stroke="var(--g)" strokeWidth="1.5" viewBox="0 0 24 24">
        {paths[icon]}
      </svg>
      <div className="text-[15px] font-light min-w-0 break-words" style={{ color: 'rgba(255,255,255,0.55)' }}>
        <span className="text-[14px] tracking-[0.2em] uppercase mr-2 block sm:inline" style={{ color: 'var(--gd)' }}>{label}</span>
        <span className="break-all sm:break-normal">{children}</span>
      </div>
    </div>
  )
}
