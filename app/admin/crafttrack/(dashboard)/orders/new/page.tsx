import { prisma } from '@/lib/prisma'
import { PRODUCT_CATEGORIES } from '@/lib/products'
import NewOrderForm from './NewOrderForm'

export const dynamic = 'force-dynamic'

export default async function NewOrderPage() {
  const templates = await prisma.journeyTemplate.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true },
  })

  const products = PRODUCT_CATEGORIES.map((p) => ({ slug: p.slug, name: p.name }))

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl text-ink mb-6">New order</h1>
      <NewOrderForm templates={templates} products={products} />
    </div>
  )
}
