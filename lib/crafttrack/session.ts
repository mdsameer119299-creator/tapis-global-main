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

const SESSION_DURATION = '7d'

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

export const CUSTOMER_SESSION_COOKIE = 'crafttrack_session'
export const ADMIN_SESSION_COOKIE = 'crafttrack_admin_session'

export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days, matches SESSION_DURATION
