'use client'

import { useState } from 'react'
import PublishedJourneyView, { type PublishedJourneyViewProps } from './PublishedJourneyView'
import JourneyCoverScreen from './JourneyCoverScreen'
import GalleryLightbox, { type GalleryLightboxItem } from './GalleryLightbox'

type Props = {
  journey: PublishedJourneyViewProps['journey']
  stages: PublishedJourneyViewProps['stages']
  messages: PublishedJourneyViewProps['messages']
  /** Sample-journey chrome ("Sample Journey — illustrative" label) is
   * rendered by the demo page itself, outside this component — this prop
   * only suppresses nothing here today, kept for parity with the plan's
   * "isDemo" hook in case a behavioral difference is ever needed. */
  isDemo?: boolean
}

/** Owns exactly the interactive state PublishedJourneyView itself stays
 * agnostic of: the cover-screen gate and the gallery lightbox. No data
 * fetching here — everything ships in the initial server-rendered payload
 * as props, same discipline as every other page on this site. */
export default function JourneyExperience({ journey, stages, messages }: Props) {
  const [hasEnteredJourney, setHasEnteredJourney] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Flattened, in-order (hero first per stage) media list spanning every
  // published stage — a "true fullscreen lightbox" crosses stage
  // boundaries rather than being scoped to one stage at a time.
  const flatMedia: GalleryLightboxItem[] = stages.flatMap((stage) => {
    const hero = stage.media.find((m) => m.isHero) ?? stage.media[0] ?? null
    const rest = stage.media.filter((m) => m.id !== hero?.id)
    const ordered = hero ? [hero, ...rest] : rest
    return ordered.map((m) => ({ url: m.url, caption: m.caption, stageName: stage.publishedName }))
  })

  function handleOpenGallery(stageId: string, mediaIndexWithinStage: number) {
    // Translate (stageId, index-within-that-stage) into the absolute index
    // in flatMedia, since PublishedJourneyView only knows about one stage
    // at a time but the lightbox spans all of them.
    let offset = 0
    for (const stage of stages) {
      if (stage.id === stageId) {
        setLightboxIndex(offset + mediaIndexWithinStage)
        return
      }
      offset += stage.media.length
    }
  }

  if (!hasEnteredJourney) {
    return (
      <JourneyCoverScreen
        productName={journey.productName}
        orderNumber={journey.orderNumber}
        coverImageUrl={journey.coverMedia?.url ?? null}
        onEnter={() => setHasEnteredJourney(true)}
      />
    )
  }

  return (
    <div className="px-6 py-14">
      <PublishedJourneyView journey={journey} stages={stages} messages={messages} mode="customer" onOpenGallery={handleOpenGallery} />
      {lightboxIndex !== null && flatMedia.length > 0 && (
        <GalleryLightbox items={flatMedia} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </div>
  )
}
