import type { ComponentProps } from 'react'

import { cn } from '@/utils/cn'

type Props = ComponentProps<'div'>

function Skeleton({ className, ...props }: Props) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-muted animate-pulse rounded-xl', className)}
      {...props}
    />
  )
}

export { Skeleton }
