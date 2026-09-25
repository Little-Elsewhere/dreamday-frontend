'use client'

import type { ReactElement } from 'react'
import { useTranslations } from 'next-intl'

export function AuthLoading(): ReactElement {
  const t = useTranslations('auth.login')

  return (
    <div className="w-full" aria-busy="true">
      <p className="sr-only" id="auth-title" role="status">
        {t('messages.loading')}
      </p>
      <div className="grid w-full gap-5" aria-hidden="true">
        <span className="animate-auth-placeholder rounded-auth bg-skeleton -mb-2 block h-2.5 w-28 motion-reduce:animate-none" />
        <span className="animate-auth-placeholder rounded-auth bg-skeleton block h-18 w-[min(82%,300px)] motion-reduce:animate-none" />
        <span className="animate-auth-placeholder rounded-auth bg-skeleton block h-10 w-full max-w-90 motion-reduce:animate-none" />
        <span className="animate-auth-placeholder rounded-auth bg-skeleton block h-13 motion-reduce:animate-none" />
        <span className="animate-auth-placeholder rounded-auth bg-skeleton block h-13 motion-reduce:animate-none" />
        <span className="animate-auth-placeholder rounded-auth bg-skeleton mt-1 block h-13.5 motion-reduce:animate-none" />
      </div>
    </div>
  )
}
