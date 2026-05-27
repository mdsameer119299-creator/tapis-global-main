import { TRUST_RIBBON_ITEMS } from '@/lib/home'

function TrustIcon({ index }: { index: number }) {
  const icons = [
    // ISO shield
    <svg key="iso" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>,
    // OEKO-TEX check
    <svg key="oeko" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>,
    // Globe export
    <svg key="globe" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 010 20" />
    </svg>,
    // Freight truck
    <svg key="truck" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>,
    // Lead time clock
    <svg key="clock" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>,
    // GoodWeave heart
    <svg key="heart" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>,
    // OEM flag
    <svg key="flag" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>,
  ]
  return icons[index] ?? icons[0]
}

export default function TrustRibbon() {
  return (
    <div
      className="flex items-stretch overflow-x-auto scrollbar-none"
      style={{ background: 'var(--cd)' }}
    >
      {TRUST_RIBBON_ITEMS.map((item, i) => (
        <div
          key={item.text}
          className="flex-1 min-w-[140px] px-4 py-3.5 flex items-center gap-2.5 text-[11.5px] sm:text-[12px] tracking-[0.06em] transition-colors duration-200 hover:bg-[rgba(192,155,74,0.07)] flex-shrink-0"
          style={{
            color:      'rgba(255,255,255,0.55)',
            borderRight: i < TRUST_RIBBON_ITEMS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}
        >
          <span className="flex-shrink-0" style={{ color: 'var(--gl)' }}>
            <TrustIcon index={i} />
          </span>
          {item.text}
        </div>
      ))}
    </div>
  )
}
