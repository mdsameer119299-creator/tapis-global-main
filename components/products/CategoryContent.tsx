import type { ProductCategory } from '@/lib/products'
import { Reveal, Eyebrow } from '@/components/ui'

export default function CategoryContent({ category }: { category: ProductCategory }) {
  return (
    <section className="py-14 lg:py-16 px-8 max-lg:px-5" style={{ background: 'var(--iv)' }}>
      <Reveal>
        <Eyebrow>Craftsmanship</Eyebrow>
        <p className="text-[16px] font-light leading-[1.9] mb-5 max-w-3xl" style={{ color: 'var(--inkm)' }}>
          {category.intro}
        </p>
        <p className="text-[15px] font-light leading-[1.88] mb-10 max-w-3xl" style={{ color: 'var(--inkm)' }}>
          {category.body}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          <ul className="flex flex-col gap-4">
            {category.bullets.map((b) => (
              <li key={b.label} className="flex items-start gap-3 text-[14px] font-light leading-[1.78]" style={{ color: 'var(--inkm)' }}>
                <span className="w-1 h-1 rounded-full flex-shrink-0 mt-2.5" style={{ background: 'var(--g)' }} />
                <span>
                  <strong className="font-medium" style={{ color: 'var(--inks)' }}>{b.label}:</strong>{' '}
                  {b.text}
                </span>
              </li>
            ))}
          </ul>

          <div
            className="rounded-xl p-7"
            style={{ background: '#fff', border: '1px solid var(--bd)', boxShadow: '0 8px 32px rgba(26,19,16,0.04)' }}
          >
            <p className="text-[10px] tracking-[0.24em] uppercase mb-4 font-medium" style={{ color: 'var(--gd)' }}>
              Specifications
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-[9px] tracking-[0.14em] uppercase mb-1" style={{ color: 'var(--inkl)' }}>MOQ</p>
                <p className="text-[15px] font-medium" style={{ color: 'var(--inks)' }}>{category.moq}</p>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.14em] uppercase mb-1" style={{ color: 'var(--inkl)' }}>Lead Time</p>
                <p className="text-[15px] font-medium" style={{ color: 'var(--inks)' }}>{category.leadTime}</p>
              </div>
            </div>
            <p className="text-[10px] tracking-[0.2em] uppercase mb-2 font-medium" style={{ color: 'var(--gd)' }}>Materials</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {category.materials.map((m) => (
                <span key={m} className="px-3 py-1 text-[11px] rounded-sm" style={{ background: 'rgba(192,155,74,0.1)', color: 'var(--inkm)' }}>
                  {m}
                </span>
              ))}
            </div>
            <p className="text-[10px] tracking-[0.2em] uppercase mb-2 font-medium" style={{ color: 'var(--gd)' }}>Ideal For</p>
            <div className="flex flex-wrap gap-2">
              {category.idealFor.map((u) => (
                <span key={u} className="px-3 py-1 text-[11px] rounded-sm border" style={{ borderColor: 'var(--bd)', color: 'var(--inkm)' }}>
                  {u}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
