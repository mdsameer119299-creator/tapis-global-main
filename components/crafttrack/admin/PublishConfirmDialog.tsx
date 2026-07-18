'use client'

import { useEffect, useId, useRef } from 'react'

type Props = {
  open: boolean
  stageName: string
  busy?: boolean
  onCancel: () => void
  onConfirm: () => void
}

/** Gates a real action (overwriting the live Published version of a
 * stage), so unlike components/enquiry/EnquirySuccessModal.tsx
 * (informational, dismiss-only) this needs a genuine focus trap: Tab/
 * Shift+Tab cycles only between Cancel and Publish, initial focus lands on
 * Cancel (an accidental Enter shouldn't publish), and focus returns to
 * whatever triggered the dialog when it closes. */
export default function PublishConfirmDialog({ open, stageName, busy, onCancel, onConfirm }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const titleId = useId()

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null
      cancelRef.current?.focus()
    } else {
      previousFocusRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
        return
      }
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === cancelRef.current) {
          e.preventDefault()
          confirmRef.current?.focus()
        } else if (!e.shiftKey && document.activeElement === confirmRef.current) {
          e.preventDefault()
          cancelRef.current?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[2000] bg-ink/50 flex items-center justify-center p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="bg-white max-w-sm w-full p-7 rounded-sm">
        <h2 id={titleId} className="font-display text-xl text-ink mb-2">
          Publish changes?
        </h2>
        <p className="text-sm text-ink-m mb-6">
          This replaces the live version of &ldquo;{stageName}&rdquo; immediately. The customer will be notified by email.
        </p>
        <div className="flex justify-end gap-5">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="text-sm text-ink-m underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            aria-busy={busy}
            className="bg-ink text-gold-p rounded-sm px-5 py-2 text-sm disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-gold/50"
          >
            {busy ? 'Publishing…' : 'Publish changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
