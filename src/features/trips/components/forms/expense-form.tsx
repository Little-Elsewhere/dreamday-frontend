'use client'

import { useTranslations } from 'next-intl'

import { CheckboxGroup } from '@/components/ui/checkbox-group'
import { Input } from '@/components/ui/input'
import { SelectField } from '@/components/ui/select-field'
import { minorUnitStep } from '@/features/trips/utils/money'
import { ActionForm } from './action-form'
import { addExpense } from '@/features/trips/actions/fund'
import { expenseSchema } from '@/features/trips/schemas/fund'

type Props = {
  tripId: string
  currencyCode: string
  exponent: number
  members: { id: string; label: string }[]
}
export const ExpenseForm = ({
  tripId,
  currencyCode,
  exponent,
  members,
}: Props): React.JSX.Element => {
  const t = useTranslations('trips')
  return (
    <ActionForm
      action={addExpense}
      schema={expenseSchema}
      defaultValues={{
        tripId,
        title: '',
        amount: '',
        paidByMembershipId: members[0]?.id ?? '',
        splitMembershipIds: members.map((member) => member.id),
      }}
      submitLabel={t('fund.actions.expenses.add')}
    >
      <Input name="title" label={t('fund.labels.expenses.title')} required maxLength={200} />
      <Input
        name="amount"
        label={`${t('fund.labels.expenses.amount')} (${currencyCode})`}
        type="number"
        min={minorUnitStep(exponent)}
        step={minorUnitStep(exponent)}
        required
      />
      <SelectField
        name="paidByMembershipId"
        label={t('fund.labels.expenses.paidBy')}
        options={members.map((member) => ({ value: member.id, label: member.label }))}
      />
      <CheckboxGroup
        name="splitMembershipIds"
        label={t('fund.labels.expenses.splitWith')}
        options={members.map((member) => ({ value: member.id, label: member.label }))}
      />
    </ActionForm>
  )
}
