export type EnquiryFieldErrors = {
  fullName?: string
  mobile?: string
  email?: string
  message?: string
}

const JUNK_MESSAGES = new Set(['test', 'hello', 'abc', '123', 'asdf', 'qwerty', 'hi', 'hey'])

function normalizeSpaces(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

function extractDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function isFakeMobile(digits: string): boolean {
  const core = digits.length > 10 ? digits.slice(-10) : digits
  if (core.length < 10) return true
  if (/^0+$/.test(core)) return true
  if (/^1+$/.test(core)) return true
  if (core === '1234567890') return true
  if (/^(\d)\1{9}$/.test(core)) return true
  return false
}

export function validateFullName(value: string): string | null {
  const name = normalizeSpaces(value)
  if (name.length < 2) return 'Please enter your full name'
  if (/^\d+$/.test(name)) return 'Please enter your full name'
  return null
}

export function validateMobile(value: string): string | null {
  const digits = extractDigits(value)
  if (digits.length < 10) return 'Please enter a valid mobile number'
  if (isFakeMobile(digits)) return 'Please enter a valid mobile number'
  return null
}

export function validateEmail(value: string): string | null {
  const email = value.trim().toLowerCase()
  if (!email) return 'Please enter a valid email address'

  const re = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
  if (!re.test(email)) return 'Please enter a valid email address'

  const [, domain = ''] = email.split('@')
  if (!domain.includes('.') || domain.endsWith('.') || domain.startsWith('.')) {
    return 'Please enter a valid email address'
  }

  const tld = domain.split('.').pop() ?? ''
  if (tld.length < 2) return 'Please enter a valid email address'

  return null
}

export function validateMessage(value: string): string | null {
  const message = value.trim()
  if (message.length < 10) return 'Please provide brief project details'
  if (JUNK_MESSAGES.has(message.toLowerCase())) return 'Please provide brief project details'
  if (/^\d+$/.test(message)) return 'Please provide brief project details'
  return null
}

/** Require at least one valid contact method — email and/or mobile. */
export function validateContactChannel(email: string, mobile: string): Pick<EnquiryFieldErrors, 'email' | 'mobile'> {
  const errors: Pick<EnquiryFieldErrors, 'email' | 'mobile'> = {}
  const emailValue = email.trim()
  const mobileValue = mobile.trim()

  if (!emailValue && !mobileValue) {
    const msg = 'Please enter a valid email or mobile number'
    errors.email = msg
    errors.mobile = msg
    return errors
  }

  if (emailValue) {
    const emailError = validateEmail(emailValue)
    if (emailError) errors.email = emailError
  }

  if (mobileValue) {
    const mobileError = validateMobile(mobileValue)
    if (mobileError) errors.mobile = mobileError
  }

  return errors
}

export function validateEnquiryFields(fields: {
  fullName?: string
  contactPerson?: string
  name?: string
  mobile?: string
  email?: string
  message?: string
}): EnquiryFieldErrors {
  const errors: EnquiryFieldErrors = {}

  const fullName = fields.fullName ?? fields.contactPerson ?? fields.name ?? ''
  const nameError = validateFullName(fullName)
  if (nameError) errors.fullName = nameError

  const contactErrors = validateContactChannel(fields.email ?? '', fields.mobile ?? '')
  if (contactErrors.email) errors.email = contactErrors.email
  if (contactErrors.mobile) errors.mobile = contactErrors.mobile

  const messageError = validateMessage(fields.message ?? '')
  if (messageError) errors.message = messageError

  return errors
}

export function hasEnquiryFieldErrors(errors: EnquiryFieldErrors): boolean {
  return Object.keys(errors).length > 0
}

export function normalizeEnquiryFields(fields: Record<string, string>): Record<string, string> {
  const fullName = normalizeSpaces(fields.fullName ?? fields.contactPerson ?? fields.name ?? '')
  return {
    ...fields,
    fullName,
    contactPerson: fullName,
    email: fields.email?.trim().toLowerCase() ?? '',
    mobile: fields.mobile?.trim() ?? '',
    location: normalizeSpaces(fields.location ?? fields.country ?? ''),
    message: fields.message?.trim() ?? '',
  }
}
