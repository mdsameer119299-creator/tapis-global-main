import Link from 'next/link'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { CUSTOM_HERO } from '@/lib/custom'

export default function CustomHero() {
  return (
    <section
      className="relative overflow-hidden flex flex-col justify-end min-h-[92vh] max-lg:min-h-[80vh]"
      style={{ background: '#0a0806' }}
    >
      <div className="absolute inset-0">
        <div className="relative w-full h-full fill-frame">
          <OptimizedImage
            src={CUSTOM_HERO.image}
            alt={CUSTOM_HERO.imageAlt}
            fill
            priority
            tone="hero"
            sizes="100vw"
            className="object-cover object-center scale-[1.06] animate-[kbzoom_18s_ease-out_forwards]"
          />
        </div>
      </div>

      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 80% 15%, rgba(192,155,74,0.14) 0%, transparent 55%),
            radial-gradient(ellipse 50% 45% at 5% 85%, rgba(107,31,31,0.22) 0%, transparent 50%),
            linear-gradient(to top, rgba(10,8,6,0.98) 0%, rgba(10,8,6,0.45) 45%, rgba(10,8,6,0.65) 100%)
          `,
        }}
      />

      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 z-[2] opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-[4] px-12 max-lg:px-6 pb-20 pt-36 max-w-5xl">
        <div
          className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 text-[10px] tracking-[0.32em] uppercase border rounded-sm"
          style={{
            borderColor: 'rgba(212,181,116,0.35)',
            background:  'rgba(10,8,6,0.5)',
            backdropFilter: 'blur(10px)',
            color: 'var(--gp)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--g)' }} />
          {CUSTOM_HERO.eyebrow}
        </div>

        <h1
          className="font-display font-light leading-[1.02] tracking-tight mb-7"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(44px, 6.5vw, 88px)',
            color: '#fff',
          }}
        >
          {CUSTOM_HERO.title}
          <br />
          <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}>{CUSTOM_HERO.titleEm}</em>
        </h1>

        <p
          className="text-[16px] font-light leading-[1.92] max-w-2xl mb-12"
          style={{ color: 'rgba(248,244,238,0.62)' }}
        >
          {CUSTOM_HERO.lead}
        </p>

        <Link
          href={CUSTOM_HERO.ctaHref}
          className="inline-block px-11 py-4 text-[11px] tracking-[0.22em] uppercase font-semibold rounded-sm transition-all duration-400 hover:tracking-[0.26em] hover:brightness-110"
          style={{
            background: 'linear-gradient(135deg, var(--g) 0%, #a8843a 100%)',
            color: 'var(--ink)',
            boxShadow: '0 8px 32px rgba(192,155,74,0.25)',
          }}
        >
          {CUSTOM_HERO.cta}
        </Link>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-[5] h-px"
        style={{ background: 'linear-gradient(to right, transparent 5%, rgba(212,181,116,0.5) 50%, transparent 95%)' }}
      />
    </section>
  )
}
