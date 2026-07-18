import { SignJWT, jwtVerify } from 'jose'

// Session payloads are intentionally narrow. Order-lookup mode issues a
// session SCOPED to the one order that was looked up (orderId set, no
// account-wide access) — a visitor who proves they know an order number +
// the matching email should be able to view that order, not browse every
// order belonging to that customer. Full account access (all orders) only
// comes from a real email+password login.
export type CustomerSessionPayload =
  | { type: 'customer'; scope: 'order'; customerId: string; orderId: string }
  | { type: 'customer'; scope: 'account'; customerId: string }

export type AdminSessionPayload = { type: 'admin'; adminId: string; email: string }

/** A single-purpose action token, not a login session — proves "an admin
 * emailed this customer a link recently," nothing more. Deliberately short-
 * lived and narrow (just customerId) so it can't be repurposed as a login
 * credential if it ever leaked. */
export type CustomerPasswordSetupPayload = { type: 'customer-password-setup'; customerId: string }

const SESSION_DURATION = '7d'
const PASSWORD_SETUP_TOKEN_DURATION = '24h'

function getSecret(): Uint8Array {
  const secret = process.env.CRAFTTRACK_SESSION_SECRET
  if (!secret) {
    throw new Error('CRAFTTRACK_SESSION_SECRET is not set — see docs/CRAFTTRACK-SETUP.md')
  }
  return new TextEncoder().encode(secret)
}

export async function signCustomerSession(payload: CustomerSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecret())
}

export async function signAdminSession(payload: AdminSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecret())
}

/** Edge-runtime-safe (jose, no native deps) — used by both middleware.ts and API routes. */
export async function verifyCustomerSession(token: string): Promise<CustomerSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (payload.type !== 'customer') return null
    return payload as unknown as CustomerSessionPayload
  } catch {
    return null
  }
}

export async function verifyAdminSession(token: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (payload.type !== 'admin') return null
    return payload as unknown as AdminSessionPayload
  } catch {
    return null
  }
}

/** Issued by an admin action (send-login-link) — emailed to the customer,
 * never shown in the admin UI itself. Redeeming it (set-password route)
 * both sets the password AND is the only way this token gets used, so
 * there's no separate "invalidate on use" step needed: a stale/reused link
 * just sets the password again to whatever the visitor enters. */
export async function signCustomerPasswordSetupToken(customerId: string): Promise<string> {
  return new SignJWT({ type: 'customer-password-setup', customerId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(PASSWORD_SETUP_TOKEN_DURATION)
    .sign(getSecret())
}

export async function verifyCustomerPasswordSetupToken(token: string): Promise<CustomerPasswordSetupPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (payload.type !== 'customer-password-setup') return null
    return payload as unknown as CustomerPasswordSetupPayload
  } catch {
    return null
  }
}

export const CUSTOMER_SESSION_COOKIE = 'crafttrack_session'
export const ADMIN_SESSION_COOKIE = 'crafttrack_admin_session'

export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days, matches SESSION_DURATION
