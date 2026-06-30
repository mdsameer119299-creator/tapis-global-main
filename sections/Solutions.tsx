import Image from 'next/image'
import Link from 'next/link'
import { SOLUTIONS_HEADER, SOLUTION_PILLARS, AUDIENCE_TAGS } from '@/lib/solutions'
import { Reveal, Eyebrow } from '@/components/ui'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'

export default function Solutions() {
  return (
    <section id="solutions" style={{ background: 'var(--iv)' }}>
      {/* Header */}
      <div className="px-5 sm:px-6 lg:px-12 pt-14 sm:pt-20 pb-12 sm:pb-14 max-w-[1280px] mx-auto">
        <Reveal>
          <Eyebrow>{SOLUTIONS_HEADER.eyebrow}</Eyebrow>
          <h2
            className="font-medium leading-[1.06] mb-7 max-w-3xl"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(36px, 3.8vw, 56px)', color: 'var(--ink)' }}
          >
            {SOLUTIONS_HEADER.title}
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>{SOLUTIONS_HEADER.titleEm}</em>
          </h2>
          <p className="text-[20px] font-light leading-[1.85] max-w-[58ch] mb-10" style={{ color: 'var(--inkm)' }}>
            {SOLUTIONS_HEADER.lead}
          </p>
          <div className="flex flex-wrap gap-2">
            {AUDIENCE_TAGS.map((tag) => (
              <span
                key={tag}
                className="px-3.5 py-1.5 text-[15px] tracking-[0.14em] uppercase font-medium border"
                style={{ borderColor: 'rgba(192,155,74,0.28)', color: 'var(--inks)', background: 'rgba(255,255,255,0.6)' }}
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-7 gap-y-3 mt-8">
            <Link href="/solutions" className="inline-flex items-center gap-3 text-[15px] tracking-[0.14em] uppercase transition-colors duration-200 hover:text-[var(--c)] group" style={{ color: 'var(--inks)' }}>
              Explore All Solutions <span className="block h-px w-8 bg-current transition-all duration-300 group-hover:w-12" />
            </Link>
            <Link href="/countries" className="inline-flex items-center gap-3 text-[15px] tracking-[0.14em] uppercase transition-colors duration-200 hover:text-[var(--c)] group" style={{ color: 'var(--inks)' }}>
              Export Markets <span className="block h-px w-8 bg-current transition-all duration-300 group-hover:w-12" />
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Solution pillars — alternating */}
      {SOLUTION_PILLARS.map((pillar, index) => {
        const imageRight = index % 2 === 1
        return (
          <div
            key={pillar.id}
            className="grid grid-cols-1 lg:grid-cols-2 min-h-[420px]"
            style={{ background: index % 2 === 0 ? '#fff' : 'var(--ivd)' }}
          >
            <div className={`relative overflow-hidden min-h-[320px] ${imageRight ? 'lg:order-2' : ''}`}>
              <div className="absolute inset-0">
                <div className="relative w-full h-full fill-frame">
                  <Image
                    src={pillar.image}
                    alt={pillar.imageAlt}
                    fill
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={BLUR_PLACEHOLDER}
                    quality={82}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center transition-transform duration-[800ms] hover:scale-[1.03]"
                    style={{ filter: 'brightness(0.88) saturate(0.92) sepia(0.04)' }}
                  />
                </div>
              </div>
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(26,19,16,0.35) 0%, transparent 50%)' }}
              />
            </div>

            <div className={`flex flex-col justify-center px-5 sm:px-6 lg:px-12 py-10 sm:py-14 lg:py-16 ${imageRight ? 'lg:order-1 lg:pl-16' : 'lg:pr-16'}`}>
              <Reveal direction={imageRight ? 'right' : 'left'}>
                <p className="text-[14px] tracking-[0.28em] uppercase mb-3 font-medium" style={{ color: 'var(--gd)' }}>
                  {pillar.eyebrow}
                </p>
                <h3
                  className="font-medium leading-[1.08] mb-5"
                  style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(28px, 2.8vw, 40px)', color: 'var(--ink)' }}
                >
                  {pillar.title}{' '}
                  <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>{pillar.titleEm}</em>
                </h3>
                <p className="text-[17px] font-light leading-[1.82] max-w-[58ch] mb-6" style={{ color: 'var(--inkm)' }}>
                  {pillar.desc}
                </p>
                <ul className="flex flex-col gap-2.5 mb-8">
                  {pillar.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-[18px] font-light leading-[1.7]" style={{ color: 'var(--inks)' }}>
                      <span className="mt-2 w-1.5 h-1.5 flex-shrink-0 rotate-45" style={{ background: 'var(--g)' }} />
                      {point}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 text-[15px] tracking-[0.14em] uppercase transition-colors duration-200 hover:text-[var(--c)] group"
                  style={{ color: 'var(--inks)' }}
                >
                  {pillar.cta}
                  <span className="block h-px w-8 bg-current transition-all duration-300 group-hover:w-12" />
                </Link>
              </Reveal>
            </div>
          </div>
        )
      })}
    </section>
  )
}
