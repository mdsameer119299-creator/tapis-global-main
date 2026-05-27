import OptimizedImage from '@/components/ui/OptimizedImage'
import { ABOUT_HERO } from '@/lib/about'

export default function AboutHero() {
  return (
    <section
      className="relative overflow-hidden flex flex-col justify-end min-h-[92vh] max-lg:min-h-[78vh]"
      style={{ background: '#080605' }}
    >
      <div className="absolute inset-0">
        <div className="relative w-full h-full fill-frame">
          <OptimizedImage
            src={ABOUT_HERO.image}
            alt={ABOUT_HERO.imageAlt}
            fill
            priority
            tone="hero"
            sizes="100vw"
            className="object-cover object-center scale-[1.08] animate-[kbzoom_16s_ease-out_forwards]"
          />
        </div>
      </div>

      {/* Cinematic multi-layer overlay */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 75% 20%, rgba(107,31,31,0.28) 0%, transparent 55%),
            radial-gradient(ellipse 60% 50% at 10% 90%, rgba(192,155,74,0.12) 0%, transparent 50%),
            linear-gradient(to top, rgba(8,6,5,0.97) 0%, rgba(8,6,5,0.55) 42%, rgba(8,6,5,0.72) 100%)
          `,
        }}
      />

      {/* Vertical gold accent line */}
      <div
        className="absolute left-12 max-lg:left-6 top-0 bottom-0 w-px z-[3] opacity-20 max-lg:hidden"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--g), transparent)' }}
      />

      <div className="relative z-[4] px-12 max-lg:px-6 pb-20 pt-36 max-w-6xl">
        <div
          className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 text-[10px] tracking-[0.32em] uppercase border"
          style={{
            borderColor: 'rgba(192,155,74,0.35)',
            background:  'rgba(13,10,8,0.45)',
            backdropFilter: 'blur(8px)',
            color: 'var(--gp)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--g)' }} />
          {ABOUT_HERO.subtitle}
        </div>

        <p
          className="text-[10px] tracking-[0.42em] uppercase mb-5"
          style={{ color: 'var(--gl)' }}
        >
          {ABOUT_HERO.eyebrow}
        </p>

        <h1
          className="font-display font-light leading-[1.0] tracking-tight mb-7 max-w-4xl"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(48px, 7vw, 96px)',
            color: '#fff',
            textShadow: '0 4px 48px rgba(0,0,0,0.5)',
          }}
        >
          {ABOUT_HERO.title}
          <br />
          <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}>{ABOUT_HERO.titleEm}</em>
        </h1>

        <p
          className="text-[16px] font-light leading-[1.92] max-w-2xl mb-14"
          style={{ color: 'rgba(255,255,255,0.58)' }}
        >
          {ABOUT_HERO.lead}
        </p>

        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-0 max-w-3xl pt-8"
          style={{ borderTop: '1px solid rgba(192,155,74,0.25)' }}
        >
          {ABOUT_HERO.stats.map((stat, i) => (
            <div
              key={stat.label}
              className="pt-6 pr-4 sm:pr-6"
              style={{
                borderRight: i < ABOUT_HERO.stats.length - 1 ? '1px solid rgba(192,155,74,0.15)' : 'none',
              }}
            >
              <p
                className="font-display font-normal leading-none"
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: 'clamp(28px, 2.8vw, 42px)',
                  color: 'var(--gp)',
                }}
              >
                {stat.value}
                {stat.suffix && (
                  <sup style={{ fontSize: 14, color: 'var(--g)', verticalAlign: 'super' }}>{stat.suffix}</sup>
                )}
              </p>
              <p
                className="text-[9px] tracking-[0.16em] uppercase mt-2 leading-snug"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-12 max-lg:left-6 z-[4] flex items-center gap-3 max-lg:hidden">
        <div
          className="w-px h-10"
          style={{
            background: 'linear-gradient(to bottom, var(--g), transparent)',
            animation: 'scpulse 2.2s ease infinite',
          }}
        />
        <span
          className="text-[9px] tracking-[0.32em] uppercase"
          style={{ color: 'rgba(255,255,255,0.28)', writingMode: 'vertical-rl' }}
        >
          Scroll
        </span>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-[5] h-px"
        style={{ background: 'linear-gradient(to right, transparent 5%, var(--g) 50%, transparent 95%)' }}
      />
    </section>
  )
}
