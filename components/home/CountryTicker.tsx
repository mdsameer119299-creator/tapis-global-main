'use client'

import { REGIONS } from '@/lib/data'

export default function CountryTicker() {
  const items = [...REGIONS, ...REGIONS]

  return (
    <div className="relative overflow-hidden py-2">
      <div
        className="flex w-max animate-ticker hover:[animation-play-state:paused]"
        style={{ willChange: 'transform' }}
      >
        {items.map((r, i) => (
          <div
            key={`${r.country}-${i}`}
            className="flex-shrink-0 flex items-center gap-4 px-10 whitespace-nowrap"
            style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}
          >
            <span
              className="w-1 h-1 rounded-full flex-shrink-0"
              style={{ background: 'var(--g)' }}
              aria-hidden
            />
            <span
              className="text-[17px] tracking-[0.06em] font-light"
              style={{ color: 'rgba(255,255,255,0.58)' }}
            >
              {r.country}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
