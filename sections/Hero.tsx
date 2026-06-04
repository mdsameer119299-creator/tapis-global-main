'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { HERO_SLIDES, HERO_STATS, SITE } from '@/lib/data'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'

const DURATION = 7000

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)

  const goTo = useCallback((n: number) => {
    setCurrent(((n % HERO_SLIDES.length) + HERO_SLIDES.length) % HERO_SLIDES.length)
    setProgress(0)
  }, [])

  // Auto-advance + progress bar
  useEffect(() => {
    let start: number
    let raf: number
    let timeout: ReturnType<typeof setTimeout>

    const tick = (ts: number) => {
      if (!start) start = ts
      const elapsed = ts - start
      setProgress(Math.min((elapsed / DURATION) * 100, 100))
      if (elapsed < DURATION) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    timeout = setTimeout(() => goTo(current + 1), DURATION)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timeout)
    }
  }, [current, goTo])

  return (
    <section id="hero" className="relative h-[100svh] min-h-[560px] max-h-[900px] overflow-hidden" style={{ background: '#0d0a08' }}>

      {/* ── Slides — load active + next only to cut initial image requests ── */}
      {HERO_SLIDES.map((slide, i) => {
        const next = (current + 1) % HERO_SLIDES.length
        const shouldLoad = i === current || i === next
        if (!shouldLoad) return null

        return (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-[1600ms]"
          style={{
            opacity: i === current ? 1 : 0,
          }}
        >
          <div className="relative w-full h-full fill-frame">
            <Image
              src={slide.poster}
              alt={slide.label}
              fill
              priority={i === 0}
              placeholder={i === 0 ? 'blur' : 'empty'}
              blurDataURL={i === 0 ? BLUR_PLACEHOLDER : undefined}
              quality={i === 0 ? 80 : 72}
              sizes="100vw"
              className="object-cover object-center"
              style={{
                filter: 'brightness(0.68) saturate(0.95) sepia(0.06)',
                animation: i === current ? 'kbzoom 10s ease forwards' : 'none',
                transition: 'opacity 0ms',
              }}
            />
          </div>
        </div>
        )
      })}

      {/* ── Cinematic multi-layer overlay ── */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 120% 100% at 50% 50%, transparent 30%, rgba(4,2,1,0.55) 100%),
            linear-gradient(to top, rgba(4,2,1,0.92) 0%, rgba(4,2,1,0.5) 28%, rgba(4,2,1,0.08) 55%, rgba(4,2,1,0.22) 100%)
          `,
        }}
      />

      {/* ── Slide label ── */}
      <div className="absolute top-6 sm:top-8 left-5 sm:left-24 max-lg:left-5 z-[6] flex items-center gap-2.5">
        <span className="w-7 h-px" style={{ background: 'var(--g)' }} />
        <span className="text-[9.5px] tracking-[0.36em] uppercase font-medium" style={{ color: 'var(--gl)' }}>
          {HERO_SLIDES[current].label}
        </span>
      </div>

      {/* ── Counter ── */}
      <div className="absolute top-6 sm:top-8 right-5 sm:right-24 max-lg:right-5 z-[6] text-[11px] tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.38)' }}>
        <span style={{ color: 'var(--gl)', fontWeight: 500 }}>
          {String(current + 1).padStart(2, '0')}
        </span>
        /{String(HERO_SLIDES.length).padStart(2, '0')}
      </div>

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={() => goTo(current - 1)}
        className="absolute left-3 sm:left-9 max-lg:left-2.5 top-1/2 -translate-y-1/2 z-[6] w-10 sm:w-[52px] h-10 sm:h-[52px] flex items-center justify-center border transition-all duration-300 active:scale-95"
        style={{ border: '1px solid rgba(192,155,74,0.35)', background: 'rgba(4,2,1,0.38)', backdropFilter: 'blur(10px)', color: 'rgba(255,255,255,0.7)' }}
        aria-label="Previous slide"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button
        onClick={() => goTo(current + 1)}
        className="absolute right-3 sm:right-9 max-lg:right-2.5 top-1/2 -translate-y-1/2 z-[6] w-10 sm:w-[52px] h-10 sm:h-[52px] flex items-center justify-center border transition-all duration-300 active:scale-95"
        style={{ border: '1px solid rgba(192,155,74,0.35)', background: 'rgba(4,2,1,0.38)', backdropFilter: 'blur(10px)', color: 'rgba(255,255,255,0.7)' }}
        aria-label="Next slide"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      {/* ── Dots ── */}
      <div className="absolute bottom-8 sm:bottom-11 right-5 sm:right-24 max-lg:right-5 z-[6] flex gap-2 items-center">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="h-0.5 transition-all duration-300"
            style={{
              width: i === current ? 44 : 24,
              background: i === current ? 'var(--g)' : 'rgba(255,255,255,0.28)',
              border: 'none',
              padding: 0,
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Floating Est. badge ── */}
      <div
        className="absolute bottom-[172px] right-24 max-lg:hidden z-[6] text-center px-6 py-4 min-w-[148px]"
        style={{ background: 'rgba(4,2,1,0.55)', backdropFilter: 'blur(14px)', border: '1px solid rgba(192,155,74,0.3)' }}
      >
        <p className="text-[9.5px] tracking-[0.28em] uppercase" style={{ color: 'var(--gl)' }}>Established</p>
        <p className="font-display text-[40px] font-normal leading-tight my-0.5" style={{ fontFamily: '"Cormorant Garamond",serif', color: 'var(--gp)' }}>
          {SITE.established}
        </p>
        <p className="text-[10px] tracking-[0.1em] uppercase" style={{ color: 'rgba(255,255,255,0.38)' }}>Bhadohi, India</p>
      </div>

      {/* ── Scroll cue ── */}
      <div className="absolute bottom-8 sm:bottom-11 left-5 sm:left-24 max-lg:left-5 z-[6] hidden sm:flex items-center gap-2.5">
        <div className="w-px h-11" style={{ background: 'linear-gradient(to bottom, var(--g), transparent)', animation: 'scpulse 2.2s ease infinite' }} />
        <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.28)', writingMode: 'vertical-rl' }}>
          Scroll
        </span>
      </div>

      {/* ── Vertical edge label ── */}
      <div
        className="absolute left-7 top-1/2 -translate-y-1/2 -rotate-90 z-[6] text-[9px] tracking-[0.42em] uppercase whitespace-nowrap max-lg:hidden"
        style={{ color: 'rgba(255,255,255,0.22)' }}
      >
        Specification-Led · Pan India · Worldwide
      </div>

      {/* ── Main hero content ── */}
      <div
        className="absolute inset-0 z-[5] flex flex-col justify-end pb-8 sm:pb-12 lg:pb-20 px-5 sm:px-6 lg:px-24 pointer-events-none"
      >
        <div
          className="inline-flex items-center gap-2.5 px-3 sm:px-4 py-2 mb-5 sm:mb-7 w-fit max-w-full text-[9px] sm:text-[11px] tracking-[0.22em] sm:tracking-[0.28em] uppercase pointer-events-auto"
          style={{ border: '1px solid rgba(192,155,74,0.5)', background: 'rgba(26,19,16,0.35)', backdropFilter: 'blur(8px)', color: 'var(--gp)' }}
        >
          Established {SITE.established} · Bhadohi, India
        </div>

        <h1
          className="font-light leading-[1.05] sm:leading-[1.02] tracking-tight text-white mb-5 sm:mb-6 max-w-3xl pointer-events-auto"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(34px, 8.5vw, 88px)', textShadow: '0 2px 32px rgba(0,0,0,0.4)' }}
        >
          Premium Flooring Solutions.
          <br />
          <em className="font-light not-italic" style={{ color: 'var(--gp)', fontStyle: 'italic' }}>Crafted in Bhadohi.</em>
          <span
            className="block mt-2 sm:mt-3 font-body font-light uppercase leading-relaxed"
            style={{ fontSize: 'clamp(10px,2.8vw,15px)', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.55)' }}
          >
            For Architects, Hospitality &amp; Luxury Interiors
            <span className="hidden sm:inline"> — India &amp; Worldwide</span>
          </span>
        </h1>

        <div className="flex gap-2.5 sm:gap-3.5 items-stretch sm:items-center flex-col sm:flex-row mb-6 sm:mb-9 pointer-events-auto w-full sm:w-auto">
          <a
            href="/contact"
            className="px-6 sm:px-8 py-3.5 text-[11px] sm:text-[11.5px] tracking-[0.16em] sm:tracking-[0.18em] uppercase font-medium border transition-all duration-300 text-center active:opacity-90"
            style={{ background: 'var(--g)', color: 'var(--ink)', borderColor: 'var(--g)' }}
          >
            Start Your Design Journey
          </a>
          <a
            href="/products"
            className="px-6 sm:px-8 py-3.5 text-[11px] sm:text-[11.5px] tracking-[0.16em] sm:tracking-[0.18em] uppercase font-medium border transition-all duration-300 text-center active:text-white"
            style={{ border: '1px solid rgba(255,255,255,0.35)', color: 'rgba(255,255,255,0.65)' }}
          >
            Explore Collections
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:flex gap-y-3 gap-x-2 sm:gap-0 pt-5 sm:pt-7 pointer-events-auto" style={{ borderTop: '1px solid rgba(192,155,74,0.3)' }}>
          {HERO_STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="sm:flex-1 min-w-0 py-1 sm:py-0 sm:min-w-[120px] sm:pr-5 sm:mr-5 last:sm:pr-0 last:sm:mr-0"
              style={{ borderRight: i < HERO_STATS.length - 1 ? undefined : undefined }}
            >
              <p className="font-display font-normal leading-none" style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(28px,7vw,38px)', color: 'var(--gp)' }}>
                {stat.value}
                <sup className="text-[17px]" style={{ color: 'var(--g)', verticalAlign: 'super' }}>{stat.suffix}</sup>
              </p>
              <p className="text-[11px] tracking-[0.1em] uppercase mt-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 left-0 z-[7] h-0.5 transition-none" style={{ width: `${progress}%`, background: 'var(--g)' }} />

      <style jsx global>{`
        @keyframes kbzoom { from { transform: scale(1.06) } to { transform: scale(1) } }
        @keyframes scpulse { 0%,100% { opacity: .35 } 50% { opacity: 1 } }
      `}</style>
    </section>
  )
}
