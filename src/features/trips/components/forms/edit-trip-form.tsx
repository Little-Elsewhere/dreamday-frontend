'use client'

import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'
import { SelectField } from '@/components/ui/select-field'
import { Textarea } from '@/components/ui/textarea'
import { ActionForm } from './action-form'
import { ZoneField } from './zone-field'
import { updateTrip } from '@/features/trips/actions/trips'
import { currencyCodes, updateTripSchema } from '@/features/trips/schemas/trip'

type Props = {
  tripId: string
  name: string
  destination: string
  description: string
  startsOn: string
  endsOn: string
  timeZone: string
  currencyCode: string
  currencyLocked: boolean
}

export const EditTripForm = ({
  tripId,
  name,
  destination,
  description,
  startsOn,
  endsOn,
  timeZone,
  currencyCode,
  currencyLocked,
}: Props): React.JSX.Element => {
  const t = useTranslations('trips')
  return (
    <ActionForm
      action={updateTrip}
      schema={updateTripSchema}
      defaultValues={{
        tripId,
        name,
        destination,
        description,
        startsOn,
        endsOn,
        timeZone,
        currencyCode: currencyCode as (typeof currencyCodes)[number],
      }}
      resetOnSuccess={false}
      submitLabel={t('trip.actions.save')}
      className="grid gap-4 md:grid-cols-2"
    >
      <Input name="name" label={t('trip.labels.name')} required maxLength={120} />
      <Input name="destination" label={t('trip.labels.destination')} required maxLength={160} />
      <Input name="startsOn" label={t('trip.labels.startsOn')} type="date" required />
      <Input name="endsOn" label={t('trip.labels.endsOn')} type="date" required />
      <ZoneField name="timeZone" label={t('trip.labels.timeZone')} />
      <SelectField
        name="currencyCode"
        label={t('trip.labels.currency')}
        options={currencyCodes.map((code) => ({ value: code, label: code }))}
        disabled={currencyLocked}
      />
      <Textarea
        name="description"
        label={t('trip.labels.description')}
        containerClassName="md:col-span-2"
        maxLength={1000}
        rows={3}
      />
    </ActionForm>
  )
}
