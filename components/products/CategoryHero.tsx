import Link from 'next/link'
import OptimizedImage from '@/components/ui/OptimizedImage'
import type { ProductCategory } from '@/lib/products'

export default function CategoryHero({ category }: { category: ProductCategory }) {
  return (
    <section className="relative overflow-hidden min-h-[56vh] max-lg:min-h-[48vh] flex items-end">
      <div className="absolute inset-0">
        <div className="relative w-full h-full fill-frame">
          <OptimizedImage
            src={category.heroImage}
            alt={`${category.name} manufacturer in India — Tapis Global International, Bhadohi`}
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
        style={{ background: 'linear-gradient(to top, rgba(10,8,6,0.95) 0%, rgba(10,8,6,0.45) 55%, rgba(10,8,6,0.25) 100%)' }}
      />
      <div className="relative z-[2] px-8 max-lg:px-5 pb-12 pt-24 max-w-3xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-2 text-[13px] tracking-[0.14em] uppercase" style={{ color: 'rgba(248,244,238,0.55)' }}>
            <li><Link href="/" className="hover:text-[var(--gl)] transition-colors">Home</Link></li>
            <li aria-hidden>›</li>
            <li><Link href="/products" className="hover:text-[var(--gl)] transition-colors">Products</Link></li>
            <li aria-hidden>›</li>
            <li aria-current="page" style={{ color: 'var(--gl)' }}>{category.name}</li>
          </ol>
        </nav>

        <p className="text-[15px] tracking-[0.32em] uppercase mb-3" style={{ color: 'var(--gl)' }}>
          Manufacturer · Supplier · Exporter
        </p>
        <h1
          className="font-display font-light leading-[1.05] mb-4"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(32px, 4vw, 56px)',
            color: '#fff',
          }}
        >
          {category.h1}
        </h1>
        <p className="text-[17px] font-light leading-[1.85] mb-7 max-w-2xl" style={{ color: 'rgba(248,244,238,0.62)' }}>
          {category.tagline}
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/catalogue"
            className="px-7 py-3.5 text-[14px] tracking-[0.18em] uppercase font-semibold transition-all duration-300 hover:brightness-110"
            style={{ background: 'var(--g)', color: 'var(--ink)' }}
          >
            Request Catalogue
          </Link>
          <Link
            href="/contact"
            className="px-7 py-3.5 text-[14px] tracking-[0.18em] uppercase font-medium border transition-all duration-300 hover:bg-white/10"
            style={{ borderColor: 'rgba(255,255,255,0.35)', color: '#fff' }}
          >
            Get Quote
          </Link>
        </div>
      </div>
    </section>
  )
}
