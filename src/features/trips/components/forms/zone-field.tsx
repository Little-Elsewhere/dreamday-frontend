'use client'

import { useId } from 'react'

import { Input } from '@/components/ui/input'
import { timeZones } from '@/features/trips/constants/time-zones'

type Props = {
  name: string
  label: string
  description?: string
  required?: boolean
}

export const ZoneField = ({
  name,
  label,
  description,
  required = true,
}: Props): React.JSX.Element => {
  const id = useId()
  return (
    <>
      <Input name={name} label={label} description={description} list={id} required={required} />
      <datalist id={id}>
        {timeZones.map((zone) => (
          <option key={zone} value={zone} />
        ))}
      </datalist>
    </>
  )
}
