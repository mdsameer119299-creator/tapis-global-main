'use client'

import { useState, useRef, useCallback } from 'react'
import { SITE } from '@/lib/data'
import { submitEnquiryWithFile } from '@/lib/submit-enquiry'
import { Reveal, Eyebrow } from '@/components/ui'

type FormState = {
  name:     string
  mobile:   string
  email:    string
  company:  string
  location: string
  size:     string
  message:  string
}

const INITIAL: FormState = {
  name: '', mobile: '', email: '', company: '',
  location: '', size: '', message: '',
}

function FloatField({
  id,
  label,
  name,
  type = 'text',
  value,
  onChange,
  optional,
}: {
  id:       string
  label:    string
  name:     keyof FormState
  type?:    string
  value:    string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  optional?: boolean
}) {
  const filled = value.length > 0
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer w-full bg-transparent border rounded-md px-4 pt-6 pb-2.5 text-[16px] font-light outline-none transition-all duration-300 focus:border-[rgba(212,181,116,0.55)] focus:shadow-[0_0_0_3px_rgba(192,155,74,0.08)]"
        style={{
          borderColor: 'rgba(255,255,255,0.12)',
          color: 'rgba(248,244,238,0.9)',
        }}
      />
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-300 pointer-events-none ${
          filled
            ? 'top-2 text-[14px] tracking-[0.18em] uppercase'
            : 'top-4 text-[15px] peer-focus:top-2 peer-focus:text-[14px] peer-focus:tracking-[0.18em] peer-focus:uppercase'
        }`}
        style={{ color: filled ? 'var(--gp)' : 'rgba(248,244,238,0.4)' }}
      >
        {label}{optional ? ' (Optional)' : ''}
      </label>
    </div>
  )
}

export default function CustomForm() {
  const [form, setForm]         = useState<FormState>(INITIAL)
  const [file, setFile]         = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFile = useCallback((f: File | null) => {
    if (f && f.size <= 10 * 1024 * 1024) setFile(f)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0] ?? null)
  }, [handleFile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = await submitEnquiryWithFile(
      'custom',
      {
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        company: form.company,
        location: form.location,
        size: form.size,
        message: form.message,
        attachment: file ? file.name : '',
      },
      file,
    )
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSubmitted(true)
  }

  return (
    <section
      id="custom-form"
      className="relative px-12 max-lg:px-6 py-20 lg:py-28 overflow-hidden scroll-mt-24"
      style={{ background: 'linear-gradient(165deg, #12100d 0%, #0a0806 50%, #151210 100%)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(192,155,74,0.08) 0%, transparent 60%)' }}
      />

      <div className="max-w-3xl mx-auto relative">
        <Reveal>
          <div className="text-center mb-12">
            <Eyebrow white>Start Your Project</Eyebrow>
            <h2
              className="font-medium leading-[1.06] mb-4"
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 'clamp(32px, 3.5vw, 48px)',
                color: '#fff',
              }}
            >
              Share Your
              <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}> Custom Brief</em>
            </h2>
            <p className="text-[17px] font-light leading-[1.85]" style={{ color: 'rgba(248,244,238,0.45)' }}>
              Complete the form below — attach your design reference and our project team responds within 12 hours.
            </p>
          </div>
        </Reveal>

        {submitted ? (
          <Reveal>
            <div
              className="text-center rounded-xl px-8 py-16"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(192,155,74,0.25)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <p
                className="font-display text-[32px] mb-4"
                style={{ fontFamily: '"Cormorant Garamond", serif', color: 'var(--gp)' }}
              >
                Requirement Received
              </p>
              <p className="text-[17px] font-light" style={{ color: 'rgba(248,244,238,0.55)' }}>
                Thank you, {form.name || 'there'}. Our custom design team will review your brief and contact you at{' '}
                {form.email || SITE.email} shortly.
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal delay={80}>
            <form
              onSubmit={handleSubmit}
              className="rounded-xl p-8 lg:p-10 space-y-5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(192,155,74,0.18)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
              }}
            >
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="absolute opacity-0 pointer-events-none h-0 w-0" aria-hidden />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FloatField id="c-name" label="Full Name" name="name" value={form.name} onChange={handleChange} />
                <FloatField id="c-mobile" label="Mobile Number" name="mobile" type="tel" value={form.mobile} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FloatField id="c-email" label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} />
                <FloatField id="c-company" label="Company Name" name="company" value={form.company} onChange={handleChange} optional />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FloatField id="c-location" label="Location / Country" name="location" value={form.location} onChange={handleChange} />
                <FloatField id="c-size" label="Carpet Size Requirement" name="size" value={form.size} onChange={handleChange} />
              </div>

              {/* Drag & drop upload */}
              <div>
                <p className="text-[14px] tracking-[0.2em] uppercase mb-2 font-medium" style={{ color: 'var(--gp)' }}>
                  Upload Your Design / Reference File
                </p>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                  className="relative rounded-md border-2 border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center py-10 px-6"
                  style={{
                    borderColor: dragging ? 'rgba(212,181,116,0.6)' : 'rgba(255,255,255,0.12)',
                    background: dragging ? 'rgba(192,155,74,0.06)' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*,.pdf,.ai,.eps,.svg,.dwg"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                  />
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(212,181,116,0.6)" strokeWidth="1.2" className="mb-3">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {file ? (
                    <p className="text-[15px]" style={{ color: 'var(--gp)' }}>{file.name}</p>
                  ) : (
                    <>
                      <p className="text-[15px] font-light mb-1" style={{ color: 'rgba(248,244,238,0.55)' }}>
                        Drag & drop or click to upload
                      </p>
                      <p className="text-[15px]" style={{ color: 'rgba(248,244,238,0.28)' }}>
                        JPG, PNG, PDF, AI, EPS — max 10 MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  id="c-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe your preferred design, colors, material, size, texture, pattern, logo requirement, or inspiration."
                  className="w-full bg-transparent border rounded-md px-4 py-4 text-[16px] font-light outline-none transition-all duration-300 resize-none focus:border-[rgba(212,181,116,0.55)] focus:shadow-[0_0_0_3px_rgba(192,155,74,0.08)] placeholder:text-[rgba(248,244,238,0.25)]"
                  style={{
                    borderColor: 'rgba(255,255,255,0.12)',
                    color: 'rgba(248,244,238,0.9)',
                  }}
                />
              </div>

              {error && (
                <p className="text-[15px] font-light text-center" style={{ color: 'rgba(220,120,120,0.9)' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 text-[15px] tracking-[0.22em] uppercase font-semibold rounded-md transition-all duration-400 disabled:opacity-60 hover:brightness-110 hover:tracking-[0.26em]"
                style={{
                  background: submitting
                    ? 'rgba(192,155,74,0.5)'
                    : 'linear-gradient(135deg, var(--g) 0%, #a8843a 100%)',
                  color: 'var(--ink)',
                  boxShadow: '0 8px 28px rgba(192,155,74,0.2)',
                }}
              >
                {submitting ? 'Sending…' : 'Send Custom Requirement'}
              </button>
            </form>
          </Reveal>
        )}
      </div>
    </section>
  )
}
