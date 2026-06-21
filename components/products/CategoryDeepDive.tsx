import Link from 'next/link'
import type { ProductCategory } from '@/lib/products'
import { getGuide } from '@/lib/guides'
import { Reveal, Eyebrow } from '@/components/ui'

export default function CategoryDeepDive({ category }: { category: ProductCategory }) {
  const guides = (category.relatedGuides ?? [])
    .map((s) => getGuide(s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))

  const hasDeep = (category.deepDive?.length ?? 0) > 0
  const hasMat  = (category.materialDetails?.length ?? 0) > 0
  const hasUse  = (category.useCases?.length ?? 0) > 0
  const hasExp  = (category.exportInfo?.length ?? 0) > 0

  if (!hasDeep && !hasMat && !hasUse && !hasExp && guides.length === 0) return null

  return (
    <section className="py-14 lg:py-16 px-8 max-lg:px-5" style={{ background: 'var(--iv)' }}>
      {/* Deep dive editorial */}
      {hasDeep && (
        <div className="mb-14">
          <Reveal>
            <Eyebrow>In Depth</Eyebrow>
            <h2
              className="font-medium leading-[1.12] mb-6 max-w-3xl"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(24px, 2.6vw, 34px)', color: 'var(--ink)' }}
            >
              Understanding {category.name}
            </h2>
          </Reveal>
          <div className="flex flex-col gap-5 max-w-3xl">
            {category.deepDive!.map((p, i) => (
              <Reveal key={i} delay={i * 30}>
                <p className="text-[17px] font-light leading-[1.9]" style={{ color: 'var(--inkm)' }}>{p}</p>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {/* Materials in detail */}
      {hasMat && (
        <div className="mb-14">
          <Reveal>
            <Eyebrow>Material Specifications</Eyebrow>
            <h2
              className="font-medium leading-[1.12] mb-8"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(24px, 2.6vw, 34px)', color: 'var(--ink)' }}
            >
              Materials in Detail
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {category.materialDetails!.map((m, i) => (
              <Reveal key={m.name} delay={i * 40}>
                <div className="h-full rounded-lg p-6" style={{ background: '#fff', border: '1px solid var(--bd)' }}>
                  <h3 className="text-[17px] font-medium mb-2" style={{ color: 'var(--inks)' }}>{m.name}</h3>
                  <p className="text-[15px] font-light leading-[1.78]" style={{ color: 'var(--inkm)' }}>{m.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {/* Use cases */}
      {hasUse && (
        <div className="mb-14">
          <Reveal>
            <Eyebrow>Use Cases</Eyebrow>
            <h2
              className="font-medium leading-[1.12] mb-8"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(24px, 2.6vw, 34px)', color: 'var(--ink)' }}
            >
              How Clients Use {category.name}
            </h2>
          </Reveal>
          <div className="flex flex-col gap-3 max-w-3xl">
            {category.useCases!.map((u, i) => (
              <Reveal key={u.title} delay={i * 30}>
                <div className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid var(--bd)' }}>
                  <span className="flex-shrink-0 mt-1.5 w-2 h-2 rotate-45" style={{ background: 'var(--g)' }} aria-hidden />
                  <p className="text-[16px] font-light leading-[1.75]" style={{ color: 'var(--inkm)' }}>
                    <strong className="font-medium" style={{ color: 'var(--inks)' }}>{u.title}:</strong> {u.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {/* Export information */}
      {hasExp && (
        <div className={guides.length > 0 ? 'mb-14' : ''}>
          <Reveal>
            <Eyebrow>Export &amp; Supply</Eyebrow>
            <h2
              className="font-medium leading-[1.12] mb-6 max-w-3xl"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(24px, 2.6vw, 34px)', color: 'var(--ink)' }}
            >
              {category.name} — Export &amp; Project Supply
            </h2>
          </Reveal>
          <div className="flex flex-col gap-5 max-w-3xl">
            {category.exportInfo!.map((p, i) => (
              <Reveal key={i} delay={i * 30}>
                <p className="text-[17px] font-light leading-[1.9]" style={{ color: 'var(--inkm)' }}>{p}</p>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {/* Related guides */}
      {guides.length > 0 && (
        <div>
          <Reveal>
            <p className="text-[14px] tracking-[0.28em] uppercase font-medium mb-5" style={{ color: 'var(--gd)' }}>
              Related Guides
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {guides.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group block rounded-lg p-5 transition-colors duration-200"
                style={{ background: '#fff', border: '1px solid var(--bd)' }}
              >
                <span className="text-[12px] tracking-[0.2em] uppercase" style={{ color: 'var(--gd)' }}>Guide</span>
                <span className="block text-[16px] font-medium mt-1.5 leading-snug transition-colors group-hover:text-[var(--c)]" style={{ color: 'var(--inks)' }}>
                  {g.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
