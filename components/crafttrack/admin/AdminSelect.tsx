'use client'

type Option = { value: string; label: string }

type Props = {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: Option[]
  placeholder?: string
  required?: boolean
  error?: string | null
  showError?: boolean
}

export default function AdminSelect({ label, name, value, onChange, options, placeholder, required, error, showError }: Props) {
  const invalid = Boolean(showError && error)

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-2xs tracking-wide uppercase text-ink-m">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${name}-error` : undefined}
        className={`w-full bg-transparent border-0 border-b px-0.5 py-2 text-[15px] text-ink font-body outline-none transition-colors duration-200 focus:ring-2 focus:ring-gold/30 focus:rounded-sm ${
          invalid ? 'border-b-red-500' : 'border-b-ivory-k focus:border-b-gold'
        }`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {invalid && (
        <p id={`${name}-error`} role="alert" className="text-2xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
