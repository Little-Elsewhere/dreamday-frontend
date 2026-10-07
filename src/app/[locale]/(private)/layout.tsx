import type { ReactElement, ReactNode } from 'react'
import { Suspense } from 'react'

import { RequireSession } from '@/features/auth/components/common/require-session'
import { SessionLoading } from '@/features/auth/components/common/session-loading'

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

const PrivateLayout = ({ children, params }: Props): ReactElement => (
  <Suspense fallback={<SessionLoading />}>
    <RequireSession params={params}>{children}</RequireSession>
  </Suspense>
)

export default PrivateLayout
