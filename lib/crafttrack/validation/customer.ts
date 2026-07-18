import { z } from 'zod'

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  email: z.string().trim().email('Enter a valid email address'),
})

/** Shared by the order-creation combobox: either an existing customer id, or
 * inline fields to create one. Kept here (not order.ts) since both files
 * need it and this is the resource it's about. */
export const customerRefSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('existing'), customerId: z.string().min(1) }),
  z.object({ mode: z.literal('new'), name: z.string().trim().min(1).max(200), email: z.string().trim().email() }),
])
