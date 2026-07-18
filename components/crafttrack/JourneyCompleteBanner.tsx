import Image from 'next/image'
import Link from 'next/link'

type Props = {
  finalPhotoUrl: string | null
  productSlug: string | null
  careGuideUrl?: string | null
  invoiceUrl?: string | null
}

/** The celebratory ending for a completed journey — approved mockup screen
 * 18. Static once rendered, no client state needed. "Download Care Guide"/
 * "Download Invoice" only render as links if getPublishedJourneyView
 * actually found a journey-level JourneyMedia row with that role — absent
 * one, the link simply doesn't render (empty-state discipline, not a
 * broken link). */
export default function JourneyCompleteBanner({ finalPhotoUrl, productSlug, careGuideUrl, invoiceUrl }: Props) {
  return (
    <div className="relative mt-14 -mx-6 sm:mx-0 sm:rounded-sm overflow-hidden">
      <div className="relative min-h-[420px] flex items-center justify-center text-center px-8 py-16 bg-ink">
        {finalPhotoUrl && (
          <>
            <Image
              src={finalPhotoUrl}
              alt=""
              fill
              priority={false}
              sizes="(max-width: 768px) 100vw, 48rem"
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(180deg, rgba(26,19,16,.55), rgba(26,19,16,.88))' }}
            />
          </>
        )}
        <div className="relative">
          <p className="text-2xs uppercase tracking-wide text-gold mb-4">Journey complete</p>
          <h2 className="font-display text-4xl text-ivory mb-2">Congratulations.</h2>
          <p className="font-serif text-base text-ivory/80 mb-10">Your CraftTrack™ journey is complete.</p>

          <ul className="flex flex-col gap-4 mb-10">
            {careGuideUrl && (
              <li>
                <a href={careGuideUrl} className="text-ivory/90 text-sm underline underline-offset-4">
                  Download Care Guide
                </a>
              </li>
            )}
            {invoiceUrl && (
              <li>
                <a href={invoiceUrl} className="text-ivory/90 text-sm underline underline-offset-4">
                  Download Invoice
                </a>
              </li>
            )}
            <li>
              <Link
                href={productSlug ? `/products/${productSlug}` : '/products'}
                className="text-ivory/90 text-sm underline underline-offset-4"
              >
                Explore More Collections
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-ivory/90 text-sm underline underline-offset-4">
                Request Another Quote
              </Link>
            </li>
          </ul>

          <p className="font-display text-xl text-gold-l">Thank you.</p>
        </div>
      </div>
    </div>
  )
}
