import bcrypt from 'bcryptjs'

// bcryptjs (pure JS, no native build step) — safe in Vercel serverless
// functions. Node.js runtime only; never imported from middleware.ts.
const SALT_ROUNDS = 12

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
