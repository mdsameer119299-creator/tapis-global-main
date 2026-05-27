import { SAMPLE_STATS } from '@/lib/swatches'

export default function SamplesStrip() {
  return (
    <div
      className="px-6 lg:px-12 py-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 border-t"
      style={{
        background: 'var(--cd)',
        borderColor: 'rgba(192,155,74,0.2)',
      }}
    >
      <p
        className="text-[13.5px] leading-[1.7] tracking-[0.04em]"
        style={{ color: 'rgba(255,255,255,0.55)' }}
      >
        <strong style={{ color: 'var(--gp)', fontWeight: 500 }}>
          {SAMPLE_STATS.headline}
        </strong>{' '}
        across {SAMPLE_STATS.totalCategories} material collections · Dispatched within 3–5 working days ·
        Available for <strong style={{ color: 'var(--gp)', fontWeight: 500 }}>trade professionals</strong> worldwide
      </p>
      <a
        href="#samples-catalog"
        className="inline-block text-[11px] tracking-[0.16em] uppercase px-[26px] py-2.5 border whitespace-nowrap transition-all duration-200 hover:bg-[var(--g)] hover:text-[var(--ink)]"
        style={{
          borderColor: 'var(--g)',
          color: 'var(--gp)',
        }}
      >
        Browse Swatches
      </a>
    </div>
  )
}
