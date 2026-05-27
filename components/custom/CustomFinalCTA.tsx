import Link from 'next/link'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { CUSTOM_FINAL_CTA } from '@/lib/custom'
import { Reveal } from '@/components/ui'

export default function CustomFinalCTA() {
  return (
    <section className="relative overflow-hidden min-h-[420px] flex items-center">
      <div className="absolute inset-0">
        <div className="relative w-full h-full fill-frame">
          <OptimizedImage
            src="/images/rug4.jpg"
            alt="Luxury custom carpet — Tapis Global International"
            fill
            loading="lazy"
            tone="hero"
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      </div>

      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to right, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.75) 50%, rgba(10,8,6,0.88) 100%)' }}
      />

      <div className="relative z-[2] px-12 max-lg:px-6 py-20 w-full max-w-6xl mx-auto text-center">
        <Reveal>
          <h2
            className="font-display font-light leading-[1.05] mb-5"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(36px, 4.5vw, 64px)',
              color: '#fff',
            }}
          >
            {CUSTOM_FINAL_CTA.title}
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}>{CUSTOM_FINAL_CTA.titleEm}</em>
          </h2>
          <p
            className="text-[16px] font-light leading-[1.85] max-w-xl mx-auto mb-10"
            style={{ color: 'rgba(248,244,238,0.55)' }}
          >
            {CUSTOM_FINAL_CTA.lead}
          </p>
          <Link
            href={CUSTOM_FINAL_CTA.ctaHref}
            className="inline-block px-12 py-4 text-[11px] tracking-[0.22em] uppercase font-semibold rounded-sm transition-all duration-400 hover:tracking-[0.26em] hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, var(--g) 0%, #a8843a 100%)',
              color: 'var(--ink)',
              boxShadow: '0 8px 32px rgba(192,155,74,0.3)',
            }}
          >
            {CUSTOM_FINAL_CTA.cta}
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
