import 'server-only'

import { serverEnv } from '@/env/server'

export const getRedirectPathname = (pathname: string): string =>
  serverEnv.NEXT_PUBLIC_APP_URL.concat(pathname)
