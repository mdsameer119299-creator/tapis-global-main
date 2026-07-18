import { z } from 'zod'
import { customerRefSchema } from './customer'
import { journeyFieldsSchema } from './journey'

/** The combined create-flow payload: customer (existing or new) + order +
 * its first journey, all created in one transaction. See
 * lib/crafttrack/journey-creation.ts for the transaction itself. */
export const createOrderSchema = z.object({
  customer: customerRefSchema,
  ...journeyFieldsSchema.shape,
})
