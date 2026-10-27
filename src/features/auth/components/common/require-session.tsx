import 'server-only'

import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export const RequireSession = ({ children }: Props): ReactNode => {
  return children
}
