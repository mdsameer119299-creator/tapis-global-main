import Image from 'next/image'
import Link from 'next/link'
import { SITE, PRODUCT_DROPDOWN } from '@/lib/data'
import { BRAND } from '@/lib/seo'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'

const FOOTER_EXPLORE = [
  { label: 'About Us',      href: '/about' },
  { label: 'Products',      href: '/products' },
  { label: 'Custom Carpets', href: '/custom' },
  { label: 'Gallery',       href: '/gallery' },
  { label: 'Catalogue',     href: '/catalogue' },
  { label: 'Blogs',         href: '/blogs' },
  { label: 'Design Studio', href: '/design-studio' },
  { label: 'Contact Us',    href: '/contact' },
]

const SOCIAL_LINKS = [
  {
    label: 'LinkedIn',
    href: BRAND.social.linkedin,
    bg: '#0A66C2',
    Icon: LinkedInIcon,
  },
  {
    label: 'Instagram',
    href: BRAND.social.instagram,
    bg: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    Icon: InstagramIcon,
  },
  {
    label: 'Facebook',
    href: BRAND.social.facebook,
    bg: '#1877F2',
    Icon: FacebookIcon,
  },
  {
    label: 'X (Twitter)',
    href: `https://twitter.com/${BRAND.social.twitter.replace('@', '')}`,
    bg: '#000000',
    Icon: XIcon,
  },
]

export default function Footer() {
  return (
    <footer style={{ background: '#0D0A08' }}>
      {/* Banner strip */}
      <div className="relative h-52 overflow-hidden">
        <div className="relative w-full h-full fill-frame">
          <Image
            src="/images/tgi-banner-7.jpg"
            alt="Tapis Global artisan weaving — Bhadohi, India"
            fill
            loading="lazy"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            quality={75}
            sizes="100vw"
            className="object-cover object-center"
            style={{ filter: 'brightness(0.28) saturate(0.65) sepia(0.12)', opacity: 0.9 }}
          />
        </div>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(13,10,8,0.05) 0%, rgba(13,10,8,0.92) 100%)' }}
        />
        <div className="absolute bottom-8 left-12 max-lg:left-6 max-lg:right-6">
          <p className="text-[9.5px] tracking-[0.32em] uppercase mb-2" style={{ color: 'var(--gl)' }}>
            Est. {SITE.established} · Bhadohi, India
          </p>
          <p
            className="font-display font-light text-[28px] max-md:text-[24px] italic leading-snug"
            style={{ fontFamily: '"Cormorant Garamond", serif', color: 'rgba(255,255,255,0.9)' }}
          >
            {SITE.tagline}
          </p>
        </div>
      </div>

      {/* Gold accent line */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(192,155,74,0.45), transparent)' }} />

      {/* Main footer */}
      <div className="max-w-[1280px] mx-auto px-12 max-lg:px-6 py-14 max-md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr] gap-12 lg:gap-10">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-8 max-w-full" aria-label="Tapis Global home">
              <Image
                src="/logos/tgi-footer-logo1.png"
                alt="Tapis Global International Pvt Ltd"
                width={1024}
                height={245}
                loading="lazy"
                quality={95}
                sizes="(max-width: 640px) 100vw, 194px"
                className="block h-[59px] sm:h-[64px] w-auto max-w-full object-contain object-left"
                style={{ filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.35))' }}
              />
            </Link>
            <p
              className="text-[15px] italic font-light mb-6 leading-relaxed max-w-sm"
              style={{ fontFamily: '"EB Garamond", serif', color: 'rgba(255,255,255,0.38)' }}
            >
              Premium handmade carpets & rugs from the heartland of Indian weaving — Bhadohi, UP.
            </p>

            <div className="flex flex-col gap-4 mb-7">
              <FooterContactBlock icon={<MapPinIcon />} label={SITE.corporateOffice.label}>
                {SITE.corporateOffice.lines.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </FooterContactBlock>
              <FooterContactBlock icon={<MapPinIcon />} label={SITE.manufacturingFacility.label}>
                {SITE.manufacturingFacility.lines.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </FooterContactBlock>
              <a
                href={`tel:${SITE.phoneTel}`}
                className="flex items-start gap-2.5 text-[13px] transition-colors duration-200 hover:text-[var(--gl)]"
                style={{ color: 'rgba(255,255,255,0.42)' }}
              >
                <span className="mt-0.5 flex-shrink-0" style={{ color: 'var(--g)' }}><PhoneIconSm /></span>
                <span>
                  <span className="block text-[10px] tracking-[0.14em] uppercase mb-0.5" style={{ color: 'var(--gd)' }}>Phone</span>
                  {SITE.phone}
                </span>
              </a>
              <FooterContactBlock icon={<MailIconSm />} label="Email Us">
                {SITE.emails.map((item) => (
                  <a
                    key={item.address}
                    href={`mailto:${item.address}`}
                    className="block transition-colors duration-200 hover:text-[var(--gl)]"
                  >
                    {item.address}
                  </a>
                ))}
              </FooterContactBlock>
            </div>

            {/* Social — brand colours */}
            <p className="text-[9.5px] tracking-[0.28em] uppercase mb-3" style={{ color: 'var(--gd)' }}>
              Follow Us
            </p>
            <div className="flex flex-wrap gap-2.5">
              {SOCIAL_LINKS.map(({ label, href, bg, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-full transition-transform duration-200 hover:scale-110 hover:shadow-lg"
                  style={{ background: bg }}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <FooterHeading>Explore</FooterHeading>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_EXPLORE.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="footer-link">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <FooterHeading>Products</FooterHeading>
            <ul className="flex flex-col gap-2.5">
              {PRODUCT_DROPDOWN.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="footer-link">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-[1280px] mx-auto px-12 max-lg:px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[12px] text-center sm:text-left" style={{ color: 'rgba(255,255,255,0.22)' }}>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className="text-[11px] tracking-[0.12em] uppercase" style={{ color: 'rgba(255,255,255,0.18)' }}>
            Handmade in India · Pan India Projects · Global Quality
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterContactBlock({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5 text-[13px]" style={{ color: 'rgba(255,255,255,0.42)' }}>
      <span className="mt-0.5 flex-shrink-0" style={{ color: 'var(--g)' }}>{icon}</span>
      <span>
        <span className="block text-[10px] tracking-[0.14em] uppercase mb-1" style={{ color: 'var(--gd)' }}>{label}</span>
        {children}
      </span>
    </div>
  )
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] tracking-[0.3em] uppercase font-semibold mb-5 pb-3 border-b" style={{ color: 'var(--g)', borderColor: 'rgba(192,155,74,0.2)' }}>
      {children}
    </p>
  )
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  )
}

function PhoneIconSm() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.33A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 5.55 5.55l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  )
}

function MailIconSm() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}
