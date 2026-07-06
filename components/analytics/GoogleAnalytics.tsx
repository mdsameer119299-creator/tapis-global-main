/**
 * GoogleAnalytics — loads the GA4 (gtag.js) tag when a public Measurement ID is
 * configured via NEXT_PUBLIC_GA_ID. Renders nothing otherwise, so the site works
 * with no analytics in dev / before a property exists.
 *
 * The Measurement ID (G-XXXXXXXXXX) is public by design and is the ONLY value
 * needed here — never place API secrets in client components. Events are sent by
 * lib/analytics.ts via window.gtag / dataLayer, which this tag initialises.
 */
import Script from 'next/script'

export default function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID
  if (!id) return null

  return (
    <>
      <Script
        id="ga4-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  )
}
