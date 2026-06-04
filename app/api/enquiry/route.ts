import { NextResponse } from 'next/server'
import { sendEnquiryEmail } from '@/lib/enquiry-email'
import type { EnquiryFormType } from '@/lib/submit-enquiry'

export const runtime = 'nodejs'

const VALID_TYPES: EnquiryFormType[] = ['contact', 'inquiry', 'custom', 'catalogue']

function isValidType(value: string): value is EnquiryFormType {
  return (VALID_TYPES as string[]).includes(value)
}

type EnquiryPayload = {
  formType: EnquiryFormType
  fields: Record<string, string>
  attachment?: { filename: string; content: Buffer; contentType?: string }
}

function isEnquiryPayload(
  parsed: { spam?: true; error?: string; formType?: EnquiryFormType; fields?: Record<string, string> },
): parsed is EnquiryPayload {
  return Boolean(parsed.formType && parsed.fields)
}

function sanitizeFields(raw: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string' && value.trim()) {
      out[key] = value.trim().slice(0, 5000)
    }
  }
  return out
}

async function parseJsonRequest(req: Request) {
  const body = (await req.json()) as {
    formType?: string
    fields?: Record<string, unknown>
    website?: string
  }

  if (body.website?.trim()) {
    return { spam: true as const }
  }

  const formType = body.formType
  if (!formType || !isValidType(formType)) {
    return { error: 'Invalid form type.' }
  }

  const fields = sanitizeFields(body.fields ?? {})
  if (!fields.email && !fields.mobile) {
    return { error: 'Email or phone is required.' }
  }

  return { formType, fields }
}

async function parseFormDataRequest(req: Request) {
  const formData = await req.formData()

  if (String(formData.get('website') ?? '').trim()) {
    return { spam: true as const }
  }

  const formType = String(formData.get('formType') ?? '')
  if (!isValidType(formType)) {
    return { error: 'Invalid form type.' }
  }

  let fields: Record<string, unknown> = {}
  try {
    fields = JSON.parse(String(formData.get('fields') ?? '{}')) as Record<string, unknown>
  } catch {
    return { error: 'Invalid form data.' }
  }

  const clean = sanitizeFields(fields)
  if (!clean.email && !clean.mobile) {
    return { error: 'Email or phone is required.' }
  }

  const file = formData.get('attachment')
  let attachment: { filename: string; content: Buffer; contentType?: string } | undefined

  if (file && file instanceof File && file.size > 0) {
    if (file.size > 10 * 1024 * 1024) {
      return { error: 'Attachment must be under 10 MB.' }
    }
    const buffer = Buffer.from(await file.arrayBuffer())
    attachment = {
      filename: file.name,
      content: buffer,
      contentType: file.type || undefined,
    }
  }

  return { formType, fields: clean, attachment }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') ?? ''
    const parsed = contentType.includes('multipart/form-data')
      ? await parseFormDataRequest(req)
      : await parseJsonRequest(req)

    if ('spam' in parsed && parsed.spam) {
      return NextResponse.json({ ok: true })
    }

    if ('error' in parsed && parsed.error) {
      return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 })
    }

    if (!isEnquiryPayload(parsed)) {
      return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
    }

    await sendEnquiryEmail(parsed)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[enquiry]', err)
    const message =
      err instanceof Error ? err.message : 'Failed to send enquiry. Please try again later.'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
