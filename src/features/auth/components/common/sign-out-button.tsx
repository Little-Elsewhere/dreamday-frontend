'use client'

import { useState, type ReactElement } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { useRouter } from '@/i18n/navigation'
import { signOutAction } from '@/features/auth/actions'

export function SignOutButton(): ReactElement {
  const t = useTranslations('account')
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)

  async function handleSignOut(): Promise<void> {
    setPending(true)
    setError(false)

    try {
      const result = await signOutAction()
      if (!result.success) {
        setError(true)
        return
      }

      router.replace(ROUTES.PUBLIC.AUTH.LOGIN)
      router.refresh()
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
