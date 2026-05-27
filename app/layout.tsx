import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import '@/styles/globals.css'
import { buildMetadata, TITLE_TEMPLATE } from '@/lib/metadata'
import { PAGE_META }    from '@/lib/seo'
import {
  organizationSchema,
  localBusinessSchema,
  websiteSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import Loader    from '@/components/layout/Loader'
import Navbar    from '@/components/layout/Navbar'
import Footer    from '@/components/layout/Footer'
import StickyBar from '@/components/layout/StickyBar'
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp'
import HashScroll from '@/components/layout/HashScroll'
import { fontVariables, outfit } from '@/lib/fonts'

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit:  'cover',
  themeColor:   '#4A1414',
}

// ── Root metadata exported to Next.js ────────────────────────────────────────
export const metadata: Metadata = {
  ...buildMetadata(PAGE_META.home),
  // Title template applies to all child pages automatically
  title: {
    default:  PAGE_META.home.title,
    template: TITLE_TEMPLATE,
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

        {/* Custom cursor — inline to avoid layout shift */}
        <Script id="cursor-init" strategy="afterInteractive">{`
          (function() {
            var cd = document.getElementById('cd');
            var cr = document.getElementById('cr');
            if (!cd || !cr) return;
            var mx = 0, my = 0;
            document.addEventListener('mousemove', function(e) {
              mx = e.clientX; my = e.clientY;
              cd.style.left = mx + 'px'; cd.style.top = my + 'px';
              cr.style.left = mx + 'px'; cr.style.top = my + 'px';
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
