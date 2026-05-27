'use client'

import type { SwatchCategory, SwatchFilterId } from '@/lib/swatches'

interface CategoryFilterProps {
  categories: SwatchCategory[]
  active: SwatchFilterId
  onChange: (id: SwatchFilterId) => void
  totalCount: number
}

export default function CategoryFilter({
  categories,
  active,
  onChange,
  totalCount,
}: CategoryFilterProps) {
  const items: { id: SwatchFilterId; label: string; count?: number }[] = [
    { id: 'all', label: 'All Collections', count: totalCount },
    ...categories.map((c) => ({
      id: c.id,
      label: c.title,
      count: c.swatchCount,
    })),
  ]

  return (
    <div
      className="sticky top-[72px] z-[50] py-4 -mx-6 px-6 lg:-mx-12 lg:px-12 border-b backdrop-blur-md"
      style={{
        background: 'rgba(248,244,238,0.92)',
        borderColor: 'var(--bd)',
      }}
    >
      <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start">
        {items.map((item) => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className="text-[10px] tracking-[0.16em] uppercase font-medium px-4 py-2.5 border transition-all duration-200"
              style={{
                borderColor: isActive ? 'var(--g)' : 'var(--bd)',
                background:  isActive ? 'var(--cd)' : 'transparent',
                color:       isActive ? 'var(--gp)' : 'var(--inkm)',
              }}
            >
              {item.label}
              {item.count != null && (
                <span className="ml-1.5 opacity-70">({item.count})</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
