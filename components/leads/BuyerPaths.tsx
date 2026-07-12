'use client'

/**
 * BuyerPaths — five buyer-segment cards, each routing to its own primary CTA.
 * Selecting a card scrolls to the qualification form and pre-selects the buyer
 * type; the WhatsApp shortcut opens a pre-filled chat. Analytics fire on intent.
 */
import { SITE } from '@/lib/data'
import { BUYER_PATHS, type BuyerType } from '@/lib/buyer-paths'
import { trackEvent, LEAD_EVENTS } from '@/lib/analytics'

export default function BuyerPaths({
  onSelect,
  source,
}: {
  onSelect: (b: BuyerType) => void
  source?: string
}) {
  return (
    <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
      {BUYER_PATHS.map((p) => {
        const wa = `${SITE.whatsapp}?text=${encodeURIComponent(p.whatsappText)}`
        return (
          <div
            key={p.id}
            className="flex flex-col rounded-sm border p-5 transition-colors"
            style={{ borderColor: 'var(--bd)', background: 'rgba(255,255,255,0.5)' }}
          >
            <h3 className="text-[16px] font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>{p.buyer}</h3>
            <p className="text-[13.5px] leading-[1.6] mb-4 flex-1" style={{ color: 'var(--inkm)' }}>{p.description}</p>
            <button
              type="button"
              onClick={() => {
                trackEvent(p.event, { buyer_type: p.id, source })
                onSelect(p.id)
                document.getElementById('qualify')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="mb-2 px-4 py-2.5 text-[13px] tracking-[0.12em] uppercase font-semibold rounded-sm transition-all hover:brightness-110"
              style={{ background: 'var(--g)', color: 'var(--ink)' }}
            >
              {p.ctaLabel}
            </button>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent(LEAD_EVENTS.whatsappClick, { buyer_type: p.id, source })}
              className="text-[12.5px] font-medium text-center"
              style={{ color: '#128C4A' }}
            >
              or message on WhatsApp →
            </a>
          </div>
        )
      })}
    </div>
  )
}
