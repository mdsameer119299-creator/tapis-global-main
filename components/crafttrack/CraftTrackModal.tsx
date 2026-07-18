'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type Props = {
  open: boolean
  onClose: () => void
}

/** The teaser modal opened by the floating CraftTrack button. Deliberately
 * does NOT auto-close like components/enquiry/EnquirySuccessModal.tsx does
 * — a teaser the visitor hasn't acted on must persist. Has a real focus
 * trap (matching components/crafttrack/admin/PublishConfirmDialog.tsx's
 * grade, not EnquirySuccessModal's dismiss-only pattern) since there are
 * three real focusable controls here (close, and two CTAs), not one. */
export default function CraftTrackModal({ open, onClose }: Props) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const titleId = useId()

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null
      setMounted(true)
      document.body.style.overflow = 'hidden'
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
      return () => cancelAnimationFrame(raf)
    }

    setVisible(false)
    const timer = window.setTimeout(() => {
      setMounted(false)
      document.body.style.overflow = ''
      previousFocusRef.current?.focus()
    }, 350)
    return () => window.clearTimeout(timer)
  }, [open])

  // Defensive unmount guard: a CTA both closes the modal AND navigates
  // (see `go()` below) to a route ConditionalChrome hides this launcher on
  // (/crafttrack/*), which unmounts this component immediately — before
  // the 350ms close timer above ever fires. That would leave body scroll
  // locked forever on every subsequent page. Runs once on unmount,
  // independent of the close-animation timing.
  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    if (visible) closeButtonRef.current?.focus()
  }, [visible])

  useEffect(() => {
    if (!mounted) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, a[href], input, [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mounted, onClose])

  if (!mounted || typeof document === 'undefined') return null

  function go(path: string) {
    onClose()
    router.push(path)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-0 sm:p-6 transition-opacity duration-[350ms]"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <button
        type="button"
        className="absolute inset-0 border-0 cursor-default"
        style={{ background: 'rgba(10,8,6,0.82)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
        aria-label="Close"
        tabIndex={-1}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full h-full sm:h-auto sm:max-w-lg overflow-hidden sm:rounded-sm transition-transform duration-[350ms]"
        style={{ transform: visible ? 'scale(1)' : 'scale(0.97)' }}
      >
        <div className="relative h-full sm:h-[560px]">
          <Image
            src="/images/tgi-banner-3.webp"
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 32rem"
            className="object-cover"
            priority={false}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(26,19,16,.15) 40%, rgba(26,19,16,.92))' }}
          />

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-9 h-9 rounded-full border border-ivory/30 text-ivory flex items-center justify-center text-lg focus-visible:ring-2 focus-visible:ring-gold/60"
          >
            ×
          </button>

          <div className="absolute inset-x-0 bottom-0 px-8 pb-12 sm:pb-14 text-center">
            <h2 id={titleId} className="font-display text-4xl sm:text-5xl text-ivory mb-3">
              CraftTrack™
            </h2>
            <p className="font-serif text-base text-gold-l mb-7">Track the Craft. Trust the Process.</p>
            <p className="font-serif text-sm text-ivory/75 mb-8 max-w-xs mx-auto leading-relaxed">
              Experience how your handcrafted order comes to life through curated production milestones, premium
              imagery and complete transparency.
            </p>
            <div className="flex flex-col gap-4 items-center">
              <button
                type="button"
                onClick={() => go('/crafttrack/demo')}
                className="w-full max-w-xs border border-gold text-gold rounded-full py-3 text-sm tracking-wide focus-visible:ring-2 focus-visible:ring-gold/60"
              >
                Experience CraftTrack™
              </button>
              <button
                type="button"
                onClick={() => go('/crafttrack/access')}
                className="text-ivory/80 text-sm underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-gold/60 rounded-sm"
              >
                Already Ordered? Access My CraftTrack →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
