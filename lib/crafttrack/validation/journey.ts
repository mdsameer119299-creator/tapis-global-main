import { z } from 'zod'

export const journeyFieldsSchema = z.object({
  productName: z.string().trim().min(1, 'Product name is required').max(200),
  productSlug: z.string().trim().min(1).max(100).nullable().optional(),
  journeyTemplateId: z.string().min(1, 'Select a journey template'),
})

export const addJourneySchema = journeyFieldsSchema

export const updateJourneySchema = z.object({
  productName: z.string().trim().min(1).max(200),
  productSlug: z.string().trim().min(1).max(100).nullable().optional(),
})

export const currentStageSchema = z.object({
  stageId: z.string().min(1),
})
