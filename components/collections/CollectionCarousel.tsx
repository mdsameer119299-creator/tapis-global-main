'use client'

import Image from 'next/image'
import type { SlideTagVariant } from '@/lib/collections'
import { useCollectionCarousel } from '@/hooks/useCollectionCarousel'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'

const TAG_STYLES: Record<SlideTagVariant, React.CSSProperties> = {
  gold:  { background: 'var(--g)',  color: 'var(--ink)' },
  dark:  { background: 'var(--cd)', color: 'var(--gp)'  },
  light: { background: 'rgba(248,244,238,0.92)', color: 'var(--c)', border: '1px solid var(--bg)' },
}

type Props = {
  images:          string[]
  title:           string
  slideTag:        string
  slideTagVariant: SlideTagVariant
  isPriority?:     boolean
}

export default function CollectionCarousel({
  images,
  title,
  slideTag,
  slideTagVariant,
  isPriority = false,
}: Props) {
  const { current, goTo, pause, resume } = useCollectionCarousel(
    images.length,
    { intervalMs: 2000 },
  )

  const nextIndex = (current + 1) % images.length

  return (
    <div
      className="relative overflow-hidden min-h-[400px] lg:min-h-[520px] group"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {images.map((src, i) => {
        const shouldLoad = i === current || i === nextIndex
        if (!shouldLoad) return null

        return (
        <div
          key={`${src}-${i}`}
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          <div className="relative w-full h-full fill-frame">
            <Image
              src={src}
              alt={`${title} — view ${i + 1}`}
              fill
              priority={isPriority && i === 0}
              placeholder={isPriority && i === 0 ? 'blur' : 'empty'}
              blurDataURL={isPriority && i === 0 ? BLUR_PLACEHOLDER : undefined}
              quality={72}
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="object-cover object-center"
              style={{
                filter:    'brightness(0.85) saturate(0.90) sepia(0.04)',
                animation: i === current ? 'kbzoom 8s ease forwards' : 'none',
              }}
            />
          </div>
        </div>
        )
      })}

      {current === 0 && (
        <span
          className="absolute top-5 left-5 z-[3] text-[14px] tracking-[0.22em] uppercase px-3.5 py-1.5 font-medium"
          style={TAG_STYLES[slideTagVariant]}
        >
          {slideTag}
        </span>
      )}

      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.65) 100%)' }}
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(current - 1)}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 z-[4] w-9 h-9 flex items-center justify-center border opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[var(--g)] hover:border-[var(--g)]"
            style={{ background: 'rgba(4,2,1,0.42)', borderColor: 'rgba(192,155,74,0.3)', color: 'rgba(255,255,255,0.7)' }}
            aria-label="Previous image"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(current + 1)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 z-[4] w-9 h-9 flex items-center justify-center border opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[var(--g)] hover:border-[var(--g)]"
            style={{ background: 'rgba(4,2,1,0.42)', borderColor: 'rgba(192,155,74,0.3)', color: 'rgba(255,255,255,0.7)' }}
            aria-label="Next image"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[4] flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className="h-0.5 transition-all duration-300"
                style={{
                  width:      i === current ? 36 : 20,
                  background: i === current ? 'var(--g)' : 'rgba(255,255,255,0.35)',
                }}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
