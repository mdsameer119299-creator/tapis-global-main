import { z } from 'zod'

export const customerLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
})

export const orderLookupSchema = z.object({
  orderNumber: z.string().trim().min(1, 'Enter your order number'),
  email: z.string().trim().email('Enter a valid email address'),
})
