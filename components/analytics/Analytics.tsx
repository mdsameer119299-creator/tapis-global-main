'use client'

/**
 * components/analytics/Analytics.tsx
 *
 * Loads Google Analytics 4 and Microsoft Clarity ONLY when their public env IDs
 * are present, so the site is fully functional (and privacy-clean) with no IDs:
 *   NEXT_PUBLIC_GA_MEASUREMENT_ID   e.g. G-XXXXXXXXXX
 *   NEXT_PUBLIC_CLARITY_PROJECT_ID  e.g. abcdefghij
 *
 * - GA4 is configured with send_page_view:false and we fire a manual page_view
 *   on App-Router client navigation (via usePathname) to avoid duplicate views.
 * - next/script afterInteractive prevents duplicate injection across renders.
 * - Clarity masking: lead forms and the TARA chat are wrapped with
 *   data-clarity-mask="true" (Clarity's supported attribute-based masking) so no
 *   chat text / PII is captured in session recordings. See docs/ANALYTICS-SETUP.md.
 */

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { trackPageView } from '@/lib/analytics'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID

export default function Analytics() {
  const pathname = usePathname()
  const firstLoad = useRef(true)

  useEffect(() => {
    if (!GA_ID) return
    // Skip the very first pathname effect: GA4 'config' already sends the
    // initial view. Fire manual page_view only on subsequent client navigation.
    if (firstLoad.current) { firstLoad.current = false; return }
    trackPageView(pathname)
  }, [pathname])

  return (
    <>
      {GA_ID && (
        <>
          <Script id="ga4-src" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = window.gtag || gtag;
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { anonymize_ip: true, send_page_view: true });
          `}</Script>
        </>
      )}

      {CLARITY_ID && (
        <Script id="ms-clarity" strategy="afterInteractive">{`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${CLARITY_ID}");
        `}</Script>
      )}
    </>
  )
}
