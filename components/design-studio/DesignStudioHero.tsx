'use client'

import Image from 'next/image'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'
import { DESIGN_STUDIO_STATS } from '@/lib/design-studio'

const STATS = [
  { value: DESIGN_STUDIO_STATS.colors, label: DESIGN_STUDIO_STATS.colorsLabel },
  { value: '', label: DESIGN_STUDIO_STATS.matching },
  { value: '', label: DESIGN_STUDIO_STATS.yarns },
  { value: '', label: DESIGN_STUDIO_STATS.expert },
]

export default function DesignStudioHero() {
  return (
    <section className="relative overflow-hidden" style={{ minHeight: 'min(72vh, 560px)' }}>
      <div className="absolute inset-0">
        <Image
          src="/images/vibrant-wool-dying.webp"
          alt="Yarn, colour swatches and design materials — Tapis Global Design Studio"
          fill
          priority
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          quality={88}
          sizes="100vw"
          className="object-cover object-center"
          style={{ filter: 'brightness(0.55) saturate(0.9) sepia(0.08)' }}
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, rgba(74,20,20,0.88) 0%, rgba(74,20,20,0.72) 45%, rgba(26,19,16,0.55) 100%)',
        }}
      />

      <div className="relative z-[2] max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
        <div className="max-w-2xl">
          <p className="text-[15px] tracking-[0.36em] uppercase mb-4" style={{ color: 'var(--gl)' }}>
            Design Studio
          </p>
          <h1
            className="font-display font-normal leading-[1.05] mb-5"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(36px, 5.5vw, 62px)',
              color: '#fff',
            }}
          >
            Design with Limitless{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}>Possibilities</em>
          </h1>
          <p className="text-[17px] font-light leading-[1.8] max-w-lg" style={{ color: 'rgba(255,255,255,0.65)' }}>
            From yarn selection to custom colour development — we help architects, designers and project teams
            create the perfect carpet for every space.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 flex-shrink-0">
          {STATS.map((item) => (
            <div key={item.label} className="text-center lg:text-left">
              {item.value && (
                <p
                  className="font-display leading-none mb-1.5"
                  style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--gp)' }}
                >
                  {item.value}
                </p>
              )}
              <p className="text-[15px] sm:text-[15px] tracking-[0.08em] leading-snug" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
