import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCustomerSessionOrRedirect } from '@/lib/crafttrack/require-customer-session'
import { getPublishedJourneyView } from '@/lib/crafttrack/published-journey'
import JourneyExperience from '@/components/crafttrack/JourneyExperience'

export const dynamic = 'force-dynamic'

export default async function OrderPage({ params }: { params: { orderNumber: string } }) {
  const session = await requireCustomerSessionOrRedirect()

  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: { journeys: { orderBy: { createdAt: 'asc' }, select: { id: true, productName: true, media: { where: { role: 'COVER' }, select: { url: true }, take: 1 } } } },
  })

  if (!order) notFound()

  // Ownership check differs by scope. Never a 403 — a mismatch here means
  // "this isn't your order," and a 404 doesn't leak whether the order
  // number itself is real.
  const owns = session.scope === 'order' ? order.id === session.orderId : order.customerId === session.customerId
  if (!owns) notFound()

  if (order.journeys.length === 0) {
    return (
      <div className="px-6 py-24 text-center">
        <p className="text-sm text-ink-m max-w-sm mx-auto">
          Your order has been received. Your CraftTrack™ journey will begin here once production starts.
        </p>
      </div>
    )
  }

  if (order.journeys.length > 1) {
    return (
      <div className="px-6 py-14">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-2xl text-ink mb-1">{order.orderNumber}</h1>
          <p className="text-sm text-ink-m mb-8">This order includes {order.journeys.length} pieces — choose one to follow its journey.</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {order.journeys.map((journey) => (
              <Link
                key={journey.id}
                href={`/crafttrack/dashboard/${order.orderNumber}/${journey.id}`}
                className="block focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
              >
                <div className="aspect-video bg-ivory-d rounded-sm overflow-hidden mb-3">
                  {journey.media[0] && (
                    // eslint-disable-next-line @next/next/no-img-element -- small list thumbnail
                    <img src={journey.media[0].url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <p className="text-sm text-ink">{journey.productName}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const data = await getPublishedJourneyView(order.journeys[0].id)
  if (!data) notFound()

  return <JourneyExperience journey={data.journey} stages={data.stages} messages={data.messages} />
}
