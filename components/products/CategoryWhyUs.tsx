import Link from 'next/link'
import { SITE } from '@/lib/data'
import { PRODUCT_WHY_US } from '@/lib/products'
import { Reveal, Eyebrow } from '@/components/ui'

const ICONS: Record<string, React.ReactNode> = {
  craft: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  export: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  sustain: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  custom: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  delivery: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  artisan: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

export default function CategoryWhyUs() {
  return (
    <section className="py-14 lg:py-16 px-8 max-lg:px-5 pb-20" style={{ background: 'var(--iv)' }}>
      <Reveal>
        <Eyebrow>Why Tapis Global</Eyebrow>
        <h2
          className="font-medium leading-[1.06] mb-10"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(26px, 2.8vw, 36px)',
            color: 'var(--ink)',
          }}
        >
          Why Choose Us
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {PRODUCT_WHY_US.map((item, i) => (
          <Reveal key={item.title} delay={i * 40}>
            <div
              className="h-full rounded-lg p-6 transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: '#fff', border: '1px solid var(--bd)' }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center rounded-md mb-4"
                style={{ background: 'rgba(192,155,74,0.1)', color: 'var(--gd)' }}
              >
                {ICONS[item.icon]}
              </div>
              <h3 className="text-[16px] font-medium mb-2" style={{ color: 'var(--inks)' }}>{item.title}</h3>
              <p className="text-[15px] font-light leading-[1.7]" style={{ color: 'var(--inkm)' }}>{item.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/contact"
            className="px-10 py-3.5 text-[15px] tracking-[0.2em] uppercase font-medium border transition-colors duration-300 hover:border-[var(--c)] hover:text-[var(--c)]"
            style={{ borderColor: 'var(--bd)', color: 'var(--inks)' }}
          >
            Request Project Quote
          </Link>
          <Link
            href={SITE.whatsapp}
            className="px-10 py-3.5 text-[15px] tracking-[0.2em] uppercase font-medium"
            style={{ background: '#25D366', color: '#fff' }}
          >
            WhatsApp Enquiry
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
