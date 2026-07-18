// PR2.1 hardening: tests for sendAndRecordStageNotification
// (lib/crafttrack/send-stage-notification.ts) — both the success and
// failure recording paths that make notification history/retry possible.

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const require = createRequire(import.meta.url)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })

let pass = 0, fail = 0
const ok = (n, c, d = '') => { if (c) { pass++; console.log(`  ok  ${n}`) } else { fail++; console.log(`  FAIL ${n} ${d}`) } }

function makeFakeDb() {
  const created = []
  return {
    db: { notification: { async create({ data }) { created.push(data); return { id: `n-${created.length}`, ...data } } } },
    created,
  }
}

const baseInput = {
  journeyId: 'journey-1',
  stageId: 'stage-3',
  stageName: 'Handcrafting in Progress',
  orderNumber: 'TGI-2026-0158',
  customerEmail: 'customer@example.com',
  customerName: 'Sarah Al Maktoum',
}

// ── Successful send ────────────────────────────────────────────────────────
{
  const { sendAndRecordStageNotification } = jiti('../lib/crafttrack/send-stage-notification.ts')
  const { db, created } = makeFakeDb()
  let emailArgs = null
  const sendEmail = async (args) => { emailArgs = args }

  const result = await sendAndRecordStageNotification(baseInput, { sendEmail, db })

  ok('reports ok:true on a successful send', result.ok === true)
  ok('calls the email sender with the right journey/stage context', emailArgs?.journey.orderNumber === 'TGI-2026-0158'
    && emailArgs?.journey.customerEmail === 'customer@example.com'
    && emailArgs?.stageName === 'Handcrafting in Progress')
  ok('records exactly one Notification row', created.length === 1)
  ok('the row is status SENT with no error message', created[0].status === 'SENT' && created[0].errorMessage === undefined)
  ok('the row carries the stage snapshot for a future retry', created[0].stageId === 'stage-3' && created[0].stageName === 'Handcrafting in Progress')
  ok('the row records the actual recipient', created[0].recipientEmail === 'customer@example.com')
}

// ── Failed send ────────────────────────────────────────────────────────────
{
  const { sendAndRecordStageNotification } = jiti('../lib/crafttrack/send-stage-notification.ts')
  const { db, created } = makeFakeDb()
  const sendEmail = async () => { throw new Error('SMTP connection timed out') }

  const result = await sendAndRecordStageNotification(baseInput, { sendEmail, db })

  ok('reports ok:false on a failed send, never throws to the caller', result.ok === false)
  ok('still records exactly one Notification row — a failure is not silent', created.length === 1)
  ok('the row is status FAILED', created[0].status === 'FAILED')
  ok('the row captures the error message for the admin to see', created[0].errorMessage === 'SMTP connection timed out')
  ok('the row still carries the stage snapshot, so it can be retried', created[0].stageId === 'stage-3' && created[0].stageName === 'Handcrafting in Progress')
}

// ── A failure that isn't an Error instance still gets recorded ────────────
{
  const { sendAndRecordStageNotification } = jiti('../lib/crafttrack/send-stage-notification.ts')
  const { db, created } = makeFakeDb()
  const sendEmail = async () => { throw 'a plain string rejection' }

  const result = await sendAndRecordStageNotification(baseInput, { sendEmail, db })

  ok('a non-Error throw is still caught and recorded, not an unhandled rejection', result.ok === false && created.length === 1)
  ok('falls back to a generic message for a non-Error throw', created[0].errorMessage === 'Unknown error')
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
