'use client'
import { useState } from 'react'
import { SITE } from '@/lib/data'
import { submitEnquiry } from '@/lib/submit-enquiry'
import { validateContactChannel } from '@/lib/enquiry-validation'
import EnquirySuccessModal from '@/components/enquiry/EnquirySuccessModal'
import { Reveal, Eyebrow } from '@/components/ui'

type FormState = {
  name: string
  company: string
  email: string
  mobile: string
  country: string
  product: string
  quantity: string
  message: string
  agree: boolean
}

const PRODUCTS = [
  'Hand Tufted Carpets','Hand Knotted Carpets','Flat Weaves / Kilims',
  'Braided & Jute Rugs','Screen Printing','Digital Printing',
  'Home Furnishing','Wall to Wall Carpets','Cushions & Poufs','Other',
]

export default function Contact() {
  const [form, setForm] = useState<FormState>({
    name: '', company: '', email: '', mobile: '', country: '',
    product: '', quantity: '', message: '', agree: false,
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; mobile?: string }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.agree) { alert('Please agree to the Terms & Conditions.'); return }

    const contact = validateContactChannel(form.email, form.mobile)
    if (contact.email || contact.mobile) {
      setFieldErrors(contact)
      setError(contact.email ?? contact.mobile ?? 'Please enter a valid email or mobile number.')
      return
    }

    setError(null)
    setFieldErrors({})
    setSubmitting(true)
    const result = await submitEnquiry('contact', {
      name: form.name,
      company: form.company,
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      country: form.country,
      product: form.product,
      quantity: form.quantity,
      message: form.message,
      termsAccepted: form.agree ? 'Yes' : 'No',
    })
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setShowSuccess(true)
    setForm({
      name: '', company: '', email: '', mobile: '', country: '',
      product: '', quantity: '', message: '', agree: false,
    })
  }

  return (
    <>
      <EnquirySuccessModal open={showSuccess} onClose={() => setShowSuccess(false)} />
      <section
        id="contact"
        className="grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden"
        style={{ background: 'var(--ink)' }}
      >
      {/* Decorative radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 60% at 14% 50%, rgba(107,31,31,0.38) 0%, transparent 70%)' }}
      />

      {/* Left — info side */}
      <div className="px-5 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-20 flex flex-col justify-center relative z-[1]">
        <Reveal direction="left">
          <Eyebrow white>Get in Touch</Eyebrow>
          <h2
            className="font-normal leading-[1.1] mb-2"
            style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 44, color: '#fff' }}
          >
            Ready to <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}>Source?</em>
          </h2>
          <p className="text-[17px] font-light leading-[1.75] mb-9" style={{ color: 'rgba(255,255,255,0.42)' }}>
            Send us your project requirements — our team responds within 12 hours with pricing, sampling and lead time.
          </p>

          <div className="flex flex-col gap-[18px] mb-7">
            <ContactInfoRow label={SITE.corporateOffice.label} icon={<MapIcon />}>
              {SITE.corporateOffice.lines.map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </ContactInfoRow>
            <ContactInfoRow label={SITE.manufacturingFacility.label} icon={<MapIcon />}>
              {SITE.manufacturingFacility.lines.map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </ContactInfoRow>
            <ContactInfoRow label="Phone" icon={<PhoneIcon />}>
              <a href={`tel:${SITE.phoneTel}`} className="block hover:text-[var(--gp)] transition-colors">{SITE.phone}</a>
              <a href={`tel:${SITE.landlineTel}`} className="block hover:text-[var(--gp)] transition-colors">{SITE.landline}</a>
            </ContactInfoRow>
            <ContactInfoRow label="Email Us" icon={<MailIcon />}>
              {SITE.emails.map((item) => (
                <a
                  key={item.address}
                  href={`mailto:${item.address}`}
                  className="block hover:text-[var(--gp)] transition-colors"
                >
                  {item.address}
                </a>
              ))}
            </ContactInfoRow>
            <ContactInfoRow label="Hours" icon={<ClockIcon />}>
              Mon–Sat, 9 AM – 6 PM IST
            </ContactInfoRow>
          </div>

          {/* Certifications */}
          <div className="flex flex-wrap gap-2">
            {['ISO 9001:2015','OEKO-TEX','AZO-Free','GOTS Eligible'].map((cert) => (
              <span
                key={cert}
                className="text-[15px] tracking-[0.07em] px-3 py-1.5 border"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.28)' }}
              >
                {cert}
              </span>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Right — form */}
      <div className="px-5 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-20 relative z-[1]">
        <div
          className="p-6 sm:p-8 lg:p-10"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
            <>
              <h3
                className="mb-7 font-normal italic"
                style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 26, color: '#fff' }}
              >
                Request a Quote or Sample
              </h3>

              <form onSubmit={handleSubmit}>
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="absolute opacity-0 pointer-events-none h-0 w-0" aria-hidden />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <FormField label="Full Name *"    name="name"    type="text"   value={form.name}    onChange={handleChange} placeholder="Your name" required />
                  <FormField label="Company"        name="company" type="text"   value={form.company} onChange={handleChange} placeholder="Company name" />
                  <FormField label="Email (email or mobile required)" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@company.com" error={fieldErrors.email} />
                  <FormField label="Mobile (email or mobile required)" name="mobile" type="tel" value={form.mobile} onChange={handleChange} placeholder="+91 XXX XXX XXXX" error={fieldErrors.mobile} />
                  <FormField label="Country *"      name="country" type="text"   value={form.country} onChange={handleChange} placeholder="Your country" required />

                  {/* Product select */}
                  <div className="flex flex-col gap-1.5 mb-3.5">
                    <label className="text-[15px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Product Category *
                    </label>
                    <select
                      name="product"
                      value={form.product}
                      onChange={handleChange}
                      required
                      className="text-[18px] px-3.5 py-3 outline-none transition-colors duration-200 appearance-none"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: form.product ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)',
                      }}
                    >
                      <option value="" disabled>Select product</option>
                      {PRODUCTS.map(p => <option key={p} value={p} style={{ background: 'var(--ink)' }}>{p}</option>)}
                    </select>
                  </div>

                  <FormField label="Quantity / MOQ" name="quantity" type="text" value={form.quantity} onChange={handleChange} placeholder="e.g. 200 pieces" />

                  {/* Message */}
                  <div className="col-span-2 flex flex-col gap-1.5 mb-3.5">
                    <label className="text-[15px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Message / Requirements
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Describe your design, size, colour requirements..."
                      className="text-[18px] px-3.5 py-3 outline-none resize-y transition-colors duration-200 min-h-[88px]"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.85)',
                      }}
                    />
                  </div>

                  {/* T&C */}
                  <div className="col-span-2 flex items-start gap-2.5 mb-2">
                    <input
                      type="checkbox"
                      id="agree"
                      name="agree"
                      checked={form.agree}
                      onChange={handleChange}
                      className="mt-0.5 w-4 h-4 cursor-pointer flex-shrink-0"
                      style={{ accentColor: 'var(--g)' }}
                    />
                    <label htmlFor="agree" className="text-[16px] leading-relaxed cursor-pointer" style={{ color: 'rgba(255,255,255,0.38)' }}>
                      I agree to the{' '}
                      <a href="/terms-and-conditions" className="underline" style={{ color: 'var(--gl)' }}>Terms & Conditions</a>
                      {' '}and consent to Tapis Global contacting me with information relevant to my enquiry.
                    </label>
                  </div>

                  {error && (
                    <p className="col-span-2 text-[15px] font-light" style={{ color: 'rgba(220,120,120,0.9)' }}>
                      {error}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="col-span-2 py-3.5 text-[14px] tracking-[0.2em] uppercase font-semibold transition-all duration-300 hover:bg-[var(--gd)] hover:text-white mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: 'var(--g)', color: 'var(--ink)', border: 'none', width: '100%' }}
                  >
                    {submitting ? 'Sending…' : 'Send Enquiry'}
                  </button>
                </div>
              </form>

              <p className="mt-2.5 text-[16px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.2)' }}>
                We respond within 12 hours. Your information is kept confidential.
              </p>
            </>
        </div>
      </div>
    </section>
    </>
  )
}

function ContactInfoRow({
  label,
  icon,
  children,
}: {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-11 h-11 flex-shrink-0 flex items-center justify-center border mt-0.5"
        style={{ border: '1px solid rgba(192,155,74,0.22)', color: 'var(--g)' }}
      >
        {icon}
      </div>
      <div>
        <p className="text-[15px] tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--gd)' }}>{label}</p>
        <div className="text-[16px] font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Form Field sub-component ──────────────────────────────
function FormField({
  label, name, type, value, onChange, placeholder, required, error,
}: {
  label: string; name: string; type: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string; required?: boolean; error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5 mb-3.5">
      <label htmlFor={name} className="text-[15px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="text-[18px] px-3.5 py-3 min-h-[48px] outline-none transition-colors duration-200 focus:border-[var(--g)]"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: error ? '1px solid rgba(200,120,90,0.55)' : '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.85)',
        }}
      />
      {error && (
        <p className="text-[14px] font-light" style={{ color: 'rgba(210,145,110,0.92)' }} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────
function MapIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> }
function PhoneIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 5.55 5.55l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> }
function MailIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> }
function ClockIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }
