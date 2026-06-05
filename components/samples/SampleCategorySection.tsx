import SwatchCard from '@/components/samples/SwatchCard'
import { Reveal } from '@/components/ui'
import type { Swatch, SwatchCategory } from '@/lib/swatches'

interface SampleCategorySectionProps {
  category: SwatchCategory
  swatches: Swatch[]
  index: number
}

export default function SampleCategorySection({
  category,
  swatches,
  index,
}: SampleCategorySectionProps) {
  if (swatches.length === 0) return null

  const isEven = index % 2 === 1

  return (
    <section
      id={category.slug}
      className="py-12 lg:py-14 px-6 lg:px-12 border-b scroll-mt-36"
      style={{
        background: isEven ? 'var(--w)' : 'var(--iv)',
        borderColor: 'var(--bd)',
      }}
    >
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 lg:mb-10">
          <h2
            className="font-display font-medium flex items-center gap-3.5"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(20px, 2.2vw, 28px)',
              color: 'var(--ink)',
            }}
          >
            {category.title}
            <span
              className="block h-0.5 w-9 flex-shrink-0"
              style={{ background: 'var(--g)' }}
            />
          </h2>
          <span
            className="text-[14px] tracking-[0.26em] uppercase font-medium px-3 py-1 border"
            style={{
              color: 'var(--g)',
              background: 'rgba(192,155,74,0.1)',
              borderColor: 'rgba(192,155,74,0.25)',
            }}
          >
            {category.tag}
          </span>
        </div>
      </Reveal>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-3.5 gap-y-6 lg:gap-x-4 lg:gap-y-7">
        {swatches.map((swatch, i) => (
          <SwatchCard key={swatch.code} swatch={swatch} priority={index === 0 && i < 4} />
        ))}
      </div>
    </section>
  )
}
