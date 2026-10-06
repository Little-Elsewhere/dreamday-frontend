'use client'

import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'
import { minorUnitStep } from '@/features/trips/utils/money'
import { ActionForm } from './action-form'
import { setBudget } from '@/features/trips/actions/fund'
import { budgetSchema } from '@/features/trips/schemas/fund'

type Props = {
  tripId: string
  amount: string
  currencyCode: string
  exponent: number
}
export const BudgetForm = ({
  tripId,
  amount,
  currencyCode,
  exponent,
}: Props): React.JSX.Element => {
  const t = useTranslations('trips')
  return (
    <ActionForm
      action={setBudget}
      schema={budgetSchema}
      defaultValues={{ tripId, amount }}
      resetOnSuccess={false}
      submitLabel={t('fund.actions.budget.save')}
    >
      <Input
        name="amount"
        label={`${t('fund.content.budget.title')} (${currencyCode})`}
        type="number"
        min="0"
        step={minorUnitStep(exponent)}
      />
    </ActionForm>
  )
}
