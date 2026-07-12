import type { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import '@/styles/globals.css'
import { buildMetadata } from '@/lib/metadata'
import { PAGE_META }    from '@/lib/seo'
import {
  organizationSchema,
  localBusinessSchema,
  websiteSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import Navbar    from '@/components/layout/Navbar'
import Footer    from '@/components/layout/Footer'
import HashScroll from '@/components/layout/HashScroll'
import { fontVariables, outfit } from '@/lib/fonts'

const Loader = dynamic(() => import('@/components/layout/Loader'), { ssr: false })
const StickyBar = dynamic(() => import('@/components/layout/StickyBar'), { ssr: false })
const FloatingWhatsApp = dynamic(() => import('@/components/layout/FloatingWhatsApp'), { ssr: false })
const Analytics = dynamic(() => import('@/components/analytics/Analytics'), { ssr: false })
const AttributionInit = dynamic(() => import('@/components/analytics/AttributionInit'), { ssr: false })
const Consent = dynamic(() => import('@/components/analytics/Consent'), { ssr: false })
const Tara = dynamic(() => import('@/components/tara/Tara'), { ssr: false })

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit:  'cover',
  themeColor:   '#4A1414',
}

// ── Root metadata exported to Next.js ────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(PAGE_META.home.canonical!),
  ...buildMetadata(PAGE_META.home),
  title: {
    default:  PAGE_META.home.title,
    template: '%s',
  },
}

// ── Prebuilt JSON-LD for layout-level schemas ─────────────────────────────────
const LAYOUT_JSONLD = JSON.stringify(
  buildJsonLd(
    organizationSchema(),
    localBusinessSchema(),
    websiteSchema(),
  )
)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={fontVariables}>
      <head>
        {/* ── JSON-LD: Organization + LocalBusiness + WebSite ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: LAYOUT_JSONLD }}
        />
      </head>

      <body className={outfit.className}>
        {/* Custom cursor dots (desktop only — hidden via CSS on touch devices) */}
        <div id="cd" />
        <div id="cr" />

        <Loader />
        <Navbar />
        <main id="main-content" role="main">
          <HashScroll />
          {children}
        </main>
        <Footer />
        <StickyBar />
        <FloatingWhatsApp />
        <Tara />

        {/* Privacy-safe analytics — no-ops without NEXT_PUBLIC_* IDs, and GA4/
            Clarity load only after explicit consent. */}
        <Consent />
        <Analytics />
        <AttributionInit />

        {/* Custom cursor — desktop pointer devices only */}
        <Script id="cursor-init" strategy="lazyOnload">{`
          (function() {
            if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
            var cd = document.getElementById('cd');
            var cr = document.getElementById('cr');
            if (!cd || !cr) return;
            document.addEventListener('mousemove', function(e) {
              cd.style.left = e.clientX + 'px'; cd.style.top = e.clientY + 'px';
              cr.style.left = e.clientX + 'px'; cr.style.top = e.clientY + 'px';
            }, { passive: true });
            document.addEventListener('mousedown', function() {
              cr.style.width = '20px'; cr.style.height = '20px';
            });
            document.addEventListener('mouseup', function() {
              cr.style.width = '28px'; cr.style.height = '28px';
            });
          })();
        `}</Script>
      </body>
    </html>
  )
}
