import { randomInt } from 'crypto'

/** Generates a human-facing tracking number, e.g. TGI-2026-0158. Collision
 * risk is handled by the caller retrying on the DB's unique-constraint error
 * (astronomically rare at this order volume, but never assumed impossible). */
export function generateOrderNumber(now: Date = new Date()): string {
  const year = now.getFullYear()
  const suffix = String(randomInt(0, 10000)).padStart(4, '0')
  return `TGI-${year}-${suffix}`
}
