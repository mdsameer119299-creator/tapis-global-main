import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PRODUCT_CATEGORIES } from '@/lib/products'
import FocusHeading from '@/components/crafttrack/admin/FocusHeading'
import StatusBadge from '@/components/crafttrack/admin/StatusBadge'
import SendLoginLinkButton from '@/components/crafttrack/admin/SendLoginLinkButton'
import AddJourneyForm from './AddJourneyForm'

export const dynamic = 'force-dynamic'

export default async function OrderDetailPage({ params }: { params: { orderId: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      customer: true,
      journeys: {
        orderBy: { createdAt: 'asc' },
        include: {
          journeyTemplate: { select: { name: true } },
          currentStage: { select: { draftName: true, publishedName: true, publishedStatus: true } },
          stages: { select: { draftName: true, draftStatus: true, publishedStatus: true }, orderBy: { sequence: 'asc' } },
        },
      },
    },
  })

  if (!order) notFound()

  const templates = await prisma.journeyTemplate.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true },
  })
  const products = PRODUCT_CATEGORIES.map((p) => ({ slug: p.slug, name: p.name }))

  return (
    <div>
      <FocusHeading className="font-display text-2xl text-ink mb-1 outline-none">{order.orderNumber}</FocusHeading>
      <div className="flex items-center gap-4 mb-8">
        <p className="text-sm text-ink-m">
          {order.customer.name} · {order.customer.email}
        </p>
        <SendLoginLinkButton customerId={order.customer.id} hasPassword={!!order.customer.passwordHash} />
      </div>

      <div className="flex flex-col gap-4 mb-10">
        {order.journeys.map((journey) => {
          const currentLabel = journey.currentStage
            ? journey.currentStage.publishedName ?? journey.currentStage.draftName
            : null

          return (
            <Link
              key={journey.id}
              href={`/admin/crafttrack/journeys/${journey.id}`}
              className="block bg-white border border-ivory-k rounded-sm p-5 hover:border-gold transition-colors focus-visible:ring-2 focus-visible:ring-gold/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-ink font-medium">{journey.productName}</span>
                <span className="text-2xs text-ink-m">{journey.journeyTemplate.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {currentLabel ? (
                  <>
                    <span className="text-ink-s">{currentLabel}</span>
                    {journey.currentStage?.publishedStatus && <StatusBadge status={journey.currentStage.publishedStatus} />}
                  </>
                ) : (
                  <span className="text-ink-m text-2xs">No current stage yet — publish a stage to set one.</span>
                )}
              </div>
              <div className="flex gap-1.5 mt-4">
                {journey.stages.map((stage, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className={`h-1.5 flex-1 rounded-full ${
                      stage.publishedStatus === 'COMPLETE'
                        ? 'bg-ink'
                        : stage.publishedStatus
                          ? 'bg-gold'
                          : 'bg-ivory-d'
                    }`}
                  />
                ))}
              </div>
            </Link>
          )
        })}
      </div>

      <details className="bg-white border border-ivory-k rounded-sm p-5">
        <summary className="text-sm text-ink cursor-pointer select-none">+ Add another journey to this order</summary>
        <div className="mt-4">
          <AddJourneyForm orderId={order.id} templates={templates} products={products} />
        </div>
      </details>
    </div>
  )
}
