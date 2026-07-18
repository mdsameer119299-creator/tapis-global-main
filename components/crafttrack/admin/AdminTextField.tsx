'use client'

import { forwardRef } from 'react'

type Props = {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  placeholder?: string
  type?: string
  autoComplete?: string
  multiline?: boolean
  rows?: number
  required?: boolean
  error?: string | null
  showError?: boolean
}

/** Light-theme (ivory/ink/gold) counterpart to components/enquiry/EnquiryTextField.tsx
 * — same prop shape for familiar call-site ergonomics, but styled for the
 * admin panel's white/ivory surfaces instead of the enquiry modal's dark
 * backdrop. Underline-style input, with a visible focus ring in addition to
 * the underline (the underline alone isn't sufficient keyboard-focus
 * feedback). */
const AdminTextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  function AdminTextField(
    { label, name, value, onChange, onBlur, placeholder, type = 'text', autoComplete, multiline, rows = 3, required, error, showError },
    ref,
  ) {
    const invalid = Boolean(showError && error)
    const fieldCls = `w-full bg-transparent border-0 border-b px-0.5 py-2 text-[15px] text-ink font-body outline-none transition-colors duration-200 focus:ring-2 focus:ring-gold/30 focus:rounded-sm ${
      invalid ? 'border-b-red-500' : 'border-b-ivory-k focus:border-b-gold'
    }`

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={name} className="text-2xs tracking-wide uppercase text-ink-m">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            rows={rows}
            required={required}
            aria-invalid={invalid}
            aria-describedby={invalid ? `${name}-error` : undefined}
            className={`${fieldCls} resize-none`}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={name}
            name={name}
            type={type}
            autoComplete={autoComplete}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            aria-invalid={invalid}
            aria-describedby={invalid ? `${name}-error` : undefined}
            className={fieldCls}
          />
        )}
        {invalid && (
          <p id={`${name}-error`} role="alert" className="text-2xs text-red-600">
            {error}
          </p>
        )}
      </div>
    )
  },
)

export default AdminTextField
