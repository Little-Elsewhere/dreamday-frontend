'use client'

import { useTranslations } from 'next-intl'
import { FormProvider } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SelectField } from '@/components/ui/select-field'
import { Textarea } from '@/components/ui/textarea'
import { createTrip } from '@/features/trips/actions/trips'
import { currencyCodes, createTripSchema } from '@/features/trips/schemas/trip'
import { useRouter } from '@/i18n/navigation'
import { actionError } from '@/features/trips/utils/action-error'
import { ZoneField } from './zone-field'
import { useTripActionForm } from '@/features/trips/hooks/use-trip-action-form'

export const CreateTripForm = (): React.JSX.Element => {
  const t = useTranslations('trips')
  const errors = useTranslations('trips.errors.messages')
  const router = useRouter()
  const defaultValues = {
    name: '',
    destination: '',
    description: '',
    startsOn: '',
    endsOn: '',
    timeZone: 'Asia/Ho_Chi_Minh',
    currencyCode: 'VND' as const,
  }
  const { form, result, pending, submit } = useTripActionForm({
    schema: createTripSchema,
    action: createTrip,
    defaultValues,
    onSuccess: ({ id }) => router.push(`/trips/${id}`),
  })
  const error = actionError(result, errors)

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={submit}
        className="border-line bg-surface grid gap-6 rounded-2xl border p-6 shadow-sm md:grid-cols-2 md:p-10"
      >
        <Input
          name="name"
          label={t('trip.labels.name')}
          containerClassName="md:col-span-2"
          required
          maxLength={120}
          placeholder={t('trip.placeholders.name')}
        />
        <Input
          name="destination"
          label={t('trip.labels.destination')}
          containerClassName="md:col-span-2"
          required
          maxLength={160}
          placeholder={t('trip.placeholders.destination')}
        />
        <Input name="startsOn" label={t('trip.labels.startsOn')} type="date" required />
        <Input name="endsOn" label={t('trip.labels.endsOn')} type="date" required />
        <ZoneField
          name="timeZone"
          label={t('trip.labels.timeZone')}
          description={t('trip.descriptions.timeZone')}
        />
        <SelectField
          name="currencyCode"
          label={t('trip.labels.currency')}
          options={currencyCodes.map((code) => ({ value: code, label: code }))}
          required
          description={t('trip.descriptions.currency')}
        />
        <Textarea
          name="description"
          label={t('trip.labels.description')}
          containerClassName="md:col-span-2"
          maxLength={1000}
          rows={3}
          placeholder={t('trip.placeholders.description')}
        />
        {error && (
          <p role="alert" className="text-error-text md:col-span-2">
            {error}
          </p>
        )}
        <div className="md:col-span-2">
          <Button
            type="submit"
            loading={pending}
            loadingLabel={t('common.actions.saving')}
            className="w-full md:w-auto"
          >
            {t('trip.actions.save')}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
