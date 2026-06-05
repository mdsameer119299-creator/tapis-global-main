'use client'

import type { CollectionItem } from '@/lib/collections'
import { Reveal } from '@/components/ui'
import CollectionCarousel from '@/components/collections/CollectionCarousel'

function SpecIcon({ type }: { type: 'time' | 'moq' }) {
  if (type === 'time') {
    return (
      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  }
  return (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
    </svg>
  )
}

type Props = {
  col:        CollectionItem
  index:      number
  isPriority?: boolean
}

export default function CollectionStoryBlock({ col, index, isPriority = false }: Props) {
  const isLeft  = col.layout === 'il'
  const isDark  = col.variant === 'dark'
  const isAlt   = col.variant === 'alt'

  const contentBg = isDark
    ? 'transparent'
    : isAlt
      ? 'var(--ivd)'
      : '#fff'

  const gridCols = isLeft ? 'lg:grid-cols-[52%_48%]' : 'lg:grid-cols-[48%_52%]'

  const content = (
    <div
      className="flex flex-col justify-center px-10 max-lg:px-6 py-14 lg:py-16 lg:px-[4.5rem]"
      style={{
        background: contentBg,
        ...(isDark ? { padding: '64px 72px' } : {}),
      }}
    >
      <Reveal direction={isLeft ? 'right' : 'left'} delay={index * 80}>
        <div
          className="flex items-center gap-3 mb-4 text-[14px] tracking-[0.38em] uppercase font-medium"
          style={{ color: isDark ? 'var(--gl)' : 'var(--gd)' }}
        >
          <span
            className="block h-px w-8 flex-shrink-0"
            style={{ background: isDark ? 'var(--gl)' : 'var(--g)' }}
          />
          Collection {String(col.collectionNum).padStart(2, '0')}
        </div>

        <h3
          className="font-medium leading-[1.08] mb-3"
          style={{
            fontFamily: '"Cormorant Garamond",serif',
            fontSize:   'clamp(28px,2.8vw,44px)',
            color:      isDark ? '#fff' : 'var(--ink)',
          }}
        >
          {col.title}
          <br />
          <em style={{ fontStyle: 'italic', color: isDark ? 'var(--gp)' : 'var(--c)' }}>
            {col.titleEm}
          </em>
        </h3>

        <p
          className="text-[17px] italic mb-7"
          style={{
            fontFamily: '"EB Garamond",serif',
            color:      isDark ? 'var(--gl)' : 'var(--inkm)',
          }}
        >
          {col.tagline}
        </p>

        <ul className="flex flex-col gap-4 mb-8">
          {col.bullets.map((b) => (
            <li
              key={b.label}
              className="flex items-start gap-3 text-[16px] font-light leading-[1.75]"
              style={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'var(--inkm)' }}
            >
              <span
                className="w-1 h-1 rounded-full flex-shrink-0 mt-2.5"
                style={{ background: 'var(--g)' }}
              />
              <span>
                <strong
                  className="font-medium"
                  style={{ color: isDark ? 'rgba(255,255,255,0.82)' : 'var(--inks)' }}
                >
                  {b.label}:
                </strong>{' '}
                {b.text}
              </span>
            </li>
          ))}
        </ul>

        <div
          className="flex flex-wrap gap-6 items-center pt-6"
          style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'var(--bd)'}` }}
        >
          <span
            className="inline-flex items-center gap-2 text-[15px] tracking-[0.08em]"
            style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'var(--inkm)' }}
          >
            <SpecIcon type="time" />
            Lead: {col.leadTime}
          </span>
          <span
            className="inline-flex items-center gap-2 text-[15px] tracking-[0.08em]"
            style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'var(--inkm)' }}
          >
            <SpecIcon type="moq" />
            MOQ: {col.moq}
          </span>
          <a
            href="/contact"
            className="text-[15px] tracking-[0.12em] uppercase inline-flex items-center gap-2 transition-all duration-200 hover:gap-3.5 ml-auto max-lg:ml-0"
            style={{ color: isDark ? 'var(--gl)' : 'var(--c)' }}
          >
            {col.ctaText}
          </a>
        </div>
      </Reveal>
    </div>
  )

  const carousel = (
    <CollectionCarousel
      images={col.images}
      title={`${col.title} ${col.titleEm}`}
      slideTag={col.slideTag}
      slideTagVariant={col.slideTagVariant}
      isPriority={isPriority}
    />
  )

  return (
    <article
      id={col.id}
      data-category={col.category}
      className={`grid grid-cols-1 ${gridCols} min-h-[500px] overflow-hidden transition-all duration-500`}
      style={{
        borderBottom: '1px solid var(--bd)',
        background:   isDark ? 'var(--cd)' : undefined,
      }}
    >
      {isLeft ? (
        <>
          {content}
          {carousel}
        </>
      ) : (
        <>
          {carousel}
          {content}
        </>
      )}
    </article>
  )
}
