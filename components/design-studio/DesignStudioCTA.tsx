import Link from 'next/link'
import { SITE } from '@/lib/data'

export default function DesignStudioCTA() {
  return (
    <section
      className="py-12 sm:py-14 px-5 sm:px-8 lg:px-12"
      style={{ background: 'var(--c)' }}
    >
      <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
        <p
          className="text-[17px] sm:text-[18px] font-light leading-[1.7] max-w-2xl"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          Have a custom requirement? Our design experts are here to help you create something exceptional.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-3.5 text-[15px] tracking-[0.16em] uppercase font-semibold transition-all hover:brightness-110"
            style={{ background: 'var(--g)', color: 'var(--ink)' }}
          >
            Discuss Your Project
          </Link>
          <a
            href={SITE.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3.5 text-[15px] tracking-[0.16em] uppercase font-semibold border transition-colors hover:bg-white/10"
            style={{ borderColor: 'rgba(255,255,255,0.35)', color: '#fff' }}
          >
            WhatsApp Us
          </a>
        </div>
      </div>
    </section>
  )
}
