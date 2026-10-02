import type { ReactElement } from 'react'
import { getTranslations } from 'next-intl/server'

import { Skeleton } from '@/components/ui/skeleton'

type AuthLoadingVariant = 'login' | 'register' | 'update-password' | 'error' | 'success'

type Props = {
  variant?: AuthLoadingVariant
}

export const AuthLoading = async ({ variant = 'login' }: Props): Promise<ReactElement> => {
  const t = await getTranslations('auth.common')
  const fieldCount =
    variant === 'register' ? 4 : variant === 'error' || variant === 'success' ? 0 : 2

  return (
    <div className="w-full" aria-busy="true">
      <p className="sr-only" id="auth-title" role="status">
        {t('messages.loading')}
      </p>

      <div aria-hidden="true">
        {variant === 'success' && (
          <Skeleton className="bg-skeleton mb-8 size-14 rounded-full motion-reduce:animate-none" />
        )}

        <div className="grid gap-3">
          <Skeleton className="bg-skeleton rounded-auth h-3.5 w-28 motion-reduce:animate-none" />
          <div className="grid gap-2">
            <Skeleton className="bg-skeleton rounded-auth h-9 w-72 max-w-full motion-reduce:animate-none md:h-14" />
            <Skeleton className="bg-skeleton rounded-auth h-9 w-52 max-w-full motion-reduce:animate-none md:h-14" />
          </div>
          <div className="mt-1 grid max-w-96 gap-2">
            <Skeleton className="bg-skeleton rounded-auth h-5 w-full motion-reduce:animate-none" />
            <Skeleton className="bg-skeleton rounded-auth h-5 w-2/3 motion-reduce:animate-none" />
          </div>
        </div>

        {variant === 'success' ? (
          <div className="mt-3 grid gap-2">
            <Skeleton className="bg-skeleton rounded-auth h-4 w-full max-w-96 motion-reduce:animate-none" />
            <Skeleton className="bg-skeleton rounded-auth h-4 w-3/4 max-w-80 motion-reduce:animate-none" />
            <Skeleton className="bg-skeleton rounded-auth mt-6 h-11 w-full motion-reduce:animate-none" />
          </div>
        ) : variant === 'error' ? (
          <div className="mt-8 grid gap-3">
            <Skeleton className="bg-skeleton rounded-auth h-11 w-full motion-reduce:animate-none" />
            <Skeleton className="bg-skeleton rounded-auth h-11 w-full motion-reduce:animate-none" />
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-5">
              {Array.from({ length: fieldCount }, (_, index) => (
                <div className="grid gap-2" key={index}>
                  <Skeleton className="bg-skeleton rounded-auth h-4 w-24 motion-reduce:animate-none" />
                  <Skeleton className="bg-skeleton rounded-auth h-12 w-full motion-reduce:animate-none" />
                  {variant === 'register' && index === 2 && (
                    <div className="mt-1 grid gap-1">
                      <Skeleton className="bg-skeleton rounded-auth h-4 w-full motion-reduce:animate-none" />
                      <Skeleton className="bg-skeleton rounded-auth h-4 w-1/2 motion-reduce:animate-none" />
                    </div>
                  )}
                </div>
              ))}
              {variant === 'login' && (
                <Skeleton className="bg-skeleton rounded-auth h-11 w-32 justify-self-end motion-reduce:animate-none" />
              )}
              <Skeleton className="bg-skeleton rounded-auth h-11 w-full motion-reduce:animate-none" />
            </div>

            {(variant === 'login' || variant === 'register') && (
              <div className="mt-6 flex min-h-11 items-center justify-center gap-2">
                <Skeleton className="bg-skeleton rounded-auth h-4 w-28 motion-reduce:animate-none" />
                <Skeleton className="bg-skeleton rounded-auth h-4 w-20 motion-reduce:animate-none" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
