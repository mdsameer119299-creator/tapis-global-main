'use client'

import { useState } from 'react'
import { SITE } from '@/lib/data'
import {
  INQUIRY_LEGALS,
  BUYER_TYPES,
  ORDER_SIZES,
  INQUIRY_PRODUCTS,
} from '@/lib/home'
import { Reveal, Eyebrow } from '@/components/ui'

type InquiryForm = {
  company:  string
  name:     string
  email:    string
  country:  string
  buyer:    string
  product:  string
  quantity: string
  message:  string
}

const INITIAL: InquiryForm = {
  company: '', name: '', email: '', country: '',
  buyer: '', product: '', quantity: '', message: '',
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block text-[9.5px] tracking-[0.2em] uppercase mb-1.5 font-medium"
      style={{ color: 'var(--gd)' }}
    >
      {children}
    </label>
  )
}

const inputCls =
  'w-full bg-[rgba(255,255,255,0.06)] border px-3.5 py-3 text-[13.5px] font-light outline-none transition-colors duration-200 focus:border-[rgba(192,155,74,0.45)] placeholder:text-[rgba(255,255,255,0.22)]'
const inputStyle = {
  borderColor: 'rgba(255,255,255,0.1)',
  color:       'rgba(255,255,255,0.85)',
}

export default function Inquiry() {
  const [form, setForm]       = useState<InquiryForm>(INITIAL)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section
      id="contact"
      className="grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden"
      style={{ background: 'var(--ink)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 60% at 14% 50%, rgba(107,31,31,0.38) 0%, transparent 70%)' }}
      />

      {/* Left — B2B pitch */}
      <div className="px-5 sm:px-6 lg:px-10 py-14 sm:py-16 lg:py-20 flex flex-col justify-center relative z-[1]">
        <Reveal direction="left">
          <Eyebrow white>Project Enquiry</Eyebrow>
          <h2
            className="font-normal leading-[1.1] mb-5"
            style={{
              fontFamily: '"Cormorant Garamond",serif',
              fontSize:   'clamp(32px,3.2vw,50px)',
              color:      '#fff',
            }}
          >
            Ready to Specify
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}>Your Next Floor?</em>
          </h2>
          <p
            className="text-[15.5px] font-light leading-[1.85] mb-9"
            style={{ color: 'rgba(255,255,255,0.42)' }}
          >
            Share your project brief, specifications and timeline. Our team responds within 12 working hours — with sampling guidance, production feasibility and a tailored quotation for India or international delivery.
          </p>

          <div className="flex flex-col gap-[18px] mb-8">
            {[
              {
                label: 'Email',
                value: SITE.email,
                icon: (
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                ),
              },
              {
                label: 'Phone / WhatsApp',
                value: SITE.phone,
                icon: (
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.07 1.18 2 2 0 012 .01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14z" />
                ),
              },
              {
                label: 'Factory',
                value: 'Industrial Estate, Bhadohi – 221401, U.P., India',
                icon: (
                  <>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </>
                ),
              },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-start gap-3">
                <svg
                  className="flex-shrink-0 mt-0.5"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="var(--g)"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  {icon}
                </svg>
                <div>
                  <span
                    className="block text-[9.5px] tracking-[0.2em] uppercase mb-0.5"
                    style={{ color: 'var(--gd)' }}
                  >
                    {label}
                  </span>
                  <span className="text-[13.5px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {INQUIRY_LEGALS.map((lp) => (
              <span
                key={lp}
                className="text-[10px] tracking-[0.08em] px-2.5 py-1 border"
                style={{
                  borderColor: 'rgba(255,255,255,0.1)',
                  color:       'rgba(255,255,255,0.28)',
                }}
              >
                {lp}
              </span>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Right — form */}
      <div className="px-5 sm:px-6 lg:px-10 py-14 sm:py-16 lg:py-20 lg:pr-12 lg:pl-14 relative z-[1]">
        <Reveal direction="right" delay={120}>
          <div
            className="p-5 sm:p-8 lg:p-10"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border:       '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h3
              className="text-[11px] tracking-[0.22em] uppercase font-semibold mb-7 pb-4"
              style={{ color: 'var(--gl)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
            >
              Request a Project Quote
            </h3>

            {submitted ? (
              <div className="py-12 text-center">
                <p
                  className="font-normal mb-3"
                  style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 28, color: 'var(--gp)' }}
                >
                  Inquiry Received
                </p>
                <p className="text-[14px] font-light" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Our team will respond within 12 working hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Company *</FieldLabel>
                    <input name="company" required value={form.company} onChange={handleChange} placeholder="Your company" className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <FieldLabel>Contact Name *</FieldLabel>
                    <input name="name" required value={form.name} onChange={handleChange} placeholder="Your name" className={inputCls} style={inputStyle} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Email *</FieldLabel>
                    <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@company.com" className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <FieldLabel>Country *</FieldLabel>
                    <input name="country" required value={form.country} onChange={handleChange} placeholder="Country" className={inputCls} style={inputStyle} />
                  </div>
                </div>

                <div>
                  <FieldLabel>Buyer Type</FieldLabel>
                  <select name="buyer" value={form.buyer} onChange={handleChange} className={`${inputCls} appearance-none cursor-pointer`} style={inputStyle}>
                    <option value="">Select buyer type</option>
                    {BUYER_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Product Category</FieldLabel>
                    <select name="product" value={form.product} onChange={handleChange} className={`${inputCls} appearance-none cursor-pointer`} style={inputStyle}>
                      <option value="">Product type</option>
                      {INQUIRY_PRODUCTS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Order Size</FieldLabel>
                    <select name="quantity" value={form.quantity} onChange={handleChange} className={`${inputCls} appearance-none cursor-pointer`} style={inputStyle}>
                      <option value="">Quantity range</option>
                      {ORDER_SIZES.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <FieldLabel>Specifications / Message</FieldLabel>
                  <textarea
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Sizes, materials, colours, application (hotel/office/residential), location, timeline…"
                    className={`${inputCls} resize-y min-h-[100px]`}
                    style={inputStyle}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 text-[11.5px] tracking-[0.2em] uppercase font-bold transition-all duration-250 hover:opacity-90 mt-1"
                  style={{ background: 'var(--g)', color: 'var(--ink)' }}
                >
                  Submit Enquiry →
                </button>
                <p className="text-[11.5px] font-light leading-relaxed text-center" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  Response within 12 working hours. Your data is strictly confidential and never shared with third parties.
                </p>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
