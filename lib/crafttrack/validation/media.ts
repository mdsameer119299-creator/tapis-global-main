import { z } from 'zod'

export const updateMediaSchema = z.object({
  caption: z.string().trim().max(300).nullable().optional(),
  isHero: z.boolean().optional(),
})
