import { z } from 'zod'

export const updateStageSchema = z.object({
  draftName: z.string().trim().min(1, 'Stage name is required').max(200),
  draftMessage: z.string().trim().max(2000).nullable().optional(),
  draftStatus: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETE']),
})

// Publish is a bodyless POST — no payload to validate, the stageId in the
// route param is the only input.
