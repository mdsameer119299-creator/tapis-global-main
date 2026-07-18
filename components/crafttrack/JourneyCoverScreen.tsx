import Image from 'next/image'

type Props = {
  productName: string
  orderNumber: string
  coverImageUrl: string | null
  onEnter: () => void
}

/** "Recreate the anticipation of opening a portfolio" — shown every time a
 * customer opens their journey, not just the first time (no navigation
 * happens on Enter, just a client-side reveal — see JourneyExperience —
 * so a bookmark/refresh always lands back here). This screen's image is
 * this route's LCP candidate, hence priority. */
export default function JourneyCoverScreen({ productName, orderNumber, coverImageUrl, onEnter }: Props) {
  return (
    <div className="relative min-h-[calc(100vh-0px)] flex items-end justify-center overflow-hidden">
      {coverImageUrl ? (
        <Image
          src={coverImageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-ivory-d to-ink" aria-hidden="true" />
      )}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(26,19,16,.05) 45%, rgba(26,19,16,.9))' }}
      />

      <div className="relative text-center px-6 pb-16 sm:pb-20" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}>
        <p className="text-2xs uppercase tracking-widest text-gold mb-4">
          CraftTrack™ <span className="text-ivory/50">· {orderNumber}</span>
        </p>
        <h1 className="font-display text-4xl sm:text-5xl text-ivory mb-4">{productName}</h1>
        <p className="font-serif text-base text-ivory/75 mb-10">Your masterpiece is underway.</p>
        <button
          type="button"
          onClick={onEnter}
          className="border border-gold text-gold rounded-full px-8 py-3 text-sm tracking-wide focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          Enter Journey <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}
