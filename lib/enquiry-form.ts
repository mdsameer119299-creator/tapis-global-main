export const ENQUIRY_TRUST_INDICATORS = [
  'Response within 12 working hours',
  'Dedicated Project Consultant',
  'Worldwide Project Support',
] as const

export const ENQUIRY_ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.jpg', '.jpeg', '.png', '.zip'] as const

export const ENQUIRY_ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'application/zip',
  'application/x-zip-compressed',
] as const

export const ENQUIRY_MAX_FILE_BYTES = 10 * 1024 * 1024

export const ENQUIRY_FILE_ACCEPT =
  '.pdf,.docx,.jpg,.jpeg,.png,.zip,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,application/zip'

export const ENQUIRY_SUBMIT_ERROR =
  'Unable to submit enquiry at the moment. Please try again or contact us directly.'

export function isAllowedEnquiryAttachment(file: File): boolean {
  if (file.size > ENQUIRY_MAX_FILE_BYTES) return false
  const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : ''
  if (ENQUIRY_ACCEPTED_EXTENSIONS.includes(ext as (typeof ENQUIRY_ACCEPTED_EXTENSIONS)[number])) {
    return true
  }
  return ENQUIRY_ACCEPTED_MIME_TYPES.includes(file.type as (typeof ENQUIRY_ACCEPTED_MIME_TYPES)[number])
}

export function enquiryAttachmentError(file: File): string | null {
  if (file.size > ENQUIRY_MAX_FILE_BYTES) {
    return 'Attachment must be under 10 MB.'
  }
  if (!isAllowedEnquiryAttachment(file)) {
    return 'Only PDF, DOCX, JPG, PNG, and ZIP files are accepted.'
  }
  return null
}
