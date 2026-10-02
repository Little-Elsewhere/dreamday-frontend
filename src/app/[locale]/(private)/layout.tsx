import type { ReactElement, ReactNode } from 'react'
import { Suspense } from 'react'

import { AuthLoading } from '@/features/auth/components/common/auth-loading'
import { RequireSession } from '@/features/auth/components/common/require-session'

interface PrivateLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

const PrivateLayout = ({ children, params }: PrivateLayoutProps): ReactElement => (
  <Suspense fallback={<AuthLoading />}>
    <RequireSession params={params}>{children}</RequireSession>
  </Suspense>
)

export default PrivateLayout
