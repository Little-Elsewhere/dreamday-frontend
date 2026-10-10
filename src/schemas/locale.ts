import { z } from 'zod'

import { Locale } from '@/constants/locale'

export const localeSchema = z.enum(Locale)
