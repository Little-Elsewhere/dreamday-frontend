'use client'

import { useTranslations, useLocale } from 'next-intl'
import { FormProvider } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SelectField } from '@/components/ui/select-field'
import { inviteMember } from '@/features/trips/actions/invitations'
import { invitationSchema } from '@/features/trips/schemas/invitation'
import { useRouter } from '@/i18n/navigation'
import { actionError } from '@/features/trips/utils/action-error'
import { useTripActionForm } from '@/features/trips/hooks/use-trip-action-form'

type Props = {
  tripId: string
  tripName: string
}

export const InviteForm = ({ tripId, tripName }: Props): React.JSX.Element => {
  const t = useTranslations('trips')
  const errors = useTranslations('trips.errors.messages')
  const locale = useLocale()
  const router = useRouter()
  const { form, result, pending, submit } = useTripActionForm({
    schema: invitationSchema,
    action: inviteMember,
    defaultValues: { tripId, email: '', role: 'member' as const },
    onSuccess: () => router.refresh(),
  })
  const error = actionError(result, errors)
  const url =
    result?.success && typeof window !== 'undefined'
      ? `${window.location.origin}/${locale}/invitations/${result.data.token}`
      : ''

  return (
    <div className="flex flex-col gap-4">
      <FormProvider {...form}>
        <form noValidate onSubmit={submit} className="flex flex-col gap-3">
          <Input name="email" label={t('members.labels.inviteEmail')} type="email" required />
          <SelectField
            name="role"
            label={t('members.labels.role')}
            options={[
              { value: 'editor', label: t('members.labels.roles.editor') },
              { value: 'member', label: t('members.labels.roles.member') },
              { value: 'viewer', label: t('members.labels.roles.viewer') },
            ]}
          />
          {error && (
            <p role="alert" className="text-error-text text-sm">
              {error}
            </p>
          )}
          <Button type="submit" loading={pending} loadingLabel={t('common.actions.saving')}>
            {t('members.actions.invite')}
          </Button>
        </form>
      </FormProvider>
      {result?.success && (
        <div className="bg-paper rounded-md p-3 text-sm">
          <p>{t('invitation.labels.link')}</p>
          <input
            readOnly
            value={url}
            aria-label={t('invitation.labels.link')}
            className="border-line bg-surface mt-2 w-full rounded border p-2"
          />
          <a
            className="text-primary mt-2 inline-block underline"
            href={`mailto:${encodeURIComponent(result.data.email)}?subject=${encodeURIComponent(tripName)}&body=${encodeURIComponent(url)}`}
          >
            {t('invitation.actions.sendEmail')}
          </a>
        </div>
      )}
    </div>
  )
}
