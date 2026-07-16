import { SITE } from '@/lib/data'
import { Reveal } from '@/components/ui'

const SIGNALS: { title: string; desc: string; icon: React.ReactNode }[] = [
  {
    title: `Manufactured in Bhadohi, India`,
    desc: 'Produced in our own integrated facility — the heart of India\'s handmade carpet industry.',
    icon: (
      <path d="M3 21V9l9-6 9 6v12M3 21h18M9 21v-6h6v6M9 12h.01M15 12h.01" />
    ),
  },
  {
    title: 'Custom Production Capabilities',
    desc: 'Any size, colour, pattern and construction — developed and sampled in-house.',
    icon: (
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    ),
  },
  {
    title: 'Project-Based Manufacturing',
    desc: 'Specification-led production to architect drawings, mood boards and Pantone references.',
    icon: (
      <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    ),
  },
  {
    title: 'Bulk & Contract Order Capacity',
    desc: 'A large in-house campus with hundreds of artisans for large volumes and phased delivery.',
    icon: (
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    ),
  },
  {
    title: 'Hospitality & Commercial Experience',
    desc: 'Trusted for hotels, offices, retail and developments across India and abroad.',
    icon: (
      <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
    ),
  },
  {
    title: `Family Heritage Since ${SITE.established}`,
    desc: 'A third-generation, family-owned business — six decades of handmade carpet-making knowledge.',
    icon: (
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
]

export default function CategoryTrustSignals() {
  return (
    <section className="py-12 lg:py-14 px-8 max-lg:px-5" style={{ background: 'var(--ink)' }}>
      <Reveal>
        <div className="flex items-center gap-3 mb-8">
          <span className="block h-px w-8" style={{ background: 'rgba(192,155,74,0.5)' }} />
          <span className="text-[14px] tracking-[0.32em] uppercase font-medium" style={{ color: 'var(--gl)' }}>
            A Genuine Manufacturer — Not a Trading Company
          </span>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-7">
        {SIGNALS.map((s, i) => (
          <Reveal key={s.title} delay={i * 40}>
            <div className="flex items-start gap-4">
              <span
                className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-md"
                style={{ background: 'rgba(192,155,74,0.12)', color: 'var(--gl)', border: '1px solid rgba(192,155,74,0.25)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {s.icon}
                </svg>
              </span>
              <div>
                <h3 className="text-[16px] font-medium mb-1" style={{ color: '#fff' }}>{s.title}</h3>
                <p className="text-[14.5px] font-light leading-[1.7]" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
