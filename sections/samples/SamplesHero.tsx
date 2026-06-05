'use client'

import { useState, useEffect, useCallback } from 'react'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { SAMPLE_HERO_SLIDES } from '@/lib/swatches'

const INTERVAL = 5000

export default function SamplesHero() {
  const [current, setCurrent] = useState(0)

  const goTo = useCallback((n: number) => {
    setCurrent(((n % SAMPLE_HERO_SLIDES.length) + SAMPLE_HERO_SLIDES.length) % SAMPLE_HERO_SLIDES.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => goTo(current + 1), INTERVAL)
    return () => clearInterval(timer)
  }, [current, goTo])

  const scrollToCatalog = () => {
    document.getElementById('samples-catalog')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{
        height:     '72vh',
        minHeight:  480,
        background: 'var(--cd)',
      }}
    >
      {SAMPLE_HERO_SLIDES.map((slide, i) => {
        const next = (current + 1) % SAMPLE_HERO_SLIDES.length
        if (i !== current && i !== next) return null

        return (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-[1400ms] ease-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <div className="relative w-full h-full fill-frame">
            <OptimizedImage
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              tone="hero"
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
        )
      })}

      <div
        className="absolute inset-0 z-[2]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(26,19,16,0.28) 0%, rgba(26,19,16,0.72) 100%)',
        }}
      />

      <div className="absolute inset-0 z-[3] flex flex-col items-center justify-center text-center px-6">
        <div
          className="flex items-center gap-3 text-[15px] tracking-[0.44em] uppercase mb-[18px]"
          style={{ color: 'var(--gl)' }}
        >
          <span className="block w-8 h-px" style={{ background: 'var(--g)' }} />
          Request Your Samples
          <span className="block w-8 h-px" style={{ background: 'var(--g)' }} />
        </div>

        <h1
          className="font-display font-normal leading-[1.05] mb-4"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(44px, 6vw, 80px)',
            color: '#fff',
          }}
        >
          Feel the <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}>Quality</em>
        </h1>

        <p
          className="text-[17px] font-light leading-[1.75] max-w-[520px] mb-8"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          Touch, feel and compare our premium carpet materials before placing your order.
          Available for trade professionals and interior designers worldwide.
        </p>

        <button
          type="button"
          onClick={scrollToCatalog}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 text-[15px] tracking-[0.18em] uppercase font-semibold border-none cursor-pointer transition-colors duration-200 hover:brightness-110"
          style={{ background: 'var(--g)', color: 'var(--ink)' }}
        >
          Request Free Samples →
        </button>
      </div>

      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-[4] flex gap-2.5">
        {SAMPLE_HERO_SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className="rounded-full border-none cursor-pointer transition-all duration-300"
            style={{
              width:      7,
              height:     7,
              background: i === current ? 'var(--g)' : 'rgba(255,255,255,0.3)',
              transform:  i === current ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </section>
  )
}
