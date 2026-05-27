import { CATALOGUE_TRUST, CATALOGUE_TRUST_CARDS } from '@/lib/catalogue'
import { Reveal, Eyebrow } from '@/components/ui'

const ICONS: Record<string, React.ReactNode> = {
  globe: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeLinecap="round" />
    </svg>
  ),
  quality: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  craft: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  custom: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

export default function CatalogueTrust() {
  return (
    <section
      className="px-12 max-lg:px-6 py-14 lg:py-20"
      style={{ background: 'linear-gradient(180deg, #f5f0e8 0%, var(--iv) 100%)' }}
    >
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <Eyebrow>Trust & Excellence</Eyebrow>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {CATALOGUE_TRUST_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-lg p-6 text-center transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: '#fff',
                  border: '1px solid var(--bd)',
                  boxShadow: '0 8px 28px rgba(26,19,16,0.05)',
                }}
              >
                <div
                  className="w-11 h-11 mx-auto mb-4 flex items-center justify-center rounded-md"
                  style={{ background: 'rgba(192,155,74,0.1)', color: 'var(--gd)' }}
                >
                  {ICONS[card.icon]}
                </div>
                <h3 className="text-[13px] tracking-[0.1em] uppercase font-medium mb-2" style={{ color: 'var(--inks)' }}>
                  {card.title}
                </h3>
                <p className="text-[12.5px] font-light leading-[1.68]" style={{ color: 'var(--inkm)' }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 rounded-xl p-8 lg:p-10"
            style={{
              background: '#fff',
              border: '1px solid var(--bd)',
              boxShadow: '0 12px 40px rgba(26,19,16,0.06)',
            }}
          >
            {CATALOGUE_TRUST.map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className="font-display leading-none"
                  style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40, color: 'var(--c)' }}
                >
                  {stat.value}
                  <sup style={{ fontSize: 14, verticalAlign: 'super' }}>{stat.suffix}</sup>
                </p>
                <p className="text-[9px] tracking-[0.14em] uppercase mt-2" style={{ color: 'var(--inkl)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
