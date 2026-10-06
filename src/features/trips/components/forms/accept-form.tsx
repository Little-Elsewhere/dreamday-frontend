'use client'

import { useTranslations } from 'next-intl'
import { FormProvider } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { acceptInvitation } from '@/features/trips/actions/invitations'
import { acceptInvitationSchema } from '@/features/trips/schemas/invitation'
import { useRouter } from '@/i18n/navigation'
import { actionError } from '@/features/trips/utils/action-error'
import { useTripActionForm } from '@/features/trips/hooks/use-trip-action-form'

type Props = {
  token: string
}

export const AcceptForm = ({ token }: Props): React.JSX.Element => {
  const t = useTranslations('trips')
  const errors = useTranslations('trips.errors.messages')
  const router = useRouter()
  const { form, result, pending, submit } = useTripActionForm({
    schema: acceptInvitationSchema,
    action: acceptInvitation,
    defaultValues: { token },
    onSuccess: ({ tripId }) => router.push(`/trips/${tripId}`),
  })
  const error = actionError(result, errors)

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        <input type="hidden" {...form.register('token')} />
        {error && (
          <p role="alert" className="text-error-text">
            {error}
          </p>
        )}
        <Button type="submit" loading={pending} loadingLabel={t('common.actions.saving')}>
          {t('invitation.actions.accept')}
        </Button>
      </form>
    </FormProvider>
  )
}
