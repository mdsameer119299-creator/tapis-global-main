import Link from 'next/link'
import Image from 'next/image'
import { PRODUCT_CATEGORIES } from '@/lib/products'
import { Reveal, Eyebrow } from '@/components/ui'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'

export default function CategoryGrid() {
  return (
    <section
      className="px-12 max-lg:px-6 py-20 lg:py-28"
      style={{ background: 'linear-gradient(180deg, #f5f0e8 0%, var(--iv) 100%)' }}
    >
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <Eyebrow>Our Range</Eyebrow>
          <h2
            className="font-medium leading-[1.06] mb-4"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(32px, 3.5vw, 48px)',
              color: 'var(--ink)',
            }}
          >
            Nine Disciplines of
            <em style={{ fontStyle: 'italic', color: 'var(--c)' }}> Floor Artistry</em>
          </h2>
          <p className="text-[17px] font-light leading-[1.85] max-w-2xl mb-14" style={{ color: 'var(--inkm)' }}>
            Select a collection to explore craftsmanship, materials, project applications and specifications — each category manufactured in our Bhadohi campus.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {PRODUCT_CATEGORIES.map((cat, i) => (
            <Reveal key={cat.slug} delay={i * 40}>
              <Link
                href={`/products/${cat.slug}`}
                className="group block relative overflow-hidden rounded-xl aspect-[4/5] sm:aspect-[3/4]"
                style={{
                  boxShadow: '0 8px 32px rgba(26,19,16,0.08)',
                  border: '1px solid rgba(192,155,74,0.12)',
                }}
              >
                <Image
                  src={cat.cardImage}
                  alt={cat.name}
                  fill
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                  quality={82}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
                  style={{ filter: 'brightness(0.88) saturate(0.92) sepia(0.04)' }}
                />

                <div
                  className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: 'linear-gradient(to top, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.25) 45%, rgba(10,8,6,0.15) 100%)',
                    opacity: 0.85,
                  }}
                />

                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ boxShadow: 'inset 0 0 60px rgba(192,155,74,0.15)' }}
                />

                <div className="absolute bottom-0 left-0 right-0 p-7 z-[2]">
                  <p
                    className="text-[15px] tracking-[0.28em] uppercase mb-2 opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-2 group-hover:translate-y-0"
                    style={{ color: 'var(--gp)' }}
                  >
                    Explore Collection
                  </p>
                  <h3
                    className="font-medium leading-[1.1] mb-3"
                    style={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: 'clamp(22px, 2.2vw, 28px)',
                      color: '#fff',
                    }}
                  >
                    {cat.name}
                  </h3>
                  <span
                    className="inline-flex items-center gap-2 text-[15px] tracking-[0.2em] uppercase font-medium transition-all duration-300 group-hover:gap-3"
                    style={{ color: 'var(--gl)' }}
                  >
                    View Details
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
