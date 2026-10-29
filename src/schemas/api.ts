import { z } from 'zod'

export const messageResponseSchema = z.object({
  code: z.number().int(),
  message: z.string(),
})

export const apiErrorDetailSchema = z.object({
  detail: messageResponseSchema,
})

export type MessageResponse = z.infer<typeof messageResponseSchema>
