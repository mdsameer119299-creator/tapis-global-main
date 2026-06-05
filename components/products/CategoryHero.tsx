import OptimizedImage from '@/components/ui/OptimizedImage'
import type { ProductCategory } from '@/lib/products'

export default function CategoryHero({ category }: { category: ProductCategory }) {
  return (
    <section className="relative overflow-hidden min-h-[44vh] max-lg:min-h-[38vh] flex items-end">
      <div className="absolute inset-0">
        <div className="relative w-full h-full fill-frame">
          <OptimizedImage
            src={category.heroImage}
            alt={category.name}
            fill
            priority
            tone="hero"
            sizes="(max-width: 1024px) 100vw, 75vw"
            className="object-cover"
          />
        </div>
      </div>
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(10,8,6,0.94) 0%, rgba(10,8,6,0.35) 100%)' }}
      />
      <div className="relative z-[2] px-8 max-lg:px-5 pb-12 pt-24 max-w-3xl">
        <p className="text-[15px] tracking-[0.32em] uppercase mb-3" style={{ color: 'var(--gl)' }}>
          Collection
        </p>
        <h1
          className="font-display font-light leading-[1.05] mb-4"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(32px, 3.8vw, 52px)',
            color: '#fff',
          }}
        >
          {category.name}
        </h1>
        <p className="text-[17px] font-light leading-[1.85]" style={{ color: 'rgba(248,244,238,0.55)' }}>
          {category.tagline}
        </p>
      </div>
    </section>
  )
}
