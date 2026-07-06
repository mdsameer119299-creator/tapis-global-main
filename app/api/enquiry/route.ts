import { NextResponse } from 'next/server'
import { sendEnquiryEmail } from '@/lib/enquiry-email'
import {
  ENQUIRY_ACCEPTED_EXTENSIONS,
  ENQUIRY_ACCEPTED_MIME_TYPES,
  ENQUIRY_MAX_FILE_BYTES,
  ENQUIRY_SUBMIT_ERROR,
} from '@/lib/enquiry-form'
import { checkEnquiryRateLimit, getClientIp } from '@/lib/enquiry-rate-limit'
import {
  hasEnquiryFieldErrors,
  normalizeEnquiryFields,
  validateEnquiryFields,
  validateContactChannel,
  validateFullName,
  validateMessage,
} from '@/lib/enquiry-validation'
import type { EnquiryFormType } from '@/lib/submit-enquiry'
import { withLeadScore } from '@/lib/lead-scoring'

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

function validateFieldsForType(formType: EnquiryFormType, fields: Record<string, string>): string | null {
  if (formType === 'inquiry') {
    const normalized = normalizeEnquiryFields(fields)
    const errors = validateEnquiryFields(normalized)
    if (hasEnquiryFieldErrors(errors)) {
      return Object.values(errors)[0] ?? 'Please check your enquiry details.'
    }
    return null
  }

  const name = fields.fullName ?? fields.name ?? ''
  const nameErr = validateFullName(name)
  if (nameErr) {
    return nameErr
  }

  if (formType === 'custom') {
    const messageErr = validateMessage(fields.message ?? '')
    if (messageErr) {
      return messageErr
    }
  }

  const contactErrors = validateContactChannel(fields.email ?? '', fields.mobile ?? '')
  if (contactErrors.email || contactErrors.mobile) {
    return contactErrors.email ?? contactErrors.mobile ?? 'Please enter a valid email or mobile number.'
  }

  return null
}

function isAllowedAttachment(filename: string, mimeType: string): boolean {
  const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')).toLowerCase() : ''
  const extOk = ENQUIRY_ACCEPTED_EXTENSIONS.includes(ext as (typeof ENQUIRY_ACCEPTED_EXTENSIONS)[number])
  const mimeOk = mimeType
    ? ENQUIRY_ACCEPTED_MIME_TYPES.includes(mimeType as (typeof ENQUIRY_ACCEPTED_MIME_TYPES)[number])
    : false
  return extOk || mimeOk
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
  const validationError = validateFieldsForType(formType, fields)
  if (validationError) {
    return { error: validationError }
  }

  return {
    formType,
    fields: formType === 'inquiry' ? normalizeEnquiryFields(fields) : fields,
  }
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
  const validationError = validateFieldsForType(formType, clean)
  if (validationError) {
    return { error: validationError }
  }

  const normalized = formType === 'inquiry' ? normalizeEnquiryFields(clean) : clean

  const file = formData.get('attachment')
  let attachment: { filename: string; content: Buffer; contentType?: string } | undefined

  if (file && file instanceof File && file.size > 0) {
    if (file.size > ENQUIRY_MAX_FILE_BYTES) {
      return { error: 'Attachment must be under 10 MB.' }
    }
    if (!isAllowedAttachment(file.name, file.type)) {
      return { error: 'Only PDF, DOCX, JPG, PNG, and ZIP files are accepted.' }
    }
    const buffer = Buffer.from(await file.arrayBuffer())
    attachment = {
      filename: file.name,
      content: buffer,
      contentType: file.type || undefined,
    }
  }

  return { formType, fields: normalized, attachment }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    const rate = checkEnquiryRateLimit(ip)
    if (!rate.allowed) {
      console.warn('[enquiry] rate limited', { ip, retryAfterMs: rate.retryAfterMs })
      return NextResponse.json(
        { ok: false, error: 'Too many submissions. Please wait a moment and try again.' },
        { status: 429 },
      )
    }

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

    // Server-side geo attribution from the edge/CDN headers (present on Vercel).
    // Real signal only — omitted when the platform doesn't provide it.
    const geo: Record<string, string> = {}
    const country = req.headers.get('x-vercel-ip-country')
    const cityRaw = req.headers.get('x-vercel-ip-city')
    const region = req.headers.get('x-vercel-ip-country-region')
    if (country) geo.visitorCountry = country
    if (cityRaw) { try { geo.visitorCity = decodeURIComponent(cityRaw) } catch { geo.visitorCity = cityRaw } }
    if (region) geo.visitorRegion = region
    parsed.fields = { ...parsed.fields, ...geo }

    // Classify the lead (Hot/Warm/Cold) from submitted data and attach the
    // score to the payload so it appears in the lead email + CRM ingest.
    parsed.fields = withLeadScore(parsed.fields)

    const delivery = await sendEnquiryEmail(parsed)

    if (delivery.internal.status !== 'sent') {
      console.error('[enquiry] internal email failed', delivery.internal)
      return NextResponse.json({ ok: false, error: ENQUIRY_SUBMIT_ERROR }, { status: 500 })
    }

    console.info('[enquiry] delivery report', {
      ip,
      internal: delivery.internal,
      acknowledgement: delivery.acknowledgement,
    })

    return NextResponse.json({
      ok: true,
      emailDelivery: process.env.NODE_ENV === 'development' ? delivery : undefined,
    })
  } catch (err) {
    console.error('[enquiry]', err)
    return NextResponse.json({ ok: false, error: ENQUIRY_SUBMIT_ERROR }, { status: 500 })
  }
}
