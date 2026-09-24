import * as React from 'react'
import { Input as InputPrimitive } from '@base-ui/react/input'

import { cn } from '@/utils/cn'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'rounded-auth border-line-strong bg-field text-ink placeholder:text-placeholder hover:border-primary focus-visible:border-primary focus-visible:ring-primary/10 aria-invalid:border-error aria-invalid:ring-error/20 block min-h-12 w-full min-w-0 border px-3 py-3 font-[inherit] text-base transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:bg-white focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
