import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import JourneyWorkspace from './JourneyWorkspace'

export const dynamic = 'force-dynamic'

export default async function JourneyWorkspacePage({ params }: { params: { journeyId: string } }) {
  const journey = await prisma.journey.findUnique({
    where: { id: params.journeyId },
    select: { id: true },
  })

  if (!journey) notFound()

  return <JourneyWorkspace journeyId={params.journeyId} />
}
