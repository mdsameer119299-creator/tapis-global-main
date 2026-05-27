'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import type { ProductGalleryImage } from '@/lib/products'
import { Reveal, Eyebrow } from '@/components/ui'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'

type Props = {
  images: ProductGalleryImage[]
  title:  string
}

export default function CategoryGallery({ images, title }: Props) {
  const [lightboxIndex, setLightbox] = useState<number | null>(null)

  const close = () => setLightbox(null)
  const goPrev = useCallback(() => {
    setLightbox((i) => (i === null ? null : (i - 1 + images.length) % images.length))
  }, [images.length])
  const goNext = useCallback(() => {
    setLightbox((i) => (i === null ? null : (i + 1) % images.length))
  }, [images.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [lightboxIndex, goPrev, goNext])

  const active = lightboxIndex !== null ? images[lightboxIndex] : null
  const spanPattern = [ '', 'lg:row-span-2', '', '', 'lg:col-span-2', '', 'lg:row-span-2', '', '', '', 'lg:col-span-2', '' ]

  return (
    <>
      <section className="py-14 lg:py-16 px-8 max-lg:px-5" style={{ background: '#0d0a08' }}>
        <Reveal>
          <Eyebrow white>Gallery</Eyebrow>
          <h2
            className="font-medium leading-[1.06] mb-10"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(28px, 3vw, 40px)',
              color: '#fff',
            }}
          >
            {title}
            <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}> in Detail</em>
          </h2>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[160px] lg:auto-rows-[180px] gap-3">
          {images.map((img, i) => (
            <Reveal key={`${img.src}-${i}`} delay={i * 25}>
              <button
                type="button"
                onClick={() => setLightbox(i)}
                className={`group relative w-full h-full min-h-[160px] overflow-hidden rounded-lg cursor-pointer ${spanPattern[i] ?? ''}`}
                style={{ border: '1px solid rgba(192,155,74,0.1)' }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                  quality={80}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                  style={{ filter: 'brightness(0.82) saturate(0.9)' }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-400 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-[10px] tracking-[0.2em] uppercase text-white transition-opacity duration-300">
                    View
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {active && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
          style={{ background: 'rgba(8,6,5,0.94)' }}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-6 right-6 text-[28px] leading-none z-[2]"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            aria-label="Close"
          >
            ×
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); goPrev() }} className="absolute left-4 lg:left-8 text-[24px] z-[2] px-3 py-2" style={{ color: 'var(--gp)' }} aria-label="Previous">‹</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); goNext() }} className="absolute right-4 lg:right-8 text-[24px] z-[2] px-3 py-2" style={{ color: 'var(--gp)' }} aria-label="Next">›</button>
          <div className="relative w-full max-w-4xl aspect-[4/3]" onClick={(e) => e.stopPropagation()}>
            <Image src={active.src} alt={active.alt} fill className="object-contain" quality={90} sizes="90vw" priority />
          </div>
          <p className="absolute bottom-6 left-0 right-0 text-center text-[12px] px-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {active.alt}
          </p>
        </div>
      )}
    </>
  )
}
