import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublishedJourneyView } from '@/lib/crafttrack/published-journey'
import PublishedJourneyView from '@/components/crafttrack/PublishedJourneyView'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false } }

// Deliberately outside the (dashboard) route group — this renders exactly
// what a customer will see (via the same PublishedJourneyView PR3 reuses),
// so it should not be wrapped in the admin shell's top bar/nav. Auth is
// still enforced: middleware.ts protects every /admin/crafttrack/* path
// regardless of which layout a page happens to sit under.
export default async function JourneyPreviewPage({ params }: { params: { journeyId: string } }) {
  const data = await getPublishedJourneyView(params.journeyId)
  if (!data) notFound()

  return (
    <div className="min-h-screen bg-ivory font-body py-10 px-6">
      <div className="max-w-3xl mx-auto mb-8 flex items-center justify-between">
        <Link href={`/admin/crafttrack/journeys/${params.journeyId}`} className="text-2xs text-ink-m underline underline-offset-4">
          ← Back to workspace
        </Link>
        <span className="text-2xs uppercase tracking-wide text-gold-d">Previewing customer experience</span>
      </div>
      <PublishedJourneyView journey={data.journey} stages={data.stages} messages={data.messages} />
    </div>
  )
}
