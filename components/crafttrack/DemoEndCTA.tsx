import Link from 'next/link'

export default function DemoEndCTA() {
  return (
    <div className="bg-ink px-8 py-16 text-center -mx-6 sm:mx-0 sm:rounded-sm mt-14">
      <h2 className="font-display text-3xl text-ivory mb-3">Ready to start your own CraftTrack™?</h2>
      <p className="font-serif text-sm text-ivory/70 mb-10 max-w-md mx-auto">
        Every TAPIS order carries this same visibility, from loom to delivery.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/contact"
          className="border border-gold text-gold rounded-full px-8 py-3 text-sm tracking-wide focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          Request a Quote
        </Link>
        <Link
          href="/catalogue"
          className="text-ivory/80 text-sm underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-gold/60 rounded-sm"
        >
          Request Catalogue
        </Link>
      </div>
    </div>
  )
}
