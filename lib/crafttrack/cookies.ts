import type { NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, CUSTOMER_SESSION_COOKIE, SESSION_COOKIE_MAX_AGE_SECONDS } from './session'

const BASE_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export function setCustomerSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(CUSTOMER_SESSION_COOKIE, token, {
    ...BASE_COOKIE_OPTS,
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  })
}

export function clearCustomerSessionCookie(response: NextResponse): void {
  response.cookies.set(CUSTOMER_SESSION_COOKIE, '', { ...BASE_COOKIE_OPTS, maxAge: 0 })
}

export function setAdminSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    ...BASE_COOKIE_OPTS,
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  })
}

export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { ...BASE_COOKIE_OPTS, maxAge: 0 })
}
