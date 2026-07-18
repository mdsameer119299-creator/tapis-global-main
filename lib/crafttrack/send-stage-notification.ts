import { sendStagePublishedEmail } from './notification-email'

type NotificationWriter = {
  notification: {
    create: (args: {
      data: {
        journeyId: string
        stageId: string
        stageName: string
        type: 'STAGE_PUBLISHED'
        channel: 'EMAIL'
        recipientEmail: string
        status: 'SENT' | 'FAILED'
        errorMessage?: string
      }
    }) => Promise<unknown>
  }
}

type SendStageNotificationInput = {
  journeyId: string
  stageId: string
  stageName: string
  orderNumber: string
  customerEmail: string
  customerName: string
}

type Deps = {
  sendEmail?: typeof sendStagePublishedEmail
  db?: NotificationWriter
}

/** Sends the stage-published email and unconditionally records the
 * outcome — every attempt (first send or retry) becomes its own
 * Notification row, so the row list itself is the status history an
 * admin can see and act on, instead of a failure only ever reaching a
 * server log. Never throws: the caller (a publish route or the retry
 * route) always gets a clean {ok} result and decides what to do with it.
 *
 * sendEmail/db are injectable so this can be unit-tested without a real
 * SMTP server or database — lib/prisma.ts's singleton is only imported
 * lazily, inside the function body, so tests that always pass a fake db
 * never construct a real PrismaClient at all. */
export async function sendAndRecordStageNotification(
  input: SendStageNotificationInput,
  deps: Deps = {},
): Promise<{ ok: boolean }> {
  const sendEmail = deps.sendEmail ?? sendStagePublishedEmail
  const db = deps.db ?? (await import('@/lib/prisma')).prisma

  try {
    await sendEmail({
      journey: {
        orderNumber: input.orderNumber,
        customerEmail: input.customerEmail,
        customerName: input.customerName,
      },
      stageName: input.stageName,
    })

    await db.notification.create({
      data: {
        journeyId: input.journeyId,
        stageId: input.stageId,
        stageName: input.stageName,
        type: 'STAGE_PUBLISHED',
        channel: 'EMAIL',
        recipientEmail: input.customerEmail,
        status: 'SENT',
      },
    })

    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[crafttrack] notification failed', err)

    await db.notification.create({
      data: {
        journeyId: input.journeyId,
        stageId: input.stageId,
        stageName: input.stageName,
        type: 'STAGE_PUBLISHED',
        channel: 'EMAIL',
        recipientEmail: input.customerEmail,
        status: 'FAILED',
        errorMessage: message.slice(0, 500),
      },
    })

    return { ok: false }
  }
}
