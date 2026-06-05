import OptimizedImage from '@/components/ui/OptimizedImage'

type PageHeroProps = {
  eyebrow:   string
  title:     React.ReactNode
  lead?:     string
  image:     string
  imageAlt:  string
  priority?: boolean
}

export default function PageHero({
  eyebrow,
  title,
  lead,
  image,
  imageAlt,
  priority = false,
}: PageHeroProps) {
  return (
    <section
      className="relative overflow-hidden flex items-end px-5 sm:px-6 lg:px-12 max-lg:px-6"
      style={{
        height:        'min(52vh, 420px)',
        minHeight:     320,
        background:    '#1a1310',
        paddingBottom: 48,
      }}
    >
      <div className="absolute inset-0">
        <div className="relative w-full h-full fill-frame">
          <OptimizedImage
            src={image}
            alt={imageAlt}
            fill
            priority={priority}
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
          {eyebrow}
        </div>
        <h1
          className="font-display font-medium leading-[1.06]"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(36px, 4vw, 56px)',
            color: '#fff',
          }}
        >
          {title}
        </h1>
        {lead && (
          <p
            className="text-[17px] font-light leading-[1.85] max-w-xl mt-4"
            style={{ color: 'rgba(255,255,255,0.62)' }}
          >
            {lead}
          </p>
        )}
      </div>
    </section>
  )
}
