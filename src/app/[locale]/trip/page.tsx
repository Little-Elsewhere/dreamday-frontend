import { TripPage } from '@/features/trip/component/trip-page'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('page.tripList')

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function Page() {
  const t = await getTranslations('trips.tripList')

  return (
    <Suspense fallback={<TripPageFallback label={t('loading')} />}>
      <TripPage />
    </Suspense>
  )
}

function TripPageFallback({ label }: { label: string }) {
  return (
    <div className="bg-page min-h-screen animate-pulse" aria-busy="true">
      <div className="border-divider bg-surface h-18 border-b" aria-hidden="true" />
      <main className="w-page max-w-page max-mobile:w-page-compact mx-auto px-1 pt-10 pb-20">
        <div className="sr-only" role="status" aria-label={label} />
        <div className="bg-divider mb-3 h-3 w-28 rounded" aria-hidden="true" />
        <div className="bg-divider h-10 max-w-lg rounded" aria-hidden="true" />
        <div className="bg-divider mt-3 h-5 max-w-2xl rounded" aria-hidden="true" />
        <div className="mt-10 grid gap-4" aria-hidden="true">
          <div className="bg-surface border-divider h-40 rounded-xl border" />
          <div className="bg-surface border-divider h-40 rounded-xl border" />
        </div>
      </main>
    </div>
  )
}
