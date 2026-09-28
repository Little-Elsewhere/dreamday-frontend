import { TripPage } from '@/features/trip/component/trip-page'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('page.tripList')

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

export default function Page() {
  return <TripPage />
}
