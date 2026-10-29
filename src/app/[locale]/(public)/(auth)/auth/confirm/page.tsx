import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'

import { AuthLoading } from '@/features/auth/components/common/auth-loading'
import { ConfirmEmailResult } from '@/features/auth/components/common/confirm-email-result'
import { readSearchParam } from '@/features/auth/utils/search-params'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('auth.confirm')
  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

const ConfirmEmailContent = async ({ searchParams }: Props) => {
  const params = await searchParams
  return <ConfirmEmailResult token={readSearchParam(params.token)} />
}

const ConfirmEmailPage = ({ searchParams }: Props) => (
  <Suspense fallback={<AuthLoading variant="success" />}>
    <ConfirmEmailContent searchParams={searchParams} />
  </Suspense>
)

export default ConfirmEmailPage
