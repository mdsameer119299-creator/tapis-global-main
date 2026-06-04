'use client'

import { useEffect, useState } from 'react'
import { DESIGN_STUDIO_SUBNAV } from '@/lib/design-studio'

function SubIcon({ type }: { type: string }) {
  const stroke = 'currentColor'
  const icons: Record<string, React.ReactNode> = {
    palette: (
      <>
        <circle cx="12" cy="12" r="10" />
        <circle cx="8" cy="10" r="1.5" fill={stroke} stroke="none" />
        <circle cx="16" cy="8" r="1.5" fill={stroke} stroke="none" />
        <circle cx="14" cy="15" r="1.5" fill={stroke} stroke="none" />
      </>
    ),
    yarn: <path d="M4 4h16v16H4z M8 8h8v8H8z" />,
    dye: <path d="M12 2v6l4 4 M8 12l-4 4 M12 22v-6l4-4" />,
    match: <path d="M12 3v18M3 12h18" />,
    design: <path d="M3 17l6-6 4 4 8-8 4 4" />,
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {icons[type] ?? icons.palette}
    </svg>
  )
}

export default function DesignStudioSubNav() {
  const [active, setActive] = useState<string>(DESIGN_STUDIO_SUBNAV[0].id)

  useEffect(() => {
    const sections = DESIGN_STUDIO_SUBNAV.map((s) => document.getElementById(s.id)).filter(Boolean)
    const onScroll = () => {
      const y = window.scrollY + 140
      let current: string = DESIGN_STUDIO_SUBNAV[0].id
      for (const el of sections) {
        if (el && el.offsetTop <= y) current = el.id
      }
      setActive(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      className="sticky top-[72px] lg:top-[96px] z-[55] border-b backdrop-blur-md overflow-x-auto scrollbar-none"
      style={{ background: 'rgba(248,244,238,0.95)', borderColor: 'var(--bd)' }}
      aria-label="Design studio sections"
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 flex items-stretch min-w-max lg:min-w-0">
        {DESIGN_STUDIO_SUBNAV.map((item) => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              className="flex items-center gap-2 px-4 sm:px-6 py-4 text-[10px] sm:text-[11px] tracking-[0.12em] uppercase font-medium whitespace-nowrap transition-colors duration-200 border-b-2 flex-shrink-0"
              style={{
                color: isActive ? 'var(--c)' : 'var(--inkm)',
                borderColor: isActive ? 'var(--g)' : 'transparent',
              }}
            >
              <span style={{ color: isActive ? 'var(--g)' : 'var(--inkl)' }}>
                <SubIcon type={item.icon} />
              </span>
              {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
