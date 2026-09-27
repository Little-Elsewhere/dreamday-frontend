import { ROUTES } from '@/constants/routes'
import { redirect } from '@/i18n/navigation'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function Home({ params }: Props) {
  const { locale } = await params

  redirect({ href: ROUTES.PUBLIC.AUTH.LOGIN, locale })
}
