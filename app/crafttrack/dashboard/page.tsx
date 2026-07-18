import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCustomerSessionOrRedirect } from '@/lib/crafttrack/require-customer-session'

export const dynamic = 'force-dynamic'

export default async function CraftTrackDashboardPage() {
  const session = await requireCustomerSessionOrRedirect()

  // Order-scope sessions can only ever see the one order they were issued
  // for — no list step, straight to it. "The session literally can't see
  // any other order."
  if (session.scope === 'order') {
    const order = await prisma.order.findUnique({ where: { id: session.orderId }, select: { orderNumber: true } })
    if (!order) redirect('/crafttrack/access')
    redirect(`/crafttrack/dashboard/${order.orderNumber}`)
  }

  const orders = await prisma.order.findMany({
    where: { customerId: session.customerId },
    orderBy: { createdAt: 'desc' },
    include: {
      journeys: {
        select: {
          productName: true,
          media: { where: { role: 'COVER' }, select: { url: true }, take: 1 },
          currentStage: { select: { publishedName: true } },
        },
      },
    },
  })

  return (
    <div className="px-6 py-14">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-2xl text-ink mb-8">Your orders</h1>

        {orders.length === 0 ? (
          <p className="text-sm text-ink-m">No orders yet — your CraftTrack™ journey will appear here once you place an order.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {orders.map((order) => {
              const journey = order.journeys[0]
              return (
                <Link
                  key={order.id}
                  href={`/crafttrack/dashboard/${order.orderNumber}`}
                  className="block focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
                >
                  <div className="aspect-video bg-ivory-d rounded-sm overflow-hidden mb-3">
                    {journey?.media[0] && (
                      // eslint-disable-next-line @next/next/no-img-element -- small list thumbnail, next/image not warranted for this size
                      <img src={journey.media[0].url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <p className="text-sm text-ink">{journey?.productName ?? order.orderNumber}</p>
                  <p className="text-2xs text-ink-m">
                    {order.orderNumber}
                    {journey?.currentStage && ` · ${journey.currentStage.publishedName}`}
                  </p>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
