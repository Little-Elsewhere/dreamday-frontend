'use client'

import { Logout01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { logout } from '@/features/auth/actions/auth'

type Props = {
  compactLabel?: boolean
}

export const SignOutButton = ({ compactLabel = false }: Props) => {
  const t = useTranslations('account')
  const [pending, setPending] = useState(false)

  const handleSignOut = async () => {
    setPending(true)
    try {
      await logout()
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={compactLabel ? 'min-h-11 gap-2 px-3 sm:px-4' : undefined}
      aria-label={compactLabel ? t('actions.signOut') : undefined}
      loading={pending}
      loadingLabel={t('actions.signingOut')}
      onClick={() => void handleSignOut()}
    >
      {compactLabel && (
        <HugeiconsIcon
          aria-hidden="true"
          className="size-4"
          icon={Logout01Icon}
          size={16}
          strokeWidth={1.7}
        />
      )}
      <span className={compactLabel ? 'hidden sm:inline' : undefined}>{t('actions.signOut')}</span>
    </Button>
  )
}
