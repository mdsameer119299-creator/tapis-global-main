import { Reveal } from '@/components/ui'

const SIGNALS: { title: string; desc: string; icon: React.ReactNode }[] = [
  {
    title: 'Bhadohi-Based Manufacturing',
    desc: 'Carpets and rugs manufactured in Bhadohi, Uttar Pradesh, India — a recognised centre for handmade carpet production.',
    icon: (
      <path d="M3 21V9l9-6 9 6v12M3 21h18M9 21v-6h6v6M9 12h.01M15 12h.01" />
    ),
  },
  {
    title: 'A Range of Constructions',
    desc: 'Explore hand-knotted, hand-tufted, wool, wool-blend, jute, coir, dhurrie and other rug and carpet options.',
    icon: (
      <path d="M4 7h16M4 12h16M4 17h16M7 4v16M17 4v16" />
    ),
  },
  {
    title: 'Specification-Led Enquiries',
    desc: 'Discuss dimensions, colours, patterns, materials and construction against your product brief or project requirements.',
    icon: (
      <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    ),
  },
  {
    title: 'Residential & Commercial Use',
    desc: 'Product discussions for homes, interior design schemes, retail collections, hospitality and other commercial spaces.',
    icon: (
      <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
    ),
  },
  {
    title: 'India & Export Enquiries',
    desc: 'Connect with our team about domestic supply or export requirements, destination markets and order details.',
    icon: (
      <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20M2 12a10 10 0 0020 0 10 10 0 00-20 0z" />
    ),
  },
  {
    title: 'Order-Specific Quotations',
    desc: 'Pricing, minimum quantities, production schedules and shipping arrangements are confirmed against the selected products and order brief.',
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
            Manufacturing & Supply Approach
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
