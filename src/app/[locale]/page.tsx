import { ROUTES } from '@/constants/routes'
import { redirect } from '@/i18n/navigation'

export const instant = false

type Props = {
  params: Promise<{ locale: string }>
}

const Home = async ({ params }: Props) => {
  const { locale } = await params

  redirect({ href: ROUTES.PUBLIC.AUTH.LOGIN, locale })
}

export default Home
