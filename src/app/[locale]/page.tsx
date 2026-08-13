import { Button } from '@/components/ui/button'
import { getTranslations } from 'next-intl/server'

export const generateMetadata = async () => {
  const t = await getTranslations('page')
  return {
    title: t('home'),
  }
}

const Home = async () => {
  const t = await getTranslations('common')

  return (
    <div>
      <Button>Click me</Button>
      <h1>{t('say_hello')}</h1>
    </div>
  )
}

export default Home
