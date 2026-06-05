'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import {
  GALLERY_FILTERS,
  GALLERY_ITEMS,
  filterGalleryItems,
  type GalleryCategory,
  type GalleryItem,
} from '@/lib/gallery'
import { Reveal, Eyebrow } from '@/components/ui'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'

export default function GalleryGrid() {
  const [filter, setFilter]       = useState<GalleryCategory>('all')
  const [lightboxIndex, setLightbox] = useState<number | null>(null)

  const visible = filterGalleryItems(GALLERY_ITEMS, filter)

  const openLightbox = (item: GalleryItem) => {
    const idx = visible.findIndex((i) => i.id === item.id)
    setLightbox(idx >= 0 ? idx : 0)
  }

  const closeLightbox = () => setLightbox(null)

  const goPrev = useCallback(() => {
    setLightbox((idx) => {
      if (idx === null) return null
      return (idx - 1 + visible.length) % visible.length
    })
  }, [visible.length])

  const goNext = useCallback(() => {
    setLightbox((idx) => {
      if (idx === null) return null
      return (idx + 1) % visible.length
    })
  }, [visible.length])

  useEffect(() => {
    if (lightboxIndex === null) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
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

  useEffect(() => {
    setLightbox(null)
  }, [filter])

  const activeItem = lightboxIndex !== null ? visible[lightboxIndex] : null

  return (
    <>
      <section
        className="py-20 px-12 max-lg:px-6"
        style={{ background: 'var(--iv)' }}
      >
        <div className="mb-12 max-w-2xl">
          <Reveal>
            <Eyebrow>Collection Gallery</Eyebrow>
            <h2
              className="font-medium leading-[1.06] tracking-tight mb-4"
              style={{
                fontFamily: '"Cormorant Garamond",serif',
                fontSize: 'clamp(36px,3.8vw,56px)',
                color: 'var(--ink)',
              }}
            >
              Every Knot.
              <br />
              <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>Every Fibre.</em> Every Floor.
            </h2>
            <p className="text-[20px] font-light leading-[1.85]" style={{ color: 'var(--inkm)' }}>
              Browse our carpet and rug installations across six collections — from hand-knotted silk masterpieces to contract-grade broadloom.
            </p>
          </Reveal>
        </div>

        <Reveal delay={100}>
          <div className="flex flex-wrap gap-2 mb-12">
            {GALLERY_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className="text-[15px] tracking-[0.14em] uppercase px-[18px] py-2 border transition-all duration-[220ms]"
                style={{
                  background:  filter === f.id ? 'var(--c)' : 'transparent',
                  borderColor: filter === f.id ? 'var(--c)' : 'var(--bd)',
                  color:       filter === f.id ? '#fff' : 'var(--inkm)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3">
          {visible.map((item) => (
            <div key={item.id} className="break-inside-avoid mb-3">
              <button
                type="button"
                onClick={() => openLightbox(item)}
                className="w-full text-left group cursor-pointer border-none p-0"
                style={{ background: 'var(--ink)' }}
              >
                <div className="relative overflow-hidden">
                  <div className="relative w-full aspect-[4/5] fill-frame">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                      quality={85}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center transition-all duration-500 group-hover:scale-[1.06]"
                      style={{ filter: 'brightness(0.88) saturate(0.92) sepia(0.04)' }}
                    />
                  </div>
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'rgba(26,19,16,0.45)' }}
                  >
                    <span
                      className="w-10 h-10 flex items-center justify-center text-xl border rounded-full"
                      style={{ borderColor: 'var(--g)', color: 'var(--gp)' }}
                    >
                      +
                    </span>
                  </div>
                </div>
                <div className="px-3 py-3" style={{ background: 'var(--iv)' }}>
                  <span className="block text-[8.5px] tracking-[0.22em] uppercase mb-1" style={{ color: 'var(--gd)' }}>
                    {item.category}
                  </span>
                  <span className="block text-[14px] font-medium" style={{ color: 'var(--ink)' }}>
                    {item.title}
                  </span>
                  <span className="block text-[15px] mt-0.5" style={{ color: 'var(--inkl)' }}>
                    {item.location}
                  </span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </section>

      {activeItem && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[9000] flex items-center justify-center px-6 py-10"
          style={{ background: 'rgba(13,10,8,0.94)' }}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Gallery lightbox"
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center border text-lg"
            style={{ borderColor: 'rgba(192,155,74,0.35)', color: 'var(--gp)' }}
            aria-label="Close lightbox"
          >
            ×
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border"
            style={{ borderColor: 'rgba(192,155,74,0.35)', color: 'var(--gp)' }}
            aria-label="Previous image"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goNext() }}
            className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border"
            style={{ borderColor: 'rgba(192,155,74,0.35)', color: 'var(--gp)' }}
            aria-label="Next image"
          >
            ›
          </button>

          <div
            className="relative max-w-[85vw] max-h-[88vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-h-[78vh] aspect-[4/3] fill-frame mx-auto">
              <Image
                src={activeItem.image}
                alt={activeItem.title}
                fill
                quality={90}
                sizes="85vw"
                loading="eager"
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
                className="object-contain object-center"
              />
            </div>
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <div>
                <p className="text-[15px] tracking-[0.22em] uppercase mb-1" style={{ color: 'var(--gl)' }}>
                  {activeItem.category}
                </p>
                <p
                  className="font-medium"
                  style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 28, color: '#fff' }}
                >
                  {activeItem.title}
                </p>
                <p className="text-[15px] mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {activeItem.location}
                </p>
              </div>
              <p className="ml-auto text-[14px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {lightboxIndex + 1} / {visible.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
