import { getTranslations } from 'next-intl/server'

export const generateMetadata = async () => {
  const t = await getTranslations('offline')
  return {
    title: t('title'),
  }
}

const OfflinePage = async () => {
  const t = await getTranslations('offline')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <p className="text-muted-foreground max-w-md">{t('description')}</p>
    </main>
  )
}

export default OfflinePage
