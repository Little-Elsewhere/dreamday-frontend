'use client'

import { useState, type ReactElement } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { useRouter } from '@/i18n/navigation'
import { signOut } from '@/features/auth/actions/auth'

export const SignOutButton = (): ReactElement => {
  const t = useTranslations('account')
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)

  const handleSignOut = async (): Promise<void> => {
    setPending(true)
    setError(false)

    try {
      await signOut()
      router.replace(ROUTES.PUBLIC.AUTH.LOGIN)
    } catch {
      setError(true)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => void handleSignOut()}
        loading={pending}
        loadingLabel={t('actions.signingOut')}
      >
        {t('actions.signOut')}
      </Button>
      {error && (
        <p role="alert" className="text-error-text text-sm">
          {t('messages.signOutFailed')}
        </p>
      )}
    </div>
  )
}
