import { z } from 'zod'

export const mailpitSearchResponseSchema = z.looseObject({
  messages: z.array(z.looseObject({ ID: z.string() })),
})

export const mailpitMessageResponseSchema = z.looseObject({ HTML: z.string().nullish() })
