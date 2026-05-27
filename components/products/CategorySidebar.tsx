'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PRODUCT_CATEGORIES } from '@/lib/products'

type Props = {
  activeSlug: string
}

export default function CategorySidebar({ activeSlug }: Props) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sticky sidebar */}
      <aside
        className="hidden lg:block w-[260px] flex-shrink-0 sticky top-[72px] lg:top-[96px] self-start max-h-[calc(100dvh-100px)] overflow-y-auto scrollbar-none"
        aria-label="Product categories"
      >
        <nav
          className="rounded-xl p-5"
          style={{
            background: 'linear-gradient(165deg, #12100d 0%, #0a0806 100%)',
            border: '1px solid rgba(192,155,74,0.18)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
          }}
        >
          <p
            className="text-[9px] tracking-[0.32em] uppercase font-medium mb-5 px-2"
            style={{ color: 'var(--gp)' }}
          >
            Collections
          </p>
          <ul className="flex flex-col gap-1">
            {PRODUCT_CATEGORIES.map((cat) => {
              const active = cat.slug === activeSlug || pathname === `/products/${cat.slug}`
              return (
                <li key={cat.slug}>
                  <Link
                    href={`/products/${cat.slug}`}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[13px] font-light transition-all duration-300"
                    style={{
                      background:  active ? 'rgba(192,155,74,0.12)' : 'transparent',
                      color:       active ? 'var(--gp)' : 'rgba(248,244,238,0.48)',
                      borderLeft:  active ? '2px solid var(--g)' : '2px solid transparent',
                    }}
                  >
                    <span
                      className="w-1 h-1 rounded-full flex-shrink-0"
                      style={{ background: active ? 'var(--g)' : 'rgba(192,155,74,0.3)' }}
                    />
                    {cat.name}
                  </Link>
                </li>
              )
            })}
          </ul>
          <Link
            href="/products"
            className="block mt-6 pt-5 text-[10px] tracking-[0.18em] uppercase font-medium transition-colors duration-300 hover:text-[var(--gp)]"
            style={{ color: 'rgba(248,244,238,0.35)', borderTop: '1px solid rgba(192,155,74,0.12)' }}
          >
            ← All Collections
          </Link>
        </nav>
      </aside>

      {/* Mobile horizontal scroll nav */}
      <nav
        className="lg:hidden overflow-x-auto scrollbar-none -mx-6 px-6 mb-8"
        aria-label="Product categories"
      >
        <div className="flex gap-2 min-w-max pb-1">
          {PRODUCT_CATEGORIES.map((cat) => {
            const active = cat.slug === activeSlug
            return (
              <Link
                key={cat.slug}
                href={`/products/${cat.slug}`}
                className="whitespace-nowrap px-4 py-2 text-[11px] tracking-[0.12em] uppercase rounded-full transition-all duration-300"
                style={{
                  background: active ? 'var(--g)' : 'rgba(26,19,16,0.06)',
                  color:        active ? 'var(--ink)' : 'var(--inkm)',
                  border:       active ? 'none' : '1px solid var(--bd)',
                }}
              >
                {cat.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
