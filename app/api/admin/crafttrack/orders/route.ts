import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession, actorEmail } from '@/lib/crafttrack/require-admin-session'
import { createOrderSchema } from '@/lib/crafttrack/validation/order'
import { createJourneyWithStages, isUniqueConstraintError } from '@/lib/crafttrack/journey-creation'
import { generateOrderNumber } from '@/lib/crafttrack/order-number'

export const runtime = 'nodejs'

const SEARCH_MAX_LENGTH = 200
const ORDER_NUMBER_MAX_ATTEMPTS = 5

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const q = (request.nextUrl.searchParams.get('q') ?? '').trim().slice(0, SEARCH_MAX_LENGTH)
  const cursor = request.nextUrl.searchParams.get('cursor')

  const orders = await prisma.order.findMany({
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
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      customer: { select: { name: true, email: true } },
      journeys: {
        select: {
          id: true,
          productName: true,
          updatedAt: true,
          currentStage: { select: { publishedStatus: true, draftStatus: true, publishedName: true, draftName: true } },
        },
      },
    },
  })

  const nextCursor = orders.length === 25 ? orders[orders.length - 1].id : null

  return NextResponse.json({ ok: true, orders, nextCursor })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const parsed = createOrderSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 })
  }

  const input = parsed.data
  const actor = actorEmail(auth.session)

  try {
    const result = await prisma.$transaction(async (tx) => {
      let customerId: string
      if (input.customer.mode === 'existing') {
        customerId = input.customer.customerId
      } else {
        // Upsert-by-email, not blind create: two staff members creating an
        // order for the same repeat customer on the same day must not 500
        // on the Customer.email unique constraint.
        const customer = await tx.customer.upsert({
          where: { email: input.customer.email },
          update: {},
          create: { name: input.customer.name, email: input.customer.email },
        })
        customerId = customer.id
      }

      let order
      for (let attempt = 0; attempt < ORDER_NUMBER_MAX_ATTEMPTS; attempt++) {
        try {
          order = await tx.order.create({
            data: { orderNumber: generateOrderNumber(), customerId },
          })
          break
        } catch (err) {
          if (isUniqueConstraintError(err, 'orderNumber') && attempt < ORDER_NUMBER_MAX_ATTEMPTS - 1) continue
          throw err
        }
      }
      if (!order) throw new Error('Could not generate a unique order number.')

      const { journey } = await createJourneyWithStages(tx, {
        orderId: order.id,
        journeyTemplateId: input.journeyTemplateId,
        productName: input.productName,
        productSlug: input.productSlug,
        actor,
      })

      return { order, journey }
    })

    return NextResponse.json({ ok: true, order: result.order, journey: result.journey }, { status: 201 })
  } catch (err) {
    console.error('[crafttrack] order creation failed', err)
    return NextResponse.json({ ok: false, error: 'Could not create the order. Please try again.' }, { status: 500 })
  }
}
