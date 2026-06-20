import type { ProductCategory } from '@/lib/products'
import { Reveal, Eyebrow } from '@/components/ui'

export default function CategoryFAQ({ category }: { category: ProductCategory }) {
  return (
    <section className="py-14 lg:py-16 px-8 max-lg:px-5" style={{ background: 'var(--iv)' }}>
      <Reveal>
        <Eyebrow>Frequently Asked Questions</Eyebrow>
        <h2
          className="font-medium leading-[1.1] mb-8"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(26px, 2.8vw, 38px)', color: 'var(--ink)' }}
        >
          {category.name} — <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>Buyer FAQs</em>
        </h2>
      </Reveal>

      <div className="max-w-3xl flex flex-col gap-3">
        {category.faqs.map((faq, i) => (
          <Reveal key={faq.q} delay={i * 25}>
            <details
              className="group rounded-lg overflow-hidden"
              style={{ background: '#fff', border: '1px solid var(--bd)' }}
            >
              <summary
                className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-5 text-[16.5px] font-medium select-none"
                style={{ color: 'var(--inks)' }}
              >
                <span>{faq.q}</span>
                <span
                  className="flex-shrink-0 text-[22px] leading-none transition-transform duration-300 group-open:rotate-45"
                  style={{ color: 'var(--g)' }}
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <div className="px-6 pb-5 -mt-1">
                <p className="text-[15.5px] font-light leading-[1.8]" style={{ color: 'var(--inkm)' }}>
                  {faq.a}
                </p>
              </div>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
