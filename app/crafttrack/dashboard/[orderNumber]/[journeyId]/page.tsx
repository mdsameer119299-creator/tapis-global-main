import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCustomerSessionOrRedirect } from '@/lib/crafttrack/require-customer-session'
import { getPublishedJourneyView } from '@/lib/crafttrack/published-journey'
import JourneyExperience from '@/components/crafttrack/JourneyExperience'

export const dynamic = 'force-dynamic'

// Only reached for a multi-journey (multi-piece) order, or a direct
// bookmark/link — the single-journey case renders straight at
// /crafttrack/dashboard/[orderNumber] with no hop through here.
export default async function OrderJourneyPage({ params }: { params: { orderNumber: string; journeyId: string } }) {
  const session = await requireCustomerSessionOrRedirect()

  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    select: { id: true, customerId: true },
  })
  if (!order) notFound()

  const owns = session.scope === 'order' ? order.id === session.orderId : order.customerId === session.customerId
  if (!owns) notFound()

  const journey = await prisma.journey.findUnique({ where: { id: params.journeyId }, select: { orderId: true } })
  if (!journey || journey.orderId !== order.id) notFound()

  const data = await getPublishedJourneyView(params.journeyId)
  if (!data) notFound()

  return <JourneyExperience journey={data.journey} stages={data.stages} messages={data.messages} />
}
