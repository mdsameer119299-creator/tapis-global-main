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
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  autoComplete?: string
  multiline?: boolean
  rows?: number
  error?: string | null
  showError?: boolean
}

const EnquiryTextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  function EnquiryTextField(
    {
      label,
      name,
      value,
      onChange,
      onBlur,
      placeholder,
      type = 'text',
      inputMode,
      autoComplete,
      multiline,
      rows = 3,
      error,
      showError,
    },
    ref,
  ) {
    const invalid = Boolean(showError && error)
    const fieldCls = `enquiry-field w-full bg-[rgba(255,255,255,0.04)] border px-4 py-3 text-[16px] font-light outline-none transition-all duration-300 min-h-[48px] ${
      invalid ? 'enquiry-field--invalid' : ''
    }`

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={name}
          className="text-[14px] tracking-[0.24em] uppercase font-medium"
          style={{ color: invalid ? 'rgba(220,160,120,0.85)' : 'var(--gd)' }}
        >
          {label}
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
            className={`${fieldCls} resize-none min-h-[88px]`}
            style={{ color: 'rgba(255,255,255,0.9)' }}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={name}
            name={name}
            type={type}
            inputMode={inputMode}
            autoComplete={autoComplete}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            className={fieldCls}
            style={{ color: 'rgba(255,255,255,0.9)' }}
          />
        )}
        {showError && error && (
          <p className="enquiry-field-error text-[16px] font-light pl-0.5" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)

export default EnquiryTextField
