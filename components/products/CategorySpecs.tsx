import type { ProductCategory } from '@/lib/products'
import { Reveal, Eyebrow } from '@/components/ui'

export default function CategorySpecs({ category }: { category: ProductCategory }) {
  return (
    <section className="py-14 lg:py-16 px-8 max-lg:px-5" style={{ background: '#fff' }}>
      <Reveal>
        <Eyebrow>Technical Specifications</Eyebrow>
        <h2
          className="font-medium leading-[1.1] mb-8"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(26px, 2.8vw, 38px)', color: 'var(--ink)' }}
        >
          {category.name} <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>Specifications</em>
        </h2>
      </Reveal>

      <Reveal>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--bd)' }}
        >
          <table className="w-full border-collapse">
            <tbody>
              {category.techSpecs.map((spec, i) => (
                <tr
                  key={spec.label}
                  style={{ background: i % 2 === 0 ? 'var(--iv)' : '#fff' }}
                >
                  <th
                    scope="row"
                    className="text-left align-top px-5 sm:px-7 py-4 text-[14px] tracking-[0.1em] uppercase font-medium w-[42%] sm:w-[32%]"
                    style={{ color: 'var(--gd)', borderBottom: i < category.techSpecs.length - 1 ? '1px solid var(--bd)' : 'none' }}
                  >
                    {spec.label}
                  </th>
                  <td
                    className="px-5 sm:px-7 py-4 text-[16px] font-light"
                    style={{ color: 'var(--inks)', borderBottom: i < category.techSpecs.length - 1 ? '1px solid var(--bd)' : 'none' }}
                  >
                    {spec.value}
                  </td>
                </tr>
              ))}
              <tr style={{ background: category.techSpecs.length % 2 === 0 ? 'var(--iv)' : '#fff' }}>
                <th scope="row" className="text-left align-top px-5 sm:px-7 py-4 text-[14px] tracking-[0.1em] uppercase font-medium" style={{ color: 'var(--gd)', borderTop: '1px solid var(--bd)' }}>
                  MOQ
                </th>
                <td className="px-5 sm:px-7 py-4 text-[16px] font-light" style={{ color: 'var(--inks)', borderTop: '1px solid var(--bd)' }}>
                  {category.moq} · Lead time {category.leadTime}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[14px] font-light mt-4" style={{ color: 'var(--inkl)' }}>
          Specifications are indicative and fully customisable. Share your project requirement for an exact specification sheet.
        </p>
      </Reveal>
    </section>
  )
}
