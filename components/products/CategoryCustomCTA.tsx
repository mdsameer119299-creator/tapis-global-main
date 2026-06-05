import Link from 'next/link'
import { Reveal } from '@/components/ui'

export default function CategoryCustomCTA() {
  return (
    <section
      className="py-14 lg:py-16 px-8 max-lg:px-5 mx-8 max-lg:mx-5 mb-8 rounded-xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(107,31,31,0.15) 0%, rgba(192,155,74,0.08) 100%)',
        border: '1px solid rgba(192,155,74,0.2)',
      }}
    >
      <Reveal>
        <p className="text-[15px] tracking-[0.28em] uppercase mb-3 font-medium" style={{ color: 'var(--gd)' }}>
          Bespoke Programmes
        </p>
        <h2
          className="font-medium leading-[1.08] mb-4"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(26px, 2.8vw, 36px)',
            color: 'var(--ink)',
          }}
        >
          Looking for Custom Designs?
        </h2>
        <p className="text-[16px] font-light leading-[1.82] max-w-2xl mb-6" style={{ color: 'var(--inkm)' }}>
          Custom sizes, colours, patterns, hospitality projects, bulk supply and pan India or international delivery —
          our Bhadohi studio translates your brief into production-ready collections.
        </p>
        <Link
          href="/custom#custom-form"
          className="inline-block px-10 py-3.5 text-[15px] tracking-[0.2em] uppercase font-semibold rounded-sm transition-all duration-300 hover:brightness-110"
          style={{ background: 'var(--g)', color: 'var(--ink)' }}
        >
          Request Custom Carpet
        </Link>
      </Reveal>
    </section>
  )
}
