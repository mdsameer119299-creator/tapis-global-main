import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminDataTable from '@/components/crafttrack/admin/AdminDataTable'
import StatusBadge from '@/components/crafttrack/admin/StatusBadge'

export const dynamic = 'force-dynamic'

type OrderRow = Awaited<ReturnType<typeof loadOrders>>[number]

async function loadOrders(q: string) {
  return prisma.order.findMany({
    where: q
      ? {
          OR: [
            { orderNumber: { contains: q, mode: 'insensitive' } },
            { customer: { name: { contains: q, mode: 'insensitive' } } },
            { customer: { email: { contains: q, mode: 'insensitive' } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    take: 25,
    include: {
      customer: { select: { name: true } },
      journeys: {
        select: {
          productName: true,
          updatedAt: true,
          currentStage: { select: { draftStatus: true, publishedStatus: true } },
        },
      },
    },
  })
}

function journeySummary(order: OrderRow) {
  if (order.journeys.length === 0) return { label: '—', status: null as null | 'PENDING' | 'IN_PROGRESS' | 'COMPLETE' }
  if (order.journeys.length > 1) return { label: `${order.journeys.length} journeys`, status: null }
  const [journey] = order.journeys
  return { label: journey.productName, status: journey.currentStage?.publishedStatus ?? null }
}

export default async function CraftTrackOrdersPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? '').trim().slice(0, 200)
  const orders = await loadOrders(q)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Orders</h1>
        <Link
          href="/admin/crafttrack/orders/new"
          className="bg-ink text-gold-p rounded-sm px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-gold/50"
        >
          + New order
        </Link>
      </div>

      <form method="get" className="mb-6" role="search">
        <label htmlFor="order-search" className="sr-only">
          Search orders by order number or customer
        </label>
        <input
          id="order-search"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search by order number or customer…"
          className="w-full max-w-md bg-white border border-ivory-k rounded-sm px-3 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
        />
      </form>

      <AdminDataTable
        caption="Orders"
        emptyMessage={q ? `No orders match "${q}".` : 'No orders yet — create the first one.'}
        rows={orders}
        getRowKey={(order) => order.id}
        getRowHref={(order) => `/admin/crafttrack/orders/${order.id}`}
        columns={[
          { key: 'orderNumber', header: 'Order', render: (order) => order.orderNumber },
          { key: 'customer', header: 'Customer', render: (order) => order.customer.name },
          {
            key: 'stage',
            header: 'Stage',
            render: (order) => {
              const summary = journeySummary(order)
              return summary.status ? (
                <span className="flex items-center gap-2">
                  {summary.label} <StatusBadge status={summary.status} />
                </span>
              ) : (
                summary.label
              )
            },
          },
          {
            key: 'updated',
            header: 'Updated',
            render: (order) => new Date(order.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          },
        ]}
      />
    </div>
  )
}
