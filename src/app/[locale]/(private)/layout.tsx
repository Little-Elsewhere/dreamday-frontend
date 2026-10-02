import type { ReactElement, ReactNode } from 'react'
import { Suspense } from 'react'

import { RequireSession } from '@/features/auth/components/common/require-session'
import { AccountLoading } from './account-loading'

interface PrivateLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

const PrivateLayout = ({ children, params }: PrivateLayoutProps): ReactElement => (
  <Suspense fallback={<AccountLoading />}>
    <RequireSession params={params}>{children}</RequireSession>
  </Suspense>
)

export default PrivateLayout
