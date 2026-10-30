import { z } from 'zod'

export const utcInstantSchema = z.iso.datetime()
