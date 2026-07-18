'use client'

import { useEffect, useId, useRef, useState } from 'react'
import AdminTextField from './AdminTextField'

type CustomerOption = { id: string; name: string; email: string }

export type CustomerRefValue =
  | { mode: 'existing'; customerId: string; label: string }
  | { mode: 'new'; name: string; email: string }
  | null

type Props = {
  label: string
  value: CustomerRefValue
  onChange: (value: CustomerRefValue) => void
}

/** Customer picker: search-as-you-type over existing customers (WAI-ARIA
 * combobox pattern — role="combobox" input + role="listbox" popup, full
 * arrow-key/Enter/Escape support), with an inline "+ create new customer"
 * path that swaps to two plain fields. This is the one genuinely new
 * interaction pattern in the admin panel — built to the real pattern, not
 * a plain <select>, since custom comboboxes are the most commonly-botched
 * accessibility pattern when done informally. */
export default function AdminCombobox({ label, value, onChange }: Props) {
  const inputId = useId()
  const listboxId = useId()
  const [query, setQuery] = useState(value?.mode === 'existing' ? value.label : '')
  const [options, setOptions] = useState<CustomerOption[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [creatingNew, setCreatingNew] = useState(value?.mode === 'new')
  const [newName, setNewName] = useState(value?.mode === 'new' ? value.name : '')
  const [newEmail, setNewEmail] = useState(value?.mode === 'new' ? value.email : '')
  const containerRef = useRef<HTMLDivElement>(null)
  const newNameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open || creatingNew || query.trim().length < 2) {
      setOptions([])
      return
    }
    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/crafttrack/customers?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
        const data = (await res.json()) as { ok: boolean; customers?: CustomerOption[] }
        setOptions(data.ok && data.customers ? data.customers : [])
        setActiveIndex(-1)
      } catch {
        // aborted or network error — leave options as they were
      }
    }, 250)
    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [query, open, creatingNew])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectOption(opt: CustomerOption) {
    onChange({ mode: 'existing', customerId: opt.id, label: opt.name })
    setQuery(opt.name)
    setOpen(false)
    setActiveIndex(-1)
  }

  function startCreatingNew() {
    setCreatingNew(true)
    setOpen(false)
    setNewName(query)
    onChange({ mode: 'new', name: query, email: '' })
    requestAnimationFrame(() => newNameRef.current?.focus())
  }

  function cancelCreatingNew() {
    setCreatingNew(false)
    setNewName('')
    setNewEmail('')
    onChange(null)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault()
      setOpen(true)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && options[activeIndex]) {
        e.preventDefault()
        selectOption(options[activeIndex])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  if (creatingNew) {
    return (
      <div className="flex flex-col gap-3 border border-ivory-k rounded-sm p-4">
        <div className="flex items-center justify-between">
          <span className="text-2xs tracking-wide uppercase text-ink-m">New customer</span>
          <button
            type="button"
            onClick={cancelCreatingNew}
            className="text-2xs text-ink-m underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
          >
            Choose existing instead
          </button>
        </div>
        <AdminTextField
          ref={newNameRef}
          label="Full name"
          name="new-customer-name"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value)
            onChange({ mode: 'new', name: e.target.value, email: newEmail })
          }}
          required
        />
        <AdminTextField
          label="Email address"
          name="new-customer-email"
          type="email"
          value={newEmail}
          onChange={(e) => {
            setNewEmail(e.target.value)
            onChange({ mode: 'new', name: newName, email: e.target.value })
          }}
          required
        />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-2xs tracking-wide uppercase text-ink-m">
        {label}
      </label>
      <input
        id={inputId}
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          if (value?.mode === 'existing') onChange(null)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search by name or email…"
        className="w-full bg-transparent border-0 border-b border-ivory-k px-0.5 py-2 text-[15px] text-ink font-body outline-none focus:border-b-gold focus:ring-2 focus:ring-gold/30 focus:rounded-sm"
      />
      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute top-full left-0 right-0 z-10 mt-1 max-h-60 overflow-auto bg-white border border-ivory-k rounded-sm shadow-lg"
        >
          {options.map((opt, index) => (
            <li
              key={opt.id}
              id={`${listboxId}-opt-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault()
                selectOption(opt)
              }}
              className={`px-3 py-2 text-sm cursor-pointer ${index === activeIndex ? 'bg-ivory-d' : ''}`}
            >
              <span className="text-ink">{opt.name}</span>
              <span className="text-ink-m text-2xs ml-2">{opt.email}</span>
            </li>
          ))}
          {query.trim().length >= 2 && (
            <li>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  startCreatingNew()
                }}
                className="w-full text-left px-3 py-2 text-sm text-gold-d hover:bg-ivory-d"
              >
                + Create new customer &ldquo;{query.trim()}&rdquo;
              </button>
            </li>
          )}
          {options.length === 0 && query.trim().length < 2 && (
            <li className="px-3 py-2 text-2xs text-ink-m">Type at least 2 characters to search.</li>
          )}
        </ul>
      )}
    </div>
  )
}
