import Image from 'next/image'
import { EXPORT_STATS, EXPORT_SEGMENTS } from '@/lib/data'
import { EXPORT_INLINE_STATS, MARKETS_HEADER } from '@/lib/home'
import { Reveal, Eyebrow } from '@/components/ui'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'
import CountryTicker from '@/components/home/CountryTicker'
import RegionTags from '@/components/home/RegionTags'

function SegmentIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    truck: (
      <>
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </>
    ),
    hotel: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />,
    label: (
      <>
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </>
    ),
  }

  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: 'var(--g)' }}>
      {icons[type] ?? icons.hotel}
    </svg>
  )
}

export default function Exports() {
  return (
    <section id="markets" style={{ background: '#fff' }}>

      {/* Stats strip */}
      <div style={{ background: 'var(--iv)', borderBottom: '1px solid var(--ivk)' }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {EXPORT_STATS.map((s, i) => (
            <div
              key={s.label}
              className="py-10 px-6 text-center transition-colors duration-300 hover:bg-[rgba(192,155,74,0.06)]"
              style={{
                borderRight:  i < EXPORT_STATS.length - 1 ? '1px solid var(--ivk)' : 'none',
                borderBottom: '1px solid var(--ivk)',
              }}
            >
              <p className="font-normal leading-none" style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 52, color: 'var(--c)' }}>
                {s.value}<sup style={{ fontSize: 20, color: 'var(--gd)', verticalAlign: 'super' }}>{s.suffix}</sup>
              </p>
              <p className="text-[14px] tracking-[0.18em] uppercase mt-2 font-medium" style={{ color: 'var(--inkm)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column split */}
      <div className="grid grid-cols-1 lg:grid-cols-2">

        <div className="relative overflow-hidden min-h-[500px] max-lg:min-h-[320px] group">
          <div className="absolute inset-0">
            <div className="relative w-full h-full fill-frame">
              <Image
                src="/images/tgi-banner-4.webp"
                alt="Luxury hospitality and commercial carpet projects — Tapis Global India"
                fill
                loading="lazy"
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
                quality={85}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-[800ms] group-hover:scale-[1.03]"
                style={{ filter: 'brightness(0.72) saturate(0.88) sepia(0.05)' }}
              />
            </div>
          </div>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(74,20,20,0.68) 0%, transparent 55%)' }} />
          <blockquote
            className="absolute bottom-10 left-10 right-10 z-[2] font-normal italic leading-[1.3]"
            style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(22px,2.2vw,26px)', color: 'rgba(237,217,154,0.88)' }}
          >
            &ldquo;{MARKETS_HEADER.quote}&rdquo;
          </blockquote>
        </div>

        <div className="px-12 max-lg:px-6 py-20 flex flex-col justify-center">
          <Reveal>
            <Eyebrow>{MARKETS_HEADER.eyebrow}</Eyebrow>
            <h2
              className="font-medium leading-[1.06] mb-10"
              style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(32px,3vw,48px)', color: 'var(--ink)' }}
            >
              {MARKETS_HEADER.title}
              <br />
              <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>{MARKETS_HEADER.titleEm}</em>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 pb-10" style={{ borderBottom: '1px solid var(--bd)' }}>
              {EXPORT_INLINE_STATS.map((s) => (
                <div key={s.label} className="text-center sm:text-left">
                  <p className="font-normal leading-none" style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 36, color: 'var(--c)' }}>
                    {s.value}<sup style={{ fontSize: 14, verticalAlign: 'super' }}>{s.suffix}</sup>
                  </p>
                  <p className="text-[15px] tracking-[0.12em] uppercase mt-1" style={{ color: 'var(--inkm)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-0">
              {EXPORT_SEGMENTS.map((seg, i) => (
                <div
                  key={seg.title}
                  className="py-4 grid grid-cols-[auto_1fr] gap-3.5 items-start"
                  style={{ borderBottom: i < EXPORT_SEGMENTS.length - 1 ? '1px solid var(--bd)' : 'none' }}
                >
                  <span className="mt-0.5">
                    <SegmentIcon type={seg.icon} />
                  </span>
                  <div>
                    <p className="text-[19px] font-medium mb-1" style={{ color: 'var(--ink)' }}>{seg.title}</p>
                    <p className="text-[15px] font-light leading-[1.7]" style={{ color: 'var(--inkm)' }}>{seg.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <RegionTags />
          </Reveal>
        </div>
      </div>

      {/* Country ticker */}
      <div className="py-16 overflow-hidden relative" style={{ background: 'var(--ink)' }}>
        <div className="px-12 max-lg:px-6 mb-8">
          <Reveal>
            <Eyebrow white>{MARKETS_HEADER.tickerTitle}</Eyebrow>
            <h3
              className="font-medium"
              style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(28px,2.8vw,40px)', color: '#fff' }}
            >
              {MARKETS_HEADER.tickerSubtitle}
            </h3>
          </Reveal>
        </div>
        <CountryTicker />
      </div>
    </section>
  )
}
