'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'

type Props = {
  open: boolean
  onClose: () => void
}

export default function EnquirySuccessModal({ open, onClose }: Props) {
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return

    const timer = window.setTimeout(handleClose, 5000)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)

    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, handleClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-success-title"
    >
      <button
        type="button"
        className="absolute inset-0 border-0 cursor-default"
        style={{ background: 'rgba(10, 8, 6, 0.82)', backdropFilter: 'blur(6px)' }}
        onClick={handleClose}
        aria-label="Close"
      />

      <div
        className="relative w-full max-w-md text-center px-7 sm:px-8 py-9 sm:py-10 enquiry-success-modal"
        style={{
          background: 'linear-gradient(165deg, #1f1814 0%, #12100d 100%)',
          border: '1px solid rgba(192,155,74,0.35)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(237,217,154,0.08)',
        }}
      >
        <div
          className="mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full enquiry-check-circle"
          style={{
            background: 'rgba(192,155,74,0.12)',
            border: '1px solid rgba(192,155,74,0.45)',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
            <circle cx="18" cy="18" r="16" stroke="rgba(192,155,74,0.25)" strokeWidth="1.5" />
            <path
              className="enquiry-check-mark"
              d="M10 18.5 L16 24.5 L26 12.5"
              stroke="var(--gp)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        <h3
          id="enquiry-success-title"
          className="font-normal mb-3"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(28px, 5vw, 36px)',
            color: 'var(--gp)',
          }}
        >
          Thank You
        </h3>

        <p
          className="text-[19px] font-light leading-[1.75] mb-8 max-w-[36ch] mx-auto"
          style={{ color: 'rgba(255,255,255,0.58)' }}
        >
          Your enquiry has been received successfully. Our team will contact you within 12 working hours.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3.5 text-[15px] tracking-[0.18em] uppercase font-semibold transition-all duration-300 enquiry-modal-btn-secondary"
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            Close
          </button>
          <Link
            href="/catalogue"
            onClick={handleClose}
            className="flex-1 py-3.5 text-[15px] tracking-[0.18em] uppercase font-semibold transition-all duration-300 hover:brightness-110 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--g) 0%, #a8843a 100%)',
              color: 'var(--ink)',
            }}
          >
            Download Catalogue
          </Link>
        </div>

        <p className="mt-4 text-[15px] tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.22)' }}>
          Closes automatically in 5 seconds
        </p>
      </div>
    </div>,
    document.body,
  )
}
