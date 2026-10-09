import type { ReactElement } from 'react'

import { AuthLoading } from '@/features/auth/components/common/auth-loading'

const Loading = (): ReactElement => <AuthLoading variant="error" />

export default Loading
