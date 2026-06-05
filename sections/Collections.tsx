'use client'

import { useState } from 'react'
import {
  COLLECTIONS,
  COLLECTION_FILTERS,
  filterCollections,
  type CollectionFilterId,
} from '@/lib/collections'
import { Reveal, Eyebrow } from '@/components/ui'
import CollectionStoryBlock from '@/components/collections/CollectionStoryBlock'

type CollectionsProps = {
  sectionId?: string
}

export default function Collections({ sectionId = 'collections' }: CollectionsProps) {
  const [activeFilter, setFilter] = useState<CollectionFilterId>('all')
  const visible = filterCollections(COLLECTIONS, activeFilter)

  return (
    <section id={sectionId}>
      {/* ── Header ── */}
      <div
        className="px-12 max-lg:px-6 py-24 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-end"
        style={{ borderBottom: '1px solid var(--bd)' }}
      >
        <Reveal>
          <Eyebrow>Our Range</Eyebrow>
          <h2
            className="font-medium leading-[1.06] tracking-tight mb-7"
            style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(36px,3.8vw,56px)', color: 'var(--ink)' }}
          >
            Nine Collections.
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--c)' }}>One Design Studio.</em>
          </h2>
          <p className="text-[20px] font-light leading-[1.85] max-w-[58ch]" style={{ color: 'var(--inkm)' }}>
            Specification-led carpets and flooring for luxury residences, hospitality environments, corporate interiors and designer projects — developed in Bhadohi for pan India execution and global supply.
          </p>
        </Reveal>

        <Reveal delay={150}>
          <div className="flex flex-wrap gap-2 items-end lg:justify-end">
            {COLLECTION_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className="text-[15px] tracking-[0.14em] uppercase px-[18px] py-2 border transition-all duration-[220ms]"
                style={{
                  background:   activeFilter === f.id ? 'var(--c)' : 'transparent',
                  borderColor:  activeFilter === f.id ? 'var(--c)' : 'var(--bd)',
                  color:        activeFilter === f.id ? '#fff'     : 'var(--inkm)',
                  fontFamily:   '"Outfit",sans-serif',
                  fontWeight:   400,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      {/* ── Collection story blocks ── */}
      <div className="flex flex-col">
        {visible.map((col, idx) => (
          <CollectionStoryBlock
            key={col.id}
            col={col}
            index={idx}
            isPriority={idx === 0 && activeFilter === 'all'}
          />
        ))}
      </div>
    </section>
  )
}
