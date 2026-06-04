'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SITE, NAV_LINKS, PRODUCT_DROPDOWN } from '@/lib/data'

function isActivePath(pathname: string, href: string): boolean {
  if (href.startsWith('/#')) return pathname === '/'
  if (href.startsWith('/')) return pathname === href || pathname.startsWith(`${href}/`)
  return false
}

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled]         = useState(false)
  const [mobileOpen, setMobile]         = useState(false)
  const [mobileProductsOpen, setMobileProducts] = useState(false)
  const [dropOpen, setDrop]             = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50)
      const bar = document.getElementById('scroll-progress')
      if (bar) {
        const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        bar.style.width = `${pct}%`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobile(false)
    setMobileProducts(false)
    setDrop(false)
  }, [pathname])

  useEffect(() => {
    if (mobileOpen) {
      document.body.dataset.menuOpen = 'true'
    } else {
      delete document.body.dataset.menuOpen
      setMobileProducts(false)
    }
    return () => { delete document.body.dataset.menuOpen }
  }, [mobileOpen])

  return (
    <>
      <div id="scroll-progress" className="fixed top-0 left-0 h-0.5 z-[9999] transition-none" style={{ background: 'var(--g)' }} />

      <div
        id="topbar"
        className="px-4 sm:px-6 lg:px-12 py-2 flex justify-between items-center gap-2"
        style={{
          background: 'var(--cd)',
          borderBottom: '1px solid rgba(192,155,74,0.15)',
        }}
      >
        <div className="flex gap-3 sm:gap-6 items-center min-w-0">
          <a href={`tel:${SITE.phoneTel}`} className="min-w-0">
            <TopbarItem icon={<PhoneIcon />} className="truncate max-w-[140px] sm:max-w-none">
              <span className="hidden sm:inline">{SITE.phone}</span>
              <span className="sm:hidden text-[11px]">Call Us</span>
            </TopbarItem>
          </a>
          <TopbarItem icon={<MailIcon />} className="max-md:hidden">{SITE.email}</TopbarItem>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <a
            href={SITE.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] sm:text-[12.5px] tracking-wide transition-colors duration-200 touch-target inline-flex items-center"
            style={{ color: 'var(--gp)' }}
          >
            WhatsApp
          </a>
          <span className="w-px h-3 opacity-20 max-sm:hidden" style={{ background: '#fff' }} />
          <Link
            href="/design-studio"
            className="text-[11px] sm:text-[12.5px] tracking-wide transition-colors duration-200 max-sm:hidden"
            style={{ color: 'var(--gp)' }}
          >
            Request Sample
          </Link>
        </div>
      </div>

      <nav
        id="nav"
        className="sticky top-0 z-[600] flex items-center justify-between h-[72px] sm:h-[80px] lg:h-[96px] px-4 sm:px-5 lg:px-12 transition-shadow duration-300"
        style={{
          background: 'rgba(248,244,238,0.97)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(192,155,74,0.18)',
          boxShadow: scrolled ? '0 2px 28px rgba(107,31,31,0.08)' : 'none',
        }}
      >
        <Link href="/" className="flex-shrink-0 block" aria-label="Tapis Global home">
          <Image
            src="/logos/tgi-header-logo1.png"
            alt="Tapis Global International"
            width={250}
            height={72}
            priority
            quality={90}
            className="block h-[48px] sm:h-[54px] lg:h-[66px] w-auto max-w-[175px] sm:max-w-[205px] lg:max-w-[250px] object-contain object-left"
          />
        </Link>

        <ul className="hidden lg:flex list-none items-center gap-0">
          <li className="flex items-center">
            <NavLink href="/" active={pathname === '/'} className="pl-0">
              Home
            </NavLink>
            <NavDivider />
          </li>
          {NAV_LINKS.map((link, index) => {
            const isLast = index === NAV_LINKS.length - 1
            const isCta = link.cta
            const showDivider = !isLast
            return (
              <li
                key={link.label}
                className={`relative flex items-center ${isCta ? 'ml-2' : ''}`}
                onMouseEnter={link.dropdown ? () => setDrop(true) : undefined}
                onMouseLeave={link.dropdown ? () => setDrop(false) : undefined}
              >
                {link.dropdown ? (
                  <>
                    <NavLink href={link.href} active={isActivePath(pathname, link.href)} icon={
                      <svg className="nav-tab-chevron" width="9" height="6" viewBox="0 0 8 5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1l3 3 3-3"/></svg>
                    }>
                      {link.label}
                    </NavLink>
                    <div
                      className="absolute top-full left-1/2 min-w-[230px] transition-all duration-200"
                      style={{
                        background: 'var(--ink)',
                        boxShadow: '0 8px 40px rgba(26,19,16,0.35)',
                        opacity: dropOpen ? 1 : 0,
                        visibility: dropOpen ? 'visible' : 'hidden',
                        pointerEvents: dropOpen ? 'auto' : 'none',
                        transform: dropOpen ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(6px)',
                        zIndex: 9999,
                      }}
                    >
                      {PRODUCT_DROPDOWN.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block px-[22px] py-3 text-[13.5px] font-medium tracking-[0.02em] transition-all duration-150 border-b hover:bg-[var(--c)] hover:text-white hover:pl-7"
                          style={{
                            color: 'rgba(255,255,255,0.82)',
                            borderColor: 'rgba(255,255,255,0.08)',
                          }}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <NavLink
                    href={link.href}
                    active={isActivePath(pathname, link.href)}
                    highlight={link.highlight}
                    cta={link.cta}
                    badge={link.badge}
                  >
                    {link.label}
                  </NavLink>
                )}
                {showDivider && <NavDivider />}
              </li>
            )
          })}
        </ul>

        <button
          type="button"
          className="lg:hidden flex flex-col justify-center items-center gap-[5px] p-2 touch-target -mr-1"
          onClick={() => setMobile(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span
            className="block w-[22px] h-[1.5px] transition-all duration-300 origin-center"
            style={{
              background: 'var(--ink)',
              transform: mobileOpen ? 'translateY(6.5px) rotate(45deg)' : 'none',
            }}
          />
          <span
            className="block w-[22px] h-[1.5px] transition-all duration-300"
            style={{
              background: 'var(--ink)',
              opacity: mobileOpen ? 0 : 1,
            }}
          />
          <span
            className="block w-[22px] h-[1.5px] transition-all duration-300 origin-center"
            style={{
              background: 'var(--ink)',
              transform: mobileOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
            }}
          />
        </button>
      </nav>

      {/* Mobile navigation drawer */}
      <div
        className={`mobile-nav-backdrop fixed inset-0 z-[700] bg-[rgba(26,19,16,0.45)] backdrop-blur-[2px] lg:hidden ${mobileOpen ? 'is-open' : ''}`}
        onClick={() => setMobile(false)}
        aria-hidden={!mobileOpen}
      />
      <div
        className={`mobile-nav-drawer fixed top-0 right-0 z-[710] flex flex-col h-[100dvh] w-[min(100%,360px)] lg:hidden safe-bottom ${mobileOpen ? 'is-open' : ''}`}
        style={{
          background: 'rgba(248,244,238,0.98)',
          boxShadow: mobileOpen ? '-12px 0 48px rgba(26,19,16,0.18)' : 'none',
          pointerEvents: mobileOpen ? 'auto' : 'none',
        }}
        aria-hidden={!mobileOpen}
      >
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(192,155,74,0.2)' }}
        >
          <p className="text-[10px] tracking-[0.28em] uppercase font-medium" style={{ color: 'var(--gd)' }}>
            Menu
          </p>
          <button
            type="button"
            className="touch-target flex items-center justify-center text-[28px] leading-none"
            style={{ color: 'var(--inkm)' }}
            onClick={() => setMobile(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          <MobileNavLink href="/" active={pathname === '/'} onNavigate={() => setMobile(false)}>
            Home
          </MobileNavLink>

          {NAV_LINKS.map((link) => {
            if (link.dropdown) {
              const productsActive = isActivePath(pathname, link.href)
              return (
                <div key={link.label} className="border-b" style={{ borderColor: 'var(--bd)' }}>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between py-3.5 text-left touch-target"
                    onClick={() => setMobileProducts((v) => !v)}
                    aria-expanded={mobileProductsOpen}
                  >
                    <span
                      className="font-display text-[22px]"
                      style={{
                        fontFamily: '"Cormorant Garamond", serif',
                        color: productsActive ? 'var(--c)' : 'var(--ink)',
                        fontWeight: productsActive ? 700 : 600,
                      }}
                    >
                      {link.label}
                    </span>
                    <svg
                      className="transition-transform duration-300 flex-shrink-0 ml-2"
                      width="12"
                      height="8"
                      viewBox="0 0 8 5"
                      fill="none"
                      stroke="var(--inkm)"
                      strokeWidth="2"
                      style={{ transform: mobileProductsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      <path d="M1 1l3 3 3-3" />
                    </svg>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{ maxHeight: mobileProductsOpen ? `${PRODUCT_DROPDOWN.length * 44 + 16}px` : '0px' }}
                  >
                    <div className="pb-3 pl-1">
                      <Link
                        href={link.href}
                        onClick={() => setMobile(false)}
                        className="block py-2.5 text-[12px] tracking-[0.12em] uppercase font-medium"
                        style={{ color: 'var(--c)' }}
                      >
                        All Products →
                      </Link>
                      {PRODUCT_DROPDOWN.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobile(false)}
                          className="block py-2.5 text-[14px] font-light border-t"
                          style={{
                            color: pathname === item.href ? 'var(--c)' : 'var(--inks)',
                            borderColor: 'rgba(26,19,16,0.06)',
                          }}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }

            const isActive = isActivePath(pathname, link.href)
            if (link.cta) {
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobile(false)}
                  className="block mt-5 mb-2 py-3.5 text-center text-[12px] tracking-[0.16em] uppercase font-semibold touch-target"
                  style={{ background: 'var(--c)', color: '#fff' }}
                >
                  {link.label}
                </Link>
              )
            }

            return (
              <MobileNavLink
                key={link.label}
                href={link.href}
                active={isActive}
                highlight={link.highlight}
                onNavigate={() => setMobile(false)}
              >
                {link.label}
              </MobileNavLink>
            )
          })}
        </nav>

        <div className="flex-shrink-0 px-5 py-4 grid grid-cols-2 gap-2" style={{ borderTop: '1px solid rgba(192,155,74,0.2)' }}>
          <a
            href={SITE.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 text-center text-[10px] tracking-[0.12em] uppercase font-semibold touch-target"
            style={{ background: '#25D366', color: '#fff' }}
          >
            WhatsApp
          </a>
          <Link
            href="/design-studio"
            onClick={() => setMobile(false)}
            className="py-3 text-center text-[10px] tracking-[0.12em] uppercase font-semibold touch-target border"
            style={{ borderColor: 'rgba(192,155,74,0.35)', color: 'var(--inks)' }}
          >
            Design Studio
          </Link>
        </div>
      </div>
    </>
  )
}

function MobileNavLink({
  href,
  children,
  active = false,
  highlight = false,
  onNavigate,
}: {
  href: string
  children: React.ReactNode
  active?: boolean
  highlight?: boolean
  onNavigate: () => void
}) {
  const accent = active || highlight
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="block py-3.5 border-b touch-target transition-colors duration-200 active:opacity-70"
      style={{
        fontFamily: '"Cormorant Garamond", serif',
        fontSize: '22px',
        color: accent ? 'var(--c)' : 'var(--ink)',
        borderColor: 'var(--bd)',
        fontWeight: accent ? 700 : 600,
      }}
    >
      {children}
    </Link>
  )
}

function NavDivider() {
  return (
    <span
      className="mx-1 hidden xl:inline-block w-px h-4 flex-shrink-0"
      style={{ background: 'rgba(192,155,74,0.28)' }}
      aria-hidden
    />
  )
}

function NavLink({
  href,
  children,
  active = false,
  highlight = false,
  cta = false,
  badge,
  className = '',
  icon,
}: {
  href: string
  children: React.ReactNode
  active?: boolean
  highlight?: boolean
  cta?: boolean
  badge?: string
  className?: string
  icon?: React.ReactNode
}) {
  const accent = (active || highlight) && !cta
  return (
    <Link
      href={href}
      className={`nav-tab group ${accent ? 'nav-tab--active' : ''} ${cta ? 'nav-tab--cta' : ''} ${className}`}
      data-active={active || highlight || cta ? 'true' : undefined}
    >
      <span className="nav-tab-orbit" aria-hidden />
      <span className="nav-tab-label inline-flex items-center gap-1.5">
        {children}
        {badge && (
          <span
            className="nav-tab-badge text-[8px] tracking-[0.14em] uppercase font-bold px-1.5 py-0.5 leading-none"
            style={{ background: 'var(--g)', color: 'var(--ink)' }}
          >
            {badge}
          </span>
        )}
      </span>
      {icon}
    </Link>
  )
}

function TopbarItem({
  icon,
  children,
  className = '',
}: {
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={`flex items-center gap-2 text-[12.5px] tracking-[0.04em] ${className}`}
      style={{ color: 'rgba(255,255,255,0.5)' }}
    >
      {icon}
      {children}
    </span>
  )
}

function PhoneIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gl)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.33A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 5.55 5.55l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gl)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}
