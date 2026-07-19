import JourneyCompleteBanner from './JourneyCompleteBanner'

type StageStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETE'

export type PublishedJourneyViewProps = {
  journey: {
    orderNumber: string
    productName: string
    productSlug: string | null
    completedAt: Date | null
    coverMedia: { url: string; altText: string | null } | null
    careGuideMedia?: { url: string } | null
    invoiceMedia?: { url: string } | null
  }
  stages: Array<{
    id: string
    sequence: number
    publishedName: string
    publishedMessage: string | null
    publishedStatus: StageStatus | null
    publishedAt: Date | null
    media: Array<{ id: string; url: string; caption: string | null; isHero: boolean }>
  }>
  messages: Array<{ id: string; body: string; createdAt: Date }>
  /** Both optional, defaulting to today's exact admin-preview behavior —
   * existing callers (the admin preview route) omit them and get byte-for-
   * byte the same render as before PR3. */
  mode?: 'preview' | 'customer'
  onOpenGallery?: (stageId: string, mediaIndex: number) => void
}

const STATUS_LABEL: Record<StageStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In progress',
  COMPLETE: 'Complete',
}

type DotState = 'complete' | 'current' | 'upcoming'

/** The stepper dot for one stage: a checked dark circle once complete, a
 * pulsing green "live" dot for whichever stage is actually happening right
 * now, and a small hollow outline for anything not started yet — so the
 * customer can tell the journey's current position at a glance, not just
 * by reading each stage's text status. */
function StageDot({ state }: { state: DotState }) {
  if (state === 'current') {
    return (
      <span className="relative flex items-center justify-center w-5 h-5 flex-shrink-0" aria-hidden="true">
        <span className="absolute inset-0 rounded-full bg-emerald-500/60 stage-dot-live-ring" />
        <span className="relative w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-ivory" />
      </span>
    )
  }
  if (state === 'complete') {
    return (
      <span
        className="flex items-center justify-center w-5 h-5 rounded-full bg-ink text-gold-p text-[10px] leading-none flex-shrink-0"
        aria-hidden="true"
      >
        ✓
      </span>
    )
  }
  return <span className="w-4 h-4 rounded-full border-2 border-ivory-k bg-ivory flex-shrink-0" aria-hidden="true" />
}

/** Renders exactly what a customer is allowed to see for a Journey —
 * Published content only, plus the structural stage-name exception
 * documented in lib/crafttrack/published-journey.ts. Shared between PR2's
 * admin preview route and PR3's real customer portal — the caller is
 * responsible for the Draft/Published filtering, this component assumes
 * that's already done and never re-implements it.
 *
 * mode="customer" changes two things: gallery thumbnails become buttons
 * (wired to onOpenGallery, for the fullscreen lightbox) instead of bare
 * images, and a completed journey renders the celebration ending instead
 * of a plain banner line. Everything else — heading hierarchy, the <ol>
 * timeline (including its stepper dots — completed/current/upcoming are
 * a presentation detail, not a Draft/Published exposure decision), alt-
 * text fallbacks — is identical in both modes. */
