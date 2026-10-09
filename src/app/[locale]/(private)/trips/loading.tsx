import { getTranslations } from 'next-intl/server'
import type { ReactElement } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

const TripListSkeleton = (): ReactElement => (
  <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
    <Skeleton className="bg-skeleton h-3.5 w-36 motion-reduce:animate-none" />
    <Skeleton className="bg-skeleton mt-3 h-11 w-72 max-w-full motion-reduce:animate-none" />
    <Skeleton className="bg-skeleton mt-3 h-5 w-full max-w-xl motion-reduce:animate-none" />
    <section className="border-line mt-8 grid gap-5 border-b pb-6 md:grid-cols-[minmax(17.5rem,26.25rem)_1fr] md:items-end">
      <Skeleton className="bg-skeleton h-13 w-full rounded-xl motion-reduce:animate-none" />
      <div className="flex gap-2 md:justify-end">
        <Skeleton className="bg-skeleton h-11 w-24 rounded-full motion-reduce:animate-none" />
        <Skeleton className="bg-skeleton h-11 w-28 rounded-full motion-reduce:animate-none" />
        <Skeleton className="bg-skeleton h-11 w-24 rounded-full motion-reduce:animate-none" />
      </div>
    </section>
    <Skeleton className="mt-6 h-6 w-40 motion-reduce:animate-none" />
    <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <article className="border-line bg-surface overflow-hidden rounded-2xl border" key={index}>
          <Skeleton className="bg-skeleton aspect-16/10 rounded-none motion-reduce:animate-none" />
          <div className="grid gap-3 p-5">
            <Skeleton className="h-5 w-3/4 motion-reduce:animate-none" />
            <Skeleton className="h-4 w-1/2 motion-reduce:animate-none" />
            <Skeleton className="mt-2 h-4 w-2/3 motion-reduce:animate-none" />
          </div>
        </article>
      ))}
    </div>
  </div>
)

const Loading = async (): Promise<ReactElement> => {
  const t = await getTranslations('trips')

  return (
    <main className="bg-paper text-ink min-h-svh antialiased" aria-busy="true">
      <p className="sr-only" role="status">
        {t('loading')}
      </p>
      <div aria-hidden="true">
        <header className="border-line bg-surface/95 sticky top-0 z-20 border-b backdrop-blur">
          <div className="mx-auto flex min-h-18 w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Skeleton className="bg-skeleton size-9 rounded-full motion-reduce:animate-none" />
              <Skeleton className="bg-skeleton h-5 w-28 motion-reduce:animate-none" />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden gap-2 sm:grid">
                <Skeleton className="bg-skeleton h-4 w-28 justify-self-end motion-reduce:animate-none" />
                <Skeleton className="bg-skeleton h-3 w-20 justify-self-end motion-reduce:animate-none" />
              </div>
              <Skeleton className="bg-skeleton rounded-auth h-11 w-32 motion-reduce:animate-none" />
              <Skeleton className="bg-skeleton rounded-auth h-11 w-10 motion-reduce:animate-none sm:w-32" />
            </div>
          </div>
        </header>
        <TripListSkeleton />
      </div>
    </main>
  )
}

export default Loading
