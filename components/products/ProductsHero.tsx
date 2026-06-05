import OptimizedImage from '@/components/ui/OptimizedImage'

export default function ProductsHero() {
  return (
    <section
      className="relative overflow-hidden flex flex-col justify-end min-h-[58vh] max-lg:min-h-[50vh]"
      style={{ background: '#0a0806' }}
    >
      <div className="absolute inset-0">
        <div className="relative w-full h-full fill-frame">
          <OptimizedImage
            src="/images/tgi-banner-6.webp"
            alt="Luxury carpet collections — Tapis Global International"
            fill
            priority
            tone="hero"
            sizes="100vw"
            className="object-cover object-center scale-[1.05] animate-[kbzoom_18s_ease-out_forwards]"
          />
        </div>
      </div>

      <div
        className="absolute inset-0 z-[2]"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 70% 20%, rgba(192,155,74,0.12) 0%, transparent 55%),
            linear-gradient(to top, rgba(10,8,6,0.96) 0%, rgba(10,8,6,0.4) 50%, rgba(10,8,6,0.55) 100%)
          `,
        }}
      />

      <div className="relative z-[3] px-12 max-lg:px-6 pb-16 pt-32 max-w-4xl">
        <div
          className="flex items-center gap-3 text-[15px] tracking-[0.38em] uppercase mb-5"
          style={{ color: 'var(--gl)' }}
        >
          <span className="block h-px w-8" style={{ background: 'var(--g)' }} />
          Tapis Global International
        </div>
        <h1
          className="font-display font-light leading-[1.02] tracking-tight mb-6"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(40px, 5.5vw, 72px)',
            color: '#fff',
          }}
        >
          Luxury Carpet
          <br />
          <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}>Collections</em>
        </h1>
        <p
          className="text-[18px] font-light leading-[1.9] max-w-2xl"
          style={{ color: 'rgba(248,244,238,0.58)' }}
        >
          Explore handcrafted elegance designed for modern interiors, hospitality spaces, and premium living.
        </p>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-[4] h-px"
        style={{ background: 'linear-gradient(to right, transparent 5%, rgba(212,181,116,0.45) 50%, transparent 95%)' }}
      />
    </section>
  )
}