export default function PublishedJourneyView({
  journey,
  stages,
  messages,
  mode = 'preview',
  onOpenGallery,
}: PublishedJourneyViewProps) {
  return (
    <div className="max-w-3xl mx-auto">
      {journey.coverMedia && (
        <div className="mb-8 aspect-video bg-ivory-d overflow-hidden rounded-sm">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview keeps plain <img>; customer mode's next/image usage lives in JourneyCoverScreen */}
          <img
            src={journey.coverMedia.url}
            alt={journey.coverMedia.altText ?? journey.productName}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <h1 className="font-display text-3xl text-ink mb-1">{journey.productName}</h1>

      {journey.completedAt && mode !== 'customer' && (
        <p className="text-2xs uppercase tracking-wide text-gold-d mb-6">
          Journey complete — {journey.completedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      )}

      {stages.length === 0 ? (
        <p className="text-sm text-ink-m">
          Your CraftTrack™ journey will appear here once your order enters production.
        </p>
      ) : (
        <ol className="flex flex-col mt-6">
          {stages.map((stage, index) => {
            const isLast = index === stages.length - 1
            const dotState: DotState = !stage.publishedAt
              ? 'upcoming'
              : stage.publishedStatus === 'COMPLETE'
                ? 'complete'
                : 'current'
            const lineReached = stage.publishedStatus === 'COMPLETE'

            if (!stage.publishedAt) {
              return (
                <li key={stage.id} className={`flex gap-4 ${isLast ? '' : 'pb-10'}`}>
                  <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
                    <StageDot state={dotState} />
                    {!isLast && <span className="w-px flex-1 mt-1.5 bg-ivory-k" aria-hidden="true" />}
                  </div>
                  <div className="flex-1 min-w-0 opacity-40">
                    <h2 className="font-display text-lg text-ink-m">{stage.publishedName}</h2>
                  </div>
                </li>
              )
            }

            const hero = stage.media.find((m) => m.isHero) ?? stage.media[0] ?? null
            const gallery = stage.media.filter((m) => m.id !== hero?.id)
            const allMedia = hero ? [hero, ...gallery] : gallery

            return (
              <li key={stage.id} className={`flex gap-4 ${isLast ? '' : 'pb-10'}`}>
                <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
                  <StageDot state={dotState} />
                  {!isLast && (
                    <span className={`w-px flex-1 mt-1.5 ${lineReached ? 'bg-ink/25' : 'bg-ivory-k'}`} aria-hidden="true" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1">
                  <h2 className="font-display text-xl text-ink">{stage.publishedName}</h2>
                  <span className="text-2xs text-ink-m">
                    {stage.publishedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                {stage.publishedStatus && (
                  <p
                    className={`text-2xs uppercase tracking-wide mb-3 ${
                      dotState === 'current' ? 'text-emerald-600' : 'text-gold-d'
                    }`}
                  >
                    {STATUS_LABEL[stage.publishedStatus]}
                  </p>
                )}

                {hero &&
                  (mode === 'customer' ? (
                    <button
                      type="button"
                      onClick={() => onOpenGallery?.(stage.id, 0)}
                      aria-label={`View photo 1 of ${allMedia.length}${hero.caption ? ` — ${hero.caption}` : ''}`}
                      className="block w-full mb-4 aspect-video bg-ivory-d overflow-hidden rounded-sm focus-visible:ring-2 focus-visible:ring-gold/50"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- flattened into a real next/image inside GalleryLightbox; this thumbnail stays a plain img for layout simplicity */}
                      <img src={hero.url} alt={hero.caption ?? stage.publishedName} className="w-full h-full object-cover" />
                    </button>
                  ) : (
                    <div className="mb-4 aspect-video bg-ivory-d overflow-hidden rounded-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin preview only */}
                      <img src={hero.url} alt={hero.caption ?? stage.publishedName} className="w-full h-full object-cover" />
                    </div>
                  ))}

                {stage.publishedMessage && (
                  <p className="text-sm text-ink-s leading-relaxed mb-4">{stage.publishedMessage}</p>
                )}

                {gallery.length > 0 && (
                  <div className="flex gap-3 flex-wrap">
                    {gallery.map((item, i) =>
                      mode === 'customer' ? (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onOpenGallery?.(stage.id, i + 1)}
                          aria-label={`View photo ${i + 2} of ${allMedia.length}${item.caption ? ` — ${item.caption}` : ''}`}
                          className="focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail only, full image opens in GalleryLightbox */}
                          <img src={item.url} alt={item.caption ?? stage.publishedName} className="w-20 h-20 object-cover rounded-sm" />
                        </button>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element -- admin preview only
                        <img
                          key={item.id}
                          src={item.url}
                          alt={item.caption ?? stage.publishedName}
                          className="w-20 h-20 object-cover rounded-sm"
                        />
                      ),
                    )}
                  </div>
                )}
                </div>
              </li>
            )
          })}
        </ol>
      )}

      {mode === 'customer' && journey.completedAt && (
        <JourneyCompleteBanner
          finalPhotoUrl={
            [...stages].reverse().find((s) => s.media.some((m) => m.isHero))?.media.find((m) => m.isHero)?.url ??
            journey.coverMedia?.url ??
            null
          }
          productSlug={journey.productSlug}
          careGuideUrl={journey.careGuideMedia?.url ?? null}
          invoiceUrl={journey.invoiceMedia?.url ?? null}
        />
      )}

      {messages.length > 0 && (
        <div className="mt-12 pt-8 border-t border-ivory-k">
          <h2 className="font-display text-lg text-ink mb-4">Updates from our team</h2>
          <ul className="flex flex-col gap-4">
            {messages.map((message) => (
              <li key={message.id} className="text-sm">
                <p className="text-ink-s">{message.body}</p>
                <p className="text-2xs text-ink-m mt-1">
                  {message.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
