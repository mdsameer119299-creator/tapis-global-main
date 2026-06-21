import Image from 'next/image'
import Link from 'next/link'
import { SITE } from '@/lib/data'
import { BRAND } from '@/lib/seo'
import { BLUR_PLACEHOLDER } from '@/components/ui/OptimizedImage'

const FOOTER_EXPLORE = [
  { label: 'About Us',        href: '/about' },
  { label: 'Company',         href: '/company' },
  { label: 'Products',        href: '/products' },
  { label: 'Industries',      href: '/industries' },
  { label: 'Solutions',       href: '/solutions' },
  { label: 'Dhurries & Tat Patti', href: '/dhurries' },
  { label: 'Guides',          href: '/guides' },
  { label: 'Export Markets',  href: '/countries' },
  { label: 'Custom Solutions', href: '/custom' },
  { label: 'Gallery',         href: '/gallery' },
  { label: 'Catalogue',       href: '/catalogue' },
  { label: 'Contact Us',      href: '/contact' },
]

const FOOTER_PRODUCTS = [
  { label: 'Hand Knotted Carpets', href: '/products/hand-knotted-carpet' },
  { label: 'Hand Tufted Carpets',  href: '/products/hand-tufted-carpet' },
  { label: 'Custom Rugs',          href: '/custom' },
  { label: 'Hospitality Flooring', href: '/products/wall-to-wall-carpets' },
  { label: 'Wall-to-Wall Carpets', href: '/products/wall-to-wall-carpets' },
  { label: 'Natural Fibre Rugs',   href: '/products/jute-sisal-rugs' },
]

const SOCIAL_LINKS = [
  { label: 'LinkedIn',  href: BRAND.social.linkedin,  Icon: LinkedInIcon },
  { label: 'Instagram', href: BRAND.social.instagram, Icon: InstagramIcon },
  { label: 'Facebook',  href: BRAND.social.facebook,  Icon: FacebookIcon },
  {
    label: 'X (Twitter)',
    href: `https://twitter.com/${BRAND.social.twitter.replace('@', '')}`,
    Icon: XIcon,
  },
]

const BRAND_STATEMENT =
  'Handmade carpet and rug manufacturer from Bhadohi, India — supplying premium flooring to hospitality, commercial and residential projects across India and international markets.'

export default function Footer() {
  return (
    <footer className="footer-luxury" style={{ background: '#0F0C09' }}>
      {/* Banner strip */}
      <div className="relative h-44 sm:h-48 overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src="/images/tgi-banner-7.webp"
            alt="Tapis Global artisan weaving — Bhadohi, India"
            fill
            loading="lazy"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            quality={75}
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover object-center"
            style={{ filter: 'brightness(0.42) saturate(0.7) sepia(0.08)', opacity: 0.92 }}
          />
        </div>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(15,12,9,0.08) 0%, rgba(15,12,9,0.96) 100%)' }}
        />
        <div className="footer-container absolute bottom-7 sm:bottom-8 left-0 right-0">
          <p className="text-[14px] tracking-[0.32em] uppercase mb-2" style={{ color: 'var(--gl)' }}>
            Est. {SITE.established} · Bhadohi, India
          </p>
          <p
            className="font-display font-light text-[26px] sm:text-[30px] italic leading-snug max-w-xl"
            style={{ fontFamily: '"Cormorant Garamond", serif', color: 'rgba(255,255,255,0.88)' }}
          >
            {SITE.tagline}
          </p>
        </div>
      </div>

      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(192,155,74,0.5), transparent)' }} />

      {/* Main grid */}
      <div className="footer-container py-14 sm:py-16 lg:py-[4.5rem]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-x-10 sm:gap-y-14 lg:gap-x-12 xl:gap-x-16 items-start">

          {/* Column 1 — Brand */}
          <div className="flex flex-col sm:col-span-2 lg:col-span-1 lg:max-w-[320px]">
            <Link href="/" className="inline-block mb-8 lg:mb-10" aria-label="Tapis Global home">
              <Image
                src="/logos/tgi-footer-logo1.png"
                alt="Tapis Global International Pvt Ltd"
                width={280}
                height={67}
                loading="lazy"
                quality={82}
                sizes="(max-width: 640px) 80vw, 280px"
                className="block h-[76px] sm:h-[82px] lg:h-[86px] w-auto max-w-[min(100%,280px)] object-contain object-left"
                style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.45))' }}
              />
            </Link>
            <p
              className="text-[16px] sm:text-[17px] font-light leading-[1.75] mb-8 max-w-[30ch] lg:max-w-none"
              style={{ fontFamily: '"EB Garamond", serif', color: 'rgba(255,255,255,0.72)' }}
            >
              {BRAND_STATEMENT}
            </p>
            <p className="footer-col-heading mb-4">Follow Us</p>
            <div className="flex flex-wrap gap-3">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="footer-social-btn"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Explore */}
          <div className="flex flex-col">
            <FooterHeading>Explore</FooterHeading>
            <ul className="flex flex-col gap-3.5">
              {FOOTER_EXPLORE.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="footer-link">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Products */}
          <div className="flex flex-col">
            <FooterHeading>Products</FooterHeading>
            <ul className="flex flex-col gap-3.5">
              {FOOTER_PRODUCTS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="footer-link">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div className="flex flex-col sm:col-span-2 lg:col-span-1">
            <FooterHeading>Contact</FooterHeading>
            <div className="footer-contact-panel flex flex-col gap-6 sm:gap-7">
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
                className="footer-contact-item group"
              >
                <span className="footer-contact-icon"><PhoneIconSm /></span>
                <span>
                  <span className="footer-contact-label">Phone</span>
                  <span className="footer-contact-value group-hover:text-[var(--gl)] transition-colors duration-300">
                    {SITE.phone}
                  </span>
                </span>
              </a>

              <FooterContactBlock icon={<MailIconSm />} label="Email Us">
                {SITE.emails.map((item) => (
                  <a
                    key={item.address}
                    href={`mailto:${item.address}`}
                    className="block footer-contact-value hover:text-[var(--gl)] transition-colors duration-300"
                  >
                    {item.address}
                  </a>
                ))}
              </FooterContactBlock>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px w-full mx-auto footer-container" style={{ background: 'linear-gradient(90deg, transparent, rgba(192,155,74,0.35), transparent)' }} />

      {/* Bottom bar */}
      <div className="footer-container py-6 sm:py-7">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
          <p className="text-[14px] sm:text-[15px] text-center md:text-left leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
            © 2026 {SITE.name}. All Rights Reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-2">
            <Link href="/privacy-policy" className="footer-legal-link">
              Privacy Policy
            </Link>
            <span className="hidden sm:inline w-px h-3" style={{ background: 'rgba(192,155,74,0.25)' }} aria-hidden />
            <Link href="/terms-and-conditions" className="footer-legal-link">
              Terms &amp; Conditions
            </Link>
          </div>
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
    <div className="footer-contact-item">
      <span className="footer-contact-icon">{icon}</span>
      <span>
        <span className="footer-contact-label">{label}</span>
        <span className="footer-contact-value">{children}</span>
      </span>
    </div>
  )
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="footer-col-heading mb-6 min-h-[2.75rem] flex items-end pb-3 border-b w-full">
      {children}
    </h3>
  )
}

function LinkedInIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-13h4v2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="2" y="9" width="4" height="12" rx="0.5" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 4l16 16M20 4L4 20" strokeLinecap="round" />
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function PhoneIconSm() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.07 1.18 2 2 0 012 .01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14z" />
    </svg>
  )
}

function MailIconSm() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}
