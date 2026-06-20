import Link from 'next/link'
import { SITE } from '@/lib/data'
import type { ProductCategory } from '@/lib/products'
import { Reveal } from '@/components/ui'

export default function CategoryCTA({ category }: { category: ProductCategory }) {
  const waHref = `${SITE.whatsapp}?text=${encodeURIComponent(
    `Hello Tapis Global, I'd like to enquire about ${category.name} (manufacturing / supply).`,
  )}`

  return (
    <section
      className="py-14 lg:py-16 px-8 max-lg:px-5 mx-8 max-lg:mx-5 mb-10 rounded-xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(107,31,31,0.16) 0%, rgba(192,155,74,0.10) 100%)',
        border: '1px solid rgba(192,155,74,0.22)',
      }}
    >
      <Reveal>
        <p className="text-[15px] tracking-[0.28em] uppercase mb-3 font-medium" style={{ color: 'var(--gd)' }}>
          Manufacturer · Supplier · Exporter
        </p>
        <h2
          className="font-medium leading-[1.08] mb-4 max-w-2xl"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(26px, 2.8vw, 38px)', color: 'var(--ink)' }}
        >
          Request {category.name} for Your Project
        </h2>
        <p className="text-[16px] font-light leading-[1.82] max-w-2xl mb-8" style={{ color: 'var(--inkm)' }}>
          Custom sizes, colours, patterns and project volumes — manufactured in Bhadohi and supplied across India and
          international markets. Request our catalogue, get a quote, or message us directly on WhatsApp.
        </p>

        <div className="flex flex-wrap gap-3.5">
          <Link
            href="/catalogue"
            className="px-9 py-3.5 text-[15px] tracking-[0.18em] uppercase font-semibold rounded-sm transition-all duration-300 hover:brightness-110"
            style={{ background: 'var(--g)', color: 'var(--ink)' }}
          >
            Request Catalogue
          </Link>
          <Link
            href="/contact"
            className="px-9 py-3.5 text-[15px] tracking-[0.18em] uppercase font-medium rounded-sm border transition-colors duration-300 hover:border-[var(--c)] hover:text-[var(--c)]"
            style={{ borderColor: 'var(--bd)', color: 'var(--inks)' }}
          >
            Get Quote
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-9 py-3.5 text-[15px] tracking-[0.18em] uppercase font-semibold rounded-sm transition-all duration-300 hover:brightness-105"
            style={{ background: '#25D366', color: '#fff' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.5 14.4c-.3-.15-1.7-.84-1.97-.94-.26-.1-.46-.15-.65.15-.19.29-.74.94-.91 1.13-.17.19-.34.21-.63.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.04-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.5.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.15-.65-1.57-.9-2.15-.24-.57-.48-.49-.65-.5-.17-.01-.36-.01-.55-.01-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.4 0 1.41 1.02 2.77 1.17 2.96.15.19 2.01 3.06 4.86 4.29.68.29 1.21.47 1.62.6.68.22 1.3.19 1.79.11.55-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34z"/>
              <path d="M12 2a10 10 0 00-8.5 15.27L2 22l4.85-1.42A10 10 0 1012 2zm0 18.2a8.18 8.18 0 01-4.17-1.14l-.3-.18-2.88.84.85-2.8-.2-.31A8.2 8.2 0 1112 20.2z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </Reveal>
    </section>
  )
}
