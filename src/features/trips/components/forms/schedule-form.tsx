'use client'

import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'
import { SelectField } from '@/components/ui/select-field'
import { ActionForm } from './action-form'
import { ZoneField } from './zone-field'
import { addSchedule } from '@/features/trips/actions/schedule'
import { scheduleSchema } from '@/features/trips/schemas/schedule'

type Props = {
  tripId: string
  timeZone: string
  startsOn: string
  endsOn: string
}
export const ScheduleForm = ({ tripId, timeZone, startsOn, endsOn }: Props): React.JSX.Element => {
  const t = useTranslations('trips')
  return (
    <ActionForm
      action={addSchedule}
      schema={scheduleSchema}
      defaultValues={{
        tripId,
        title: '',
        note: '',
        location: '',
        tripDay: startsOn,
        startLocal: '',
        endLocal: '',
        startTimeZone: timeZone,
        endTimeZone: timeZone,
        startFold: '',
        endFold: '',
      }}
      submitLabel={t('schedule.actions.add')}
      className="grid gap-4 md:grid-cols-2"
    >
      <Input name="title" label={t('schedule.labels.title')} required maxLength={200} />
      <Input name="location" label={t('schedule.labels.location')} maxLength={200} />
      <Input
        name="tripDay"
        label={t('schedule.labels.tripDay')}
        type="date"
        min={startsOn}
        max={endsOn}
        required
      />
      <Input
        name="startLocal"
        label={t('schedule.labels.startLocal')}
        type="datetime-local"
        required
      />
      <ZoneField name="startTimeZone" label={t('schedule.labels.startTimeZone')} />
      <Input name="endLocal" label={t('schedule.labels.endLocal')} type="datetime-local" />
      <ZoneField name="endTimeZone" label={t('schedule.labels.endTimeZone')} />
      <SelectField
        name="startFold"
        label={t('schedule.labels.repeatedStartTime')}
        placeholder="—"
        options={[
          { value: 'earlier', label: t('common.labels.time.firstOccurrence') },
          { value: 'later', label: t('common.labels.time.secondOccurrence') },
        ]}
      />
      <SelectField
        name="endFold"
        label={t('schedule.labels.repeatedEndTime')}
        placeholder="—"
        options={[
          { value: 'earlier', label: t('common.labels.time.firstOccurrence') },
          { value: 'later', label: t('common.labels.time.secondOccurrence') },
        ]}
      />
      <Input
        name="note"
        label={t('schedule.labels.note')}
        containerClassName="md:col-span-2"
        maxLength={2000}
      />
    </ActionForm>
  )
}
