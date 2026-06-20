import Link from 'next/link'
import Image from 'next/image'
import { getRelatedCategories } from '@/lib/products'
import { Reveal, Eyebrow } from '@/components/ui'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'

export default function RelatedProducts({ slug }: { slug: string }) {
  const related = getRelatedCategories(slug)
  if (related.length === 0) return null

  return (
    <section className="py-14 lg:py-16 px-8 max-lg:px-5" style={{ background: '#fff' }}>
      <Reveal>
        <Eyebrow>Related Products</Eyebrow>
        <h2
          className="font-medium leading-[1.1] mb-3"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(26px, 2.8vw, 38px)', color: 'var(--ink)' }}
        >
          Explore More <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>Collections</em>
        </h2>
        <p className="text-[16px] font-light leading-[1.85] max-w-2xl mb-10" style={{ color: 'var(--inkm)' }}>
          Discover other carpet and rug categories manufactured at our Bhadohi facility.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {related.map((cat, i) => (
          <Reveal key={cat.slug} delay={i * 50}>
            <Link
              href={`/products/${cat.slug}`}
              className="group block relative overflow-hidden rounded-xl aspect-[4/5]"
              style={{ boxShadow: '0 8px 32px rgba(26,19,16,0.08)', border: '1px solid rgba(192,155,74,0.12)' }}
            >
              <Image
                src={cat.cardImage}
                alt={`${cat.name} manufacturer India — Tapis Global`}
                fill
                loading="lazy"
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
                quality={80}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
                style={{ filter: 'brightness(0.86) saturate(0.92) sepia(0.04)' }}
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.2) 55%, transparent 100%)' }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-[2]">
                <h3
                  className="font-medium leading-[1.1] mb-2"
                  style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(20px, 2vw, 26px)', color: '#fff' }}
                >
                  {cat.name}
                </h3>
                <span
                  className="inline-flex items-center gap-2 text-[14px] tracking-[0.18em] uppercase font-medium transition-all duration-300 group-hover:gap-3"
                  style={{ color: 'var(--gl)' }}
                >
                  View Details <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-3 text-[15px] tracking-[0.16em] uppercase transition-colors duration-200 hover:text-[var(--c)] group"
            style={{ color: 'var(--inks)' }}
          >
            View All Carpet &amp; Rug Collections
            <span className="block h-px w-8 bg-current transition-all duration-300 group-hover:w-12" />
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
