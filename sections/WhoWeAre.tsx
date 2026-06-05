import Image from 'next/image'
import Link from 'next/link'
import { WHO_WE_ARE } from '@/lib/home'
import { Reveal, Eyebrow } from '@/components/ui'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'

function PointIcon({ type }: { type: 'factory' | 'globe' | 'layers' }) {
  const paths = {
    factory: (
      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 010 20" />
      </>
    ),
    layers: (
      <>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </>
    ),
  }

  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  )
}

export default function WhoWeAre() {
  const badgeLines = WHO_WE_ARE.badgeLbl.split('\n')

  return (
    <section
      id="about"
      className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh] overflow-hidden"
    >
      {/* Image column */}
      <div className="relative overflow-hidden min-h-[420px] lg:min-h-[500px] group" style={{ background: '#1a1310' }}>
        <div className="absolute inset-0 transition-transform duration-[800ms] ease-out group-hover:scale-[1.03]">
          <div className="relative w-full h-full fill-frame">
            <Image
              src={WHO_WE_ARE.image}
              alt="Master artisan weaving premium carpet — Tapis Global Bhadohi"
              fill
              loading="lazy"
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              quality={78}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
              style={{ filter: 'brightness(0.82) saturate(0.88) sepia(0.06)' }}
            />
          </div>
        </div>

        <div
          className="absolute bottom-8 right-4 sm:bottom-10 sm:right-6 z-[2] text-center px-5 sm:px-7 py-5 sm:py-6 min-w-[130px] sm:min-w-[150px] max-w-[calc(100%-2rem)]"
          style={{
            background:   'var(--c)',
            color:        '#fff',
            boxShadow:    '0 12px 40px rgba(107,31,31,0.35)',
          }}
        >
          <div
            className="font-normal leading-none mb-1"
            style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 42 }}
          >
            {WHO_WE_ARE.badgeNum}
          </div>
          <div className="text-[15px] tracking-[0.14em] uppercase leading-snug">
            {badgeLines.map((line, i) => (
              <span key={line}>
                {line}
                {i < badgeLines.length - 1 && <br />}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content column */}
      <div className="flex flex-col justify-center px-10 max-lg:px-6 py-16 lg:py-24 lg:pl-16 lg:pr-[4.5rem] bg-white">
        <Reveal direction="right">
          <Eyebrow>Who We Are</Eyebrow>
          <h2
            className="font-medium leading-[1.06] tracking-tight mb-7"
            style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(36px,3.8vw,56px)', color: 'var(--ink)' }}
          >
            {WHO_WE_ARE.headline}
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>{WHO_WE_ARE.headlineEm}</em>
          </h2>
          <p
            className={`text-[20px] font-light leading-[1.85] max-w-[58ch] ${WHO_WE_ARE.lead2 ? 'mb-5' : 'mb-12'}`}
            style={{ color: 'var(--inkm)' }}
          >
            {WHO_WE_ARE.lead}
          </p>
          {WHO_WE_ARE.lead2 ? (
            <p className="text-[20px] font-light leading-[1.85] max-w-[58ch] mb-12" style={{ color: 'var(--inkm)' }}>
              {WHO_WE_ARE.lead2}
            </p>
          ) : null}

          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--bd)' }}>
            {WHO_WE_ARE.points.map((pt, i) => (
              <Reveal key={pt.title} delay={i * 100}>
                <div
                  className="grid grid-cols-[auto_1fr] gap-4 py-6 first:pt-0"
                  style={{ borderColor: 'var(--bd)' }}
                >
                  <div
                    className="w-11 h-11 flex items-center justify-center flex-shrink-0 border"
                    style={{ borderColor: 'var(--bd)', color: 'var(--g)' }}
                  >
                    <PointIcon type={pt.icon} />
                  </div>
                  <div>
                    <p className="text-[17px] font-medium mb-1.5" style={{ color: 'var(--ink)' }}>
                      {pt.title}
                    </p>
                    <p className="text-[16px] font-light leading-[1.78]" style={{ color: 'var(--inkm)' }}>
                      {pt.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/about"
              className="inline-flex items-center gap-3 text-[14px] tracking-[0.14em] uppercase transition-colors duration-200 hover:text-[var(--gd)] group"
              style={{ color: 'var(--inks)' }}
            >
              Discuss Your Project
              <span className="block h-px w-9 bg-current transition-all duration-300 group-hover:w-14" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
