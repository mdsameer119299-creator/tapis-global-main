import type { ProductCategory } from '@/lib/products'
import { Reveal, Eyebrow } from '@/components/ui'

export default function CategoryApplications({ category }: { category: ProductCategory }) {
  return (
    <section className="py-14 lg:py-16 px-8 max-lg:px-5" style={{ background: '#fff' }}>
      <Reveal>
        <Eyebrow>Applications</Eyebrow>
        <h2
          className="font-medium leading-[1.1] mb-3"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(26px, 2.8vw, 38px)', color: 'var(--ink)' }}
        >
          Where Our {category.name} <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>Perform Best</em>
        </h2>
        <p className="text-[16px] font-light leading-[1.85] max-w-2xl mb-10" style={{ color: 'var(--inkm)' }}>
          Trusted by architects, interior designers, hotels, builders, developers and procurement teams across India
          and international projects.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {category.applications.map((app, i) => (
          <Reveal key={app.title} delay={i * 50}>
            <div
              className="h-full rounded-lg p-7 transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: 'var(--iv)', border: '1px solid var(--bd)' }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 mt-1 w-2 h-2 rotate-45"
                  style={{ background: 'var(--g)' }}
                  aria-hidden
                />
                <div>
                  <h3 className="text-[18px] font-medium mb-2" style={{ color: 'var(--inks)' }}>{app.title}</h3>
                  <p className="text-[15px] font-light leading-[1.78]" style={{ color: 'var(--inkm)' }}>{app.desc}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
