import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'

import { getCurrentDraft } from '@/features/trips/actions/trips'
import { TripCreateForm } from '@/features/trips/components/trip-create-form'
import { TripCreateLoading } from '@/features/trips/components/trip-create-loading'
import { TripHeader } from '@/features/trips/components/trip-header'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('trips.create')
  return { title: t('title'), description: t('intro') }
}

const TripCreateContent = async () => {
  const draft = await getCurrentDraft()
  return (
    <main className="bg-paper text-ink min-h-svh antialiased">
      <TripHeader showTripsLink />
      <TripCreateForm initialDraft={draft} />
    </main>
  )
}

const TripCreatePage = () => (
  <Suspense fallback={<TripCreateLoading />}>
    <TripCreateContent />
  </Suspense>
)

export default TripCreatePage
