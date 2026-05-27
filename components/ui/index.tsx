'use client'
import { useEffect, useRef, useState } from 'react'

// ─── EYEBROW LABEL ────────────────────────────────────────────
export function Eyebrow({
  children,
  white = false,
  className = '',
}: {
  children: React.ReactNode
  white?: boolean
  className?: string
}) {
  return (
    <div className={`flex items-center gap-3 mb-3 ${className}`}>
      <span
        className="block flex-shrink-0 h-px w-8"
        style={{ background: white ? 'rgba(192,155,74,0.5)' : 'var(--g)' }}
      />
      <span
        className="text-[9.5px] tracking-[0.38em] uppercase font-medium"
        style={{ color: white ? 'var(--gl)' : 'var(--gd)' }}
      >
        {children}
      </span>
    </div>
  )
}

// ─── DISPLAY HEADING ─────────────────────────────────────────
export function DisplayHeading({
  children,
  white = false,
  className = '',
  as: Tag = 'h2',
}: {
  children: React.ReactNode
  white?: boolean
  className?: string
  as?: 'h1' | 'h2' | 'h3'
}) {
  return (
    <Tag
      className={`font-display font-medium leading-[1.06] tracking-tight mb-4 ${className}`}
      style={{
        fontFamily: '"Cormorant Garamond", serif',
        fontSize: 'clamp(36px, 3.8vw, 56px)',
        color: white ? '#fff' : 'var(--ink)',
      }}
    >
      {children}
    </Tag>
  )
}

// ─── GOLD LINE ───────────────────────────────────────────────
export function GoldLine({ className = '' }: { className?: string }) {
  return (
    <span
      className={`block h-0.5 w-11 ${className}`}
      style={{ background: 'var(--g)' }}
    />
  )
}

// ─── BUTTON COMPONENTS ───────────────────────────────────────
type BtnProps = {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  className?: string
  type?: 'button' | 'submit'
}

export function BtnPrimary({ children, href, onClick, className = '', type = 'button' }: BtnProps) {
  const cls = `inline-block px-8 py-3.5 text-[11.5px] tracking-[0.18em] uppercase font-medium border transition-all duration-300 ${className}`
  const style = {
    background: 'var(--c)',
    color: '#fff',
    borderColor: 'var(--c)',
  }
  if (href) return <a href={href} className={cls} style={style}>{children}</a>
  return (
    <button type={type} onClick={onClick} className={cls} style={style}>
      {children}
    </button>
  )
}

export function BtnOutline({ children, href, onClick, className = '' }: BtnProps) {
  const cls = `inline-block px-8 py-3.5 text-[11.5px] tracking-[0.18em] uppercase font-medium border transition-all duration-300 hover:bg-[var(--c)] hover:text-white hover:border-[var(--c)] ${className}`
  const style = { borderColor: 'var(--bd)', color: 'var(--inks)' }
  if (href) return <a href={href} className={cls} style={style}>{children}</a>
  return <button onClick={onClick} className={cls} style={style}>{children}</button>
}

export function BtnGold({ children, href, onClick, className = '', type = 'button' }: BtnProps) {
  const cls = `inline-block px-8 py-3.5 text-[11.5px] tracking-[0.18em] uppercase font-semibold transition-all duration-300 ${className}`
  const style = { background: 'var(--g)', color: 'var(--ink)' }
  if (href) return <a href={href} className={cls} style={style}>{children}</a>
  return (
    <button type={type} onClick={onClick} className={cls} style={style}>
      {children}
    </button>
  )
}

// ─── REVEAL ON SCROLL ─────────────────────────────────────────
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  direction?: 'up' | 'left' | 'right'
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const show = () => setVisible(true)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      show()
      return
    }

    const inViewport = () => {
      const rect = el.getBoundingClientRect()
      return rect.top < window.innerHeight * 0.95 && rect.bottom > 0
    }

    if (inViewport()) {
      show()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show()
          observer.unobserve(el)
        }
      },
      { threshold: 0.01, rootMargin: '0px 0px -5% 0px' },
    )
    observer.observe(el)

    // Fallback: never leave content invisible if observer fails
    const fallback = window.setTimeout(show, 2500)

    return () => {
      window.clearTimeout(fallback)
      observer.disconnect()
    }
  }, [])

  const hiddenTransform =
    direction === 'left'  ? '-translate-x-7' :
    direction === 'right' ? 'translate-x-7'  :
    'translate-y-7'

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${hiddenTransform}`
      } ${className}`}
      style={{ transitionDelay: visible ? '0ms' : `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// ─── SECTION WRAPPER ─────────────────────────────────────────
export function Section({
  children,
  className = '',
  id,
  style,
}: {
  children: React.ReactNode
  className?: string
  id?: string
  style?: React.CSSProperties
}) {
  return (
    <section id={id} className={`px-12 max-lg:px-6 ${className}`} style={style}>
      {children}
    </section>
  )
}
