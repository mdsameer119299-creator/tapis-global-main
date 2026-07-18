'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

export type GalleryLightboxItem = {
  url: string
  caption: string | null
  stageName: string
}

type Props = {
  items: GalleryLightboxItem[]
  startIndex: number
  onClose: () => void
}

/** True fullscreen lightbox spanning every stage's media, not one stage at
 * a time — matches "true fullscreen lightbox" from the approved design.
 * Real focus trap (this has three real controls: close, prev, next) and
 * arrow-key navigation in addition to the on-screen buttons. Only the
 * current image (± 1 for smooth prev/next) is ever a "hot" next/image —
 * the rest of the gallery is never mounted at once. */
export default function GalleryLightbox({ items, startIndex, onClose }: Props) {
  const [index, setIndex] = useState(startIndex)
  const containerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const titleId = useId()

  const current = items[index]
  const hasPrev = index > 0
  const hasNext = index < items.length - 1

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      previousFocusRef.current?.focus()
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'ArrowLeft' && hasPrev) {
        setIndex((i) => i - 1)
        return
      }
      if (e.key === 'ArrowRight' && hasNext) {
        setIndex((i) => i + 1)
        return
      }
      if (e.key === 'Tab' && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>('button')
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
  }, [hasPrev, hasNext, onClose])

  if (!current || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[2100] bg-ink/95 flex flex-col items-center justify-center px-4"
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Close gallery"
        className="absolute top-4 right-4 w-10 h-10 rounded-full border border-ivory/30 text-ivory flex items-center justify-center text-xl focus-visible:ring-2 focus-visible:ring-gold/60"
      >
        ×
      </button>

      {hasPrev && (
        <button
          type="button"
          onClick={() => setIndex((i) => i - 1)}
          aria-label="Previous photo"
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-ivory/30 text-ivory flex items-center justify-center text-xl focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          ‹
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          onClick={() => setIndex((i) => i + 1)}
          aria-label="Next photo"
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-ivory/30 text-ivory flex items-center justify-center text-xl focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          ›
        </button>
      )}

      <div className="relative w-full max-w-3xl aspect-[4/3]">
        <Image
          src={current.url}
          alt={current.caption ?? current.stageName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 48rem"
          className="object-contain"
        />
      </div>

      <div className="mt-4 text-center max-w-lg">
        <p id={titleId} className="sr-only">
          {current.stageName} — photo {index + 1} of {items.length}
        </p>
        {current.caption && <p className="font-serif text-sm text-ivory/80">{current.caption}</p>}
        <p className="text-2xs text-ivory/40 mt-1">
          {index + 1} of {items.length} · {current.stageName}
        </p>
      </div>
    </div>,
    document.body,
  )
}
