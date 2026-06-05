import OptimizedImage from '@/components/ui/OptimizedImage'
import { CATALOGUE_HERO } from '@/lib/catalogue'

export default function CatalogueHero() {
  return (
    <section
      className="relative overflow-hidden flex flex-col justify-end min-h-[52vh] max-lg:min-h-[46vh]"
      style={{ background: '#0a0806' }}
    >
      <div className="absolute inset-0">
        <div className="relative w-full h-full fill-frame">
          <OptimizedImage
            src={CATALOGUE_HERO.image}
            alt={CATALOGUE_HERO.imageAlt}
            fill
            priority
            tone="hero"
            sizes="100vw"
            className="object-cover object-center scale-[1.04] animate-[kbzoom_18s_ease-out_forwards]"
          />
        </div>
      </div>

      <div
        className="absolute inset-0 z-[2]"
        style={{
          background: `
            radial-gradient(ellipse 55% 45% at 85% 15%, rgba(192,155,74,0.14) 0%, transparent 55%),
            linear-gradient(to top, rgba(10,8,6,0.97) 0%, rgba(10,8,6,0.45) 50%, rgba(10,8,6,0.6) 100%)
          `,
        }}
      />

      <div className="relative z-[3] px-12 max-lg:px-6 pb-14 pt-28 max-w-4xl">
        <p className="text-[15px] tracking-[0.38em] uppercase mb-4" style={{ color: 'var(--gl)' }}>
          {CATALOGUE_HERO.eyebrow}
        </p>
        <h1
          className="font-display font-light leading-[1.08] tracking-tight mb-5 max-w-3xl"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(36px, 4.8vw, 58px)',
            color: '#fff',
          }}
        >
          Request Our Luxury{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}>Carpet Catalogue</em>
        </h1>
        <p className="text-[18px] font-light leading-[1.9] max-w-2xl" style={{ color: 'rgba(248,244,238,0.58)' }}>
          {CATALOGUE_HERO.lead}
        </p>
      </div>
    </section>
  )
}
