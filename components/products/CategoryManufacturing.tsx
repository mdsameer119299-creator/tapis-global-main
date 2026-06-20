import type { ProductCategory } from '@/lib/products'
import { Reveal, Eyebrow } from '@/components/ui'

export default function CategoryManufacturing({ category }: { category: ProductCategory }) {
  return (
    <section className="py-14 lg:py-16 px-8 max-lg:px-5" style={{ background: 'var(--iv)' }}>
      {/* Manufacturing process */}
      <Reveal>
        <Eyebrow>Manufacturing Capabilities</Eyebrow>
        <h2
          className="font-medium leading-[1.1] mb-3"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(26px, 2.8vw, 38px)', color: 'var(--ink)' }}
        >
          How We Manufacture <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>{category.name}</em>
        </h2>
        <p className="text-[16px] font-light leading-[1.85] max-w-2xl mb-10" style={{ color: 'var(--inkm)' }}>
          Every stage is controlled in-house at our integrated Bhadohi facility — giving project teams a single
          accountable manufacturer for quality, consistency and customisation.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
        {category.process.map((p, i) => (
          <Reveal key={p.step} delay={i * 50}>
            <div
              className="h-full rounded-lg p-6"
              style={{ background: '#fff', border: '1px solid var(--bd)' }}
            >
              <p
                className="font-display leading-none mb-3"
                style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40, color: 'rgba(192,155,74,0.5)' }}
              >
                {p.step}
              </p>
              <h3 className="text-[16px] font-medium mb-2" style={{ color: 'var(--inks)' }}>{p.title}</h3>
              <p className="text-[14.5px] font-light leading-[1.72]" style={{ color: 'var(--inkm)' }}>{p.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Customization options */}
      <Reveal>
        <Eyebrow>Customisation Options</Eyebrow>
        <h2
          className="font-medium leading-[1.1] mb-8"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(24px, 2.6vw, 34px)', color: 'var(--ink)' }}
        >
          Made to Your Specification
        </h2>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
        {category.customization.map((c, i) => (
          <Reveal key={c} delay={i * 30}>
            <div className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid var(--bd)' }}>
              <span style={{ color: 'var(--g)', fontSize: 15 }} aria-hidden>✓</span>
              <span className="text-[16px] font-light leading-[1.6]" style={{ color: 'var(--inkm)' }}>{c}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
