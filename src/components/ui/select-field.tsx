'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import type { FieldPath, FieldValues } from 'react-hook-form'
import { Controller, useFormContext } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utils/cn'

interface SelectFieldOption {
  value: string
  label: string
}

interface SelectFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>
  label: React.ReactNode
  options: SelectFieldOption[]
  placeholder?: string
  description?: React.ReactNode
  containerClassName?: string
  labelClassName?: string
  required?: boolean
  disabled?: boolean
}

const SelectField = <TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  options,
  placeholder,
  description,
  containerClassName,
  labelClassName,
  required,
  disabled,
}: SelectFieldProps<TFieldValues>): React.ReactElement => {
  const id = React.useId()
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`
  const { control } = useFormContext<TFieldValues>()
  const t = useTranslations()
  const items = placeholder ? [{ value: null, label: placeholder }, ...options] : options

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = typeof field.value === 'string' && field.value ? field.value : null

        return (
          <div className={cn('grid min-w-0 gap-2', containerClassName)}>
            <Label className={labelClassName} htmlFor={id}>
              {label}
            </Label>
            <Select
              items={items}
              name={field.name}
              value={value}
              onValueChange={(nextValue) => field.onChange(nextValue ?? '')}
              required={required}
              disabled={disabled}
            >
              <SelectTrigger
                id={id}
                ref={field.ref}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  [description ? descriptionId : null, fieldState.error ? errorId : null]
                    .filter(Boolean)
                    .join(' ') || undefined
                }
                className="rounded-auth border-line-strong bg-field text-ink focus-visible:border-primary focus-visible:ring-primary/10 aria-invalid:border-error aria-invalid:ring-error/20 h-auto min-h-12 w-full border px-3 py-3 text-base focus-visible:bg-white focus-visible:ring-3 aria-invalid:ring-3"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {items.map((item) => (
                    <SelectItem key={item.value ?? 'placeholder'} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {description && (
              <p id={descriptionId} className="text-muted-foreground text-sm">
                {description}
              </p>
            )}
            {fieldState.error?.message && (
              <p id={errorId} role="alert" className="text-error-text text-sm">
                {t(fieldState.error.message)}
              </p>
            )}
          </div>
        )
      }}
    />
  )
}

export { SelectField }
