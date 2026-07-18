import { z } from 'zod'

// bcrypt silently truncates at 72 bytes — cap here so a customer never
// sets a password whose "extra" characters are quietly ignored.
const PASSWORD_MAX = 72

export const setPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters').max(PASSWORD_MAX),
    confirmPassword: z.string(),
    // Required only when changing an already-set password — verified
    // against the existing hash by the route, not by this schema.
    currentPassword: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// Used by the token-authenticated set-password route (the link an admin
// emails a customer) — the token itself is the authorization, so there's
// never a currentPassword to check, unlike setPasswordSchema above.
export const setPasswordByTokenSchema = z
  .object({
    token: z.string().min(1, 'Missing or invalid link.'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(PASSWORD_MAX),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
