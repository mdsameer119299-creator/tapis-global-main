import { ENQUIRY_SUBMIT_ERROR } from '@/lib/enquiry-form'

export type EnquiryFormType = 'contact' | 'inquiry' | 'custom' | 'catalogue' | 'tara'

export type SubmitEnquiryResult =
  | { ok: true }
  | { ok: false; error: string }

export async function submitEnquiry(
  formType: EnquiryFormType,
  fields: Record<string, string>,
): Promise<SubmitEnquiryResult> {
  try {
    const res = await fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formType, fields, website: '' }),
    })

    const data = (await res.json()) as { ok?: boolean; error?: string }

    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error ?? ENQUIRY_SUBMIT_ERROR }
    }

    return { ok: true }
  } catch {
    return { ok: false, error: ENQUIRY_SUBMIT_ERROR }
  }
}

export async function submitEnquiryWithFile(
  formType: EnquiryFormType,
  fields: Record<string, string>,
  file?: File | null,
): Promise<SubmitEnquiryResult> {
  try {
    const body = new FormData()
    body.append('formType', formType)
    body.append('fields', JSON.stringify(fields))
    body.append('website', '')
    if (file) body.append('attachment', file)

    const res = await fetch('/api/enquiry', { method: 'POST', body })
    const data = (await res.json()) as { ok?: boolean; error?: string }

    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error ?? ENQUIRY_SUBMIT_ERROR }
    }

    return { ok: true }
  } catch {
    return { ok: false, error: ENQUIRY_SUBMIT_ERROR }
  }
}
