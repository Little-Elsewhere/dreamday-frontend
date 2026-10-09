import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { ReactElement } from 'react'

import { TripCreateForm } from '@/features/trips/components/trip-create-form'
import { TripHeader } from '@/features/trips/components/trip-header'
import { getCurrentDraft } from '@/features/trips/data/trips'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('trips.create')
  return { title: t('title'), description: t('intro') }
}

const TripCreatePage = async (): Promise<ReactElement> => {
  const draft = await getCurrentDraft()
  return (
    <main className="bg-paper text-ink min-h-svh antialiased">
      <TripHeader showTripsLink />
      <TripCreateForm initialDraft={draft} />
    </main>
  )
}

export default TripCreatePage
