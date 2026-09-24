import { getTranslations } from 'next-intl/server'

export const generateMetadata = async () => {
  const t = await getTranslations('page')
  return {
    title: t('login.title'),
  }
}

const Login = () => {
  return <div>Login</div>
}

export default Login
