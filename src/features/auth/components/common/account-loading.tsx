import type { ReactElement } from 'react'
import { getTranslations } from 'next-intl/server'

import { Skeleton } from '@/components/ui/skeleton'

export const AccountLoading = async (): Promise<ReactElement> => {
  const t = await getTranslations('auth.common')

  return (
    <main className="bg-surface text-ink min-h-svh antialiased" aria-busy="true">
      <p className="sr-only" role="status">
        {t('messages.loadingAccount')}
      </p>
      <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col px-6 py-8 md:px-12 md:py-10">
        <header
          className="border-line flex items-center justify-between gap-6 border-b pb-6"
          aria-hidden="true"
        >
          <Skeleton className="bg-skeleton rounded-auth h-6 w-32 motion-reduce:animate-none" />
          <Skeleton className="bg-skeleton rounded-auth h-4 w-20 motion-reduce:animate-none" />
        </header>

        <div
          className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-2 lg:gap-20"
          aria-hidden="true"
        >
          <div className="max-w-xl">
            <Skeleton className="bg-skeleton rounded-auth mb-5 h-3.5 w-28 motion-reduce:animate-none" />
            <div className="grid gap-2">
              <Skeleton className="bg-skeleton rounded-auth h-10 w-full max-w-96 motion-reduce:animate-none md:h-14" />
              <Skeleton className="bg-skeleton rounded-auth h-10 w-3/4 max-w-80 motion-reduce:animate-none md:h-14" />
            </div>
            <div className="mt-6 grid max-w-md gap-2">
              <Skeleton className="bg-skeleton rounded-auth h-5 w-full motion-reduce:animate-none" />
              <Skeleton className="bg-skeleton rounded-auth h-5 w-4/5 motion-reduce:animate-none" />
            </div>

            <div className="border-line mt-10 border-t pt-7">
              <Skeleton className="bg-skeleton rounded-auth h-4 w-28 motion-reduce:animate-none" />
              <Skeleton className="bg-skeleton rounded-auth mt-2 h-5 w-56 max-w-full motion-reduce:animate-none" />
              <Skeleton className="bg-skeleton rounded-auth mt-7 h-11 w-32 motion-reduce:animate-none" />
            </div>
          </div>

          <Skeleton className="bg-skeleton rounded-auth relative hidden aspect-4/5 overflow-hidden motion-reduce:animate-none lg:block" />
        </div>
      </div>
    </main>
  )
}
