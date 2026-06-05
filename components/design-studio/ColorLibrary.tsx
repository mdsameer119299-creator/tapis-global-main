'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import SwatchCard from '@/components/samples/SwatchCard'
import {
  MATERIAL_FILTER_OPTIONS,
  TONE_FILTER_OPTIONS,
} from '@/lib/design-studio'
import {
  SAMPLE_STATS,
  SWATCH_CATEGORIES,
  filterSwatchesAdvanced,
  type SwatchFilterId,
  type ToneFilter,
} from '@/lib/swatches'

const PREVIEW_COUNT = 18

export default function ColorLibrary() {
  const [material, setMaterial] = useState<SwatchFilterId>('all')
  const [tone, setTone] = useState<ToneFilter>('all')
  const [collection, setCollection] = useState<SwatchFilterId>('all')
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)

  const activeMaterial = collection !== 'all' ? collection : material

  const filtered = useMemo(
    () =>
      filterSwatchesAdvanced({
        material: activeMaterial,
        tone,
        query,
      }),
    [activeMaterial, tone, query],
  )

  const visible = showAll ? filtered : filtered.slice(0, PREVIEW_COUNT)

  const scrollToCatalog = () => {
    document.getElementById('samples-catalog')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="color-library"
      className="scroll-mt-32 py-14 sm:py-16 lg:py-20"
      style={{ background: 'rgba(248,244,238,1)' }}
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-[15px] tracking-[0.32em] uppercase mb-3" style={{ color: 'var(--gd)' }}>
            Yarn &amp; Color Library
          </p>
          <h2
            className="font-display font-normal mb-4"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(32px, 4vw, 48px)',
              color: 'var(--ink)',
            }}
          >
            Yarn &amp; Color Library
          </h2>
          <p className="text-[16px] font-light leading-[1.75]" style={{ color: 'var(--inkm)' }}>
            Explore our curated range of {SAMPLE_STATS.displayTotal}+ colours across premium yarn qualities.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 mb-8">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowAll(false)
            }}
            placeholder="Search color name or code..."
            className="flex-1 min-w-0 px-4 py-3 text-[16px] border outline-none focus:border-[var(--g)]"
            style={{ borderColor: 'var(--bd)', background: '#fff', color: 'var(--ink)' }}
            aria-label="Search colours"
          />
          <div className="flex flex-wrap gap-2 lg:flex-nowrap">
            <FilterSelect
              label="Material"
              value={material}
              onChange={(v) => {
                setMaterial(v as SwatchFilterId)
                setCollection('all')
                setShowAll(false)
              }}
              options={MATERIAL_FILTER_OPTIONS}
            />
            <FilterSelect
              label="Tone"
              value={tone}
              onChange={(v) => {
                setTone(v as ToneFilter)
                setShowAll(false)
              }}
              options={TONE_FILTER_OPTIONS}
            />
            <FilterSelect
              label="Collection"
              value={collection}
              onChange={(v) => {
                setCollection(v as SwatchFilterId)
                setShowAll(false)
              }}
              options={[
                { value: 'all', label: 'All Collections' },
                ...SWATCH_CATEGORIES.map((c) => ({ value: c.id, label: c.title })),
              ]}
            />
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 text-[15px] tracking-[0.14em] uppercase font-semibold whitespace-nowrap transition-colors hover:brightness-110"
            style={{ background: 'var(--c)', color: '#fff' }}
          >
            Request Color Card
          </Link>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center py-16 text-[16px]" style={{ color: 'var(--inkm)' }}>
            No colours match your filters. Try adjusting search or filters.
          </p>
        ) : (
          <div
            className="grid gap-x-4 gap-y-8 mb-10"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
              maxWidth: 1100,
              margin: '0 auto',
            }}
          >
            {visible.map((swatch, i) => (
              <SwatchCard key={`${swatch.code}-${swatch.categoryId}`} swatch={swatch} priority={i < 4} />
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {!showAll && filtered.length > PREVIEW_COUNT && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="px-10 py-3.5 text-[15px] tracking-[0.16em] uppercase font-semibold border-none cursor-pointer transition-all hover:brightness-110"
              style={{ background: 'var(--c)', color: '#fff' }}
            >
              View All {SAMPLE_STATS.displayTotal}+ Colors
            </button>
          )}
          {showAll && (
            <button
              type="button"
              onClick={scrollToCatalog}
              className="px-10 py-3.5 text-[15px] tracking-[0.16em] uppercase font-semibold border transition-colors hover:bg-[var(--g)] hover:text-[var(--ink)]"
              style={{ borderColor: 'var(--g)', color: 'var(--c)' }}
            >
              Browse By Collection ↓
            </button>
          )}
        </div>

        <p className="text-center mt-6 text-[14px]" style={{ color: 'var(--inkl)' }}>
          Showing {visible.length} of {filtered.length} matching shades
          {filtered.length !== SAMPLE_STATS.totalSwatches && ` · ${SAMPLE_STATS.displayTotal}+ colours in studio`}
        </p>
      </div>
    </section>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: readonly { value: string; label: string }[]
}) {
  return (
    <>
    <label className="sr-only">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="px-3 py-3 text-[14px] tracking-[0.06em] border min-w-[140px] cursor-pointer outline-none focus:border-[var(--g)]"
      style={{ borderColor: 'var(--bd)', background: '#fff', color: 'var(--ink)' }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    </>
  )
}
