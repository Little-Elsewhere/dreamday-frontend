'use client'

import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'
import { SelectField } from '@/components/ui/select-field'
import { ActionForm } from './action-form'
import { ZoneField } from './zone-field'
import { addTask } from '@/features/trips/actions/checklists'
import { taskSchema } from '@/features/trips/schemas/checklist'

type Props = {
  tripId: string
  checklistId: string
  timeZone: string
  members: { id: string; label: string }[]
}
export const TaskForm = ({ tripId, checklistId, timeZone, members }: Props): React.JSX.Element => {
  const t = useTranslations('trips')
  return (
    <ActionForm
      action={addTask}
      schema={taskSchema}
      defaultValues={{
        tripId,
        checklistId,
        title: '',
        assigneeMembershipId: '',
        dueLocal: '',
        dueTimeZone: timeZone,
        dueFold: '',
      }}
      submitLabel={t('checklists.actions.tasks.add')}
      className="grid gap-3 md:grid-cols-2"
    >
      <Input
        name="title"
        label={t('checklists.labels.tasks.title')}
        containerClassName="md:col-span-2"
        required
        maxLength={250}
      />
      <SelectField
        name="assigneeMembershipId"
        label={t('checklists.labels.tasks.assignee')}
        placeholder={t('checklists.labels.tasks.unassigned')}
        options={members.map((member) => ({ value: member.id, label: member.label }))}
      />
      <Input name="dueLocal" label={t('checklists.labels.tasks.dueLocal')} type="datetime-local" />
      <ZoneField name="dueTimeZone" label={t('checklists.labels.tasks.dueTimeZone')} />
      <SelectField
        name="dueFold"
        label={t('checklists.labels.tasks.repeatedDueTime')}
        placeholder="—"
        options={[
          { value: 'earlier', label: t('common.labels.time.firstOccurrence') },
          { value: 'later', label: t('common.labels.time.secondOccurrence') },
        ]}
      />
    </ActionForm>
  )
}
