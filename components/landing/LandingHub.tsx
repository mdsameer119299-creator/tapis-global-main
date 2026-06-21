import Link from 'next/link'
import Image from 'next/image'
import type { SeoLanding } from '@/lib/seo-landing'
import { Reveal, Eyebrow } from '@/components/ui'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'

type Props = {
  eyebrow:    string
  title:      string
  titleEm:    string
  intro:      string
  basePath:   string   // '/industries' | '/solutions'
  pages:      SeoLanding[]
}

export default function LandingHub({ eyebrow, title, titleEm, intro, basePath, pages }: Props) {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden flex flex-col justify-end min-h-[46vh] max-lg:min-h-[40vh]" style={{ background: '#0a0806' }}>
        <div className="absolute inset-0">
          <div className="relative w-full h-full fill-frame">
            <Image src="/images/tgi-banner-4.webp" alt={title} fill priority quality={80} sizes="100vw" className="object-cover object-center" style={{ filter: 'brightness(0.5) saturate(0.9)' }} />
          </div>
        </div>
        <div className="absolute inset-0 z-[2]" style={{ background: 'linear-gradient(to top, rgba(10,8,6,0.95) 0%, rgba(10,8,6,0.45) 60%, rgba(10,8,6,0.6) 100%)' }} />
        <div className="relative z-[3] footer-container pb-14 pt-32 max-w-4xl">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-2 text-[13px] tracking-[0.14em] uppercase" style={{ color: 'rgba(248,244,238,0.55)' }}>
              <li><Link href="/" className="hover:text-[var(--gl)] transition-colors">Home</Link></li>
              <li aria-hidden>›</li>
              <li aria-current="page" style={{ color: 'var(--gl)' }}>{title} {titleEm}</li>
            </ol>
          </nav>
          <div className="flex items-center gap-3 text-[15px] tracking-[0.38em] uppercase mb-5" style={{ color: 'var(--gl)' }}>
            <span className="block h-px w-8" style={{ background: 'var(--g)' }} />
            {eyebrow}
          </div>
          <h1 className="font-display font-light leading-[1.05] mb-6" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(38px, 5vw, 64px)', color: '#fff' }}>
            {title} <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}>{titleEm}</em>
          </h1>
          <p className="text-[18px] font-light leading-[1.9] max-w-2xl" style={{ color: 'rgba(248,244,238,0.6)' }}>{intro}</p>
        </div>
      </section>

      {/* Grid */}
      <section className="footer-container py-16 lg:py-24" style={{ background: 'linear-gradient(180deg, #f5f0e8 0%, var(--iv) 100%)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {pages.map((p, i) => (
            <Reveal key={p.slug} delay={i * 40}>
              <Link href={`${basePath}/${p.slug}`} className="group block relative overflow-hidden rounded-xl aspect-[4/5] sm:aspect-[3/4]" style={{ boxShadow: '0 8px 32px rgba(26,19,16,0.08)', border: '1px solid rgba(192,155,74,0.12)' }}>
                <Image src={p.heroImage} alt={p.h1} fill loading="lazy" placeholder="blur" blurDataURL={BLUR_PLACEHOLDER} quality={80} sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]" style={{ filter: 'brightness(0.86) saturate(0.92) sepia(0.04)' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.25) 50%, transparent 100%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-7 z-[2]">
                  <p className="text-[14px] tracking-[0.24em] uppercase mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: 'var(--gp)' }}>{p.eyebrow}</p>
                  <h2 className="font-medium leading-[1.1] mb-3" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(21px, 2.2vw, 27px)', color: '#fff' }}>{p.label}</h2>
                  <span className="inline-flex items-center gap-2 text-[14px] tracking-[0.18em] uppercase font-medium transition-all duration-300 group-hover:gap-3" style={{ color: 'var(--gl)' }}>View Details <span aria-hidden>→</span></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
