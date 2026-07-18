import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL } from '@/lib/seo'
import { DEMO_JOURNEY } from '@/lib/crafttrack/demo-fixture'
import JourneyExperience from '@/components/crafttrack/JourneyExperience'
import DemoEndCTA from '@/components/crafttrack/DemoEndCTA'

// The one /crafttrack/* route that's public and indexable — it's a sales
// tool ending in a quote request, not customer-private content.
export const metadata = buildMetadata({
  title: 'CraftTrack™ — See How We Track Your Order | Tapis Global International',
  description:
    'Experience CraftTrack™, a live walkthrough of how Tapis Global tracks a handcrafted carpet order from confirmation to dispatch — real production milestones, real photography, complete transparency.',
  canonical: `${SEO_BASE_URL}/crafttrack/demo`,
})

export default function CraftTrackDemoPage() {
  return (
    <div className="min-h-screen bg-ivory font-body">
      <div className="relative">
        <span className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-2xs uppercase tracking-wide bg-white/90 text-ink-m px-3 py-1 rounded-full border border-ivory-k">
          Sample Journey — illustrative
        </span>
        <JourneyExperience journey={DEMO_JOURNEY.journey} stages={DEMO_JOURNEY.stages} messages={DEMO_JOURNEY.messages} isDemo />
      </div>
      <div className="px-6">
        <DemoEndCTA />
      </div>
    </div>
  )
}
