import OptimizedImage from '@/components/ui/OptimizedImage'

export default function ProductsHero() {
  return (
    <section
      className="relative overflow-hidden flex items-end px-12 max-lg:px-6"
      style={{
        height:        '52vh',
        minHeight:     380,
        background:    '#1a1310',
        paddingBottom: 56,
      }}
    >
      <div className="absolute inset-0">
        <div className="relative w-full h-full fill-frame">
          <OptimizedImage
            src="/images/tgi-banner-6.webp"
            alt="Premium handmade carpet collections — Tapis Global International"
            fill
            priority
            tone="hero"
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>

      <div
        className="absolute inset-0 z-[2]"
        style={{ background: 'linear-gradient(to top, rgba(26,19,16,0.82) 0%, rgba(26,19,16,0.35) 100%)' }}
      />

      <div className="relative z-[3] max-w-3xl">
        <div
          className="flex items-center gap-3 text-[15px] tracking-[0.38em] uppercase mb-4"
          style={{ color: 'var(--gl)' }}
        >
          <span className="block h-px w-8" style={{ background: 'var(--g)' }} />
          Product Range
        </div>
        <h1
          className="font-display font-medium leading-[1.06]"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(36px, 4vw, 56px)',
            color: '#fff',
          }}
        >
          Nine Collections.
          <br />
          <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}>Every Interior.</em>
        </h1>
        <p className="mt-4 text-[16px] font-light leading-relaxed max-w-xl" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Luxury carpets for homes, hotels, offices, retail and designer projects — manufactured in Bhadohi for pan India supply and global markets.
        </p>
      </div>
    </section>
  )
}
