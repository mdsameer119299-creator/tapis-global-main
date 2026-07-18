type StageStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETE'

export type PublishedJourneyViewProps = {
  journey: {
    productName: string
    productSlug: string | null
    completedAt: Date | null
    coverMedia: { url: string; altText: string | null } | null
  }
  stages: Array<{
    id: string
    sequence: number
    publishedName: string
    publishedMessage: string | null
    publishedStatus: StageStatus
    publishedAt: Date
    media: Array<{ id: string; url: string; caption: string | null; isHero: boolean }>
  }>
  messages: Array<{ id: string; body: string; createdAt: Date }>
}

/** Renders exactly what a customer is allowed to see for a Journey —
 * Published content only. Shared between PR2's admin preview route and
 * PR3's real customer portal, which is why props are plain serializable
 * data rather than Prisma models or a journeyId this component fetches
 * itself: the caller (lib/crafttrack/published-journey.ts's
 * getPublishedJourneyView, today; a customer-session-authorized loader in
 * PR3) is responsible for the Draft/Published filtering — this component
 * assumes that's already done and never re-implements it.
 *
 * Full public-site accessibility bar from day one: real heading hierarchy
 * from <h1>, a real <ol> for the stage timeline since sequence is
 * meaningful, and alt text falling back to the stage name — this exact
 * markup ships to real customers in PR3 with no rework expected. */
export default function PublishedJourneyView({ journey, stages, messages }: PublishedJourneyViewProps) {
  return (
    <div className="max-w-3xl mx-auto">
      {journey.coverMedia && (
        <div className="mb-8 aspect-video bg-ivory-d overflow-hidden rounded-sm">
          {/* eslint-disable-next-line @next/next/no-img-element -- Blob URLs aren't a configured next/image remote domain */}
          <img
            src={journey.coverMedia.url}
            alt={journey.coverMedia.altText ?? journey.productName}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <h1 className="font-display text-3xl text-ink mb-1">{journey.productName}</h1>

      {journey.completedAt && (
        <p className="text-2xs uppercase tracking-wide text-gold-d mb-6">
          Journey complete — {journey.completedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      )}

      {stages.length === 0 ? (
        <p className="text-sm text-ink-m">
          Your CraftTrack™ journey will appear here once your order enters production.
        </p>
      ) : (
        <ol className="flex flex-col gap-10 mt-6">
          {stages.map((stage) => {
            const hero = stage.media.find((m) => m.isHero) ?? stage.media[0] ?? null
            const gallery = stage.media.filter((m) => m.id !== hero?.id)

            return (
              <li key={stage.id}>
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="font-display text-xl text-ink">{stage.publishedName}</h2>
                  <span className="text-2xs text-ink-m">
                    {stage.publishedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>

                {hero && (
                  <div className="mb-4 aspect-video bg-ivory-d overflow-hidden rounded-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Blob URLs aren't a configured next/image remote domain */}
                    <img
                      src={hero.url}
                      alt={hero.caption ?? stage.publishedName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {stage.publishedMessage && (
                  <p className="text-sm text-ink-s leading-relaxed mb-4">{stage.publishedMessage}</p>
                )}

                {gallery.length > 0 && (
                  <div className="flex gap-3 flex-wrap">
                    {gallery.map((item) => (
                      // eslint-disable-next-line @next/next/no-img-element -- Blob URLs aren't a configured next/image remote domain
                      <img
                        key={item.id}
                        src={item.url}
                        alt={item.caption ?? stage.publishedName}
                        className="w-20 h-20 object-cover rounded-sm"
                      />
                    ))}
                  </div>
                )}
              </li>
            )
          })}
        </ol>
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
