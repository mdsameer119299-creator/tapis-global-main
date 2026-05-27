'use client'

import { useMemo, useState } from 'react'
import CategoryFilter from '@/components/samples/CategoryFilter'
import SampleCategorySection from '@/components/samples/SampleCategorySection'
import {
  SWATCHES,
  SWATCH_CATEGORIES,
  SAMPLE_STATS,
  categoriesToShow,
  type SwatchFilterId,
} from '@/lib/swatches'

export default function SamplesCatalog() {
  const [filter, setFilter] = useState<SwatchFilterId>('all')

  const visibleCategories = useMemo(() => categoriesToShow(filter), [filter])

  const swatchesByCategory = useMemo(() => {
    const map = new Map<string, typeof SWATCHES>()
    for (const cat of visibleCategories) {
      map.set(
        cat.id,
        SWATCHES.filter((s) => s.categoryId === cat.id),
      )
    }
    return map
  }, [visibleCategories])

  return (
    <div id="samples-catalog" className="scroll-mt-28">
      <CategoryFilter
        categories={SWATCH_CATEGORIES}
        active={filter}
        onChange={setFilter}
        totalCount={SAMPLE_STATS.totalSwatches}
      />

      {visibleCategories.map((category, index) => (
        <SampleCategorySection
          key={category.id}
          category={category}
          swatches={swatchesByCategory.get(category.id) ?? []}
          index={index}
        />
      ))}
    </div>
  )
}
