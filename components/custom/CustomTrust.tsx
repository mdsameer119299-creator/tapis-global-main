import { CUSTOM_TRUST } from '@/lib/custom'
import { Reveal, Eyebrow } from '@/components/ui'

const ICONS: Record<string, React.ReactNode> = {
  design: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  material: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  globe: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  craft: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  sample: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  scale: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

export default function CustomTrust() {
  return (
    <section
      className="px-12 max-lg:px-6 py-20 lg:py-24"
      style={{ background: 'var(--iv)' }}
    >
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-14">
            <Eyebrow>Why Choose Us</Eyebrow>
            <h2
              className="font-medium leading-[1.06]"
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 'clamp(32px, 3.5vw, 48px)',
                color: 'var(--ink)',
              }}
            >
              The Tapis Global
              <em style={{ fontStyle: 'italic', color: 'var(--c)' }}> Custom Advantage</em>
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CUSTOM_TRUST.map((item, i) => (
            <Reveal key={item.title} delay={i * 50}>
              <div
                className="group h-full rounded-lg p-7 transition-all duration-400 hover:-translate-y-1"
                style={{
                  background: '#fff',
                  border: '1px solid var(--bd)',
                  boxShadow: '0 4px 24px rgba(26,19,16,0.04)',
                }}
              >
                <div
                  className="w-11 h-11 flex items-center justify-center rounded-md mb-5 transition-colors duration-300 group-hover:bg-[rgba(192,155,74,0.15)]"
                  style={{ background: 'rgba(192,155,74,0.08)', color: 'var(--gd)' }}
                >
                  {ICONS[item.icon]}
                </div>
                <h3 className="text-[17px] font-medium mb-2" style={{ color: 'var(--inks)' }}>
                  {item.title}
                </h3>
                <p className="text-[18px] font-light leading-[1.72]" style={{ color: 'var(--inkm)' }}>
                  {item.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
