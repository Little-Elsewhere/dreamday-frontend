import 'server-only'

import { serverEnv } from '@/env/server'
import { Locale } from '@/constants/locale'

export const getRedirectPathname = (pathname: string, locale: Locale): string =>
  serverEnv.NEXT_PUBLIC_APP_URL.concat(`/${locale}`).concat(pathname)
