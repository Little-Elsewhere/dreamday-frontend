import type { ComponentProps, ReactElement } from 'react'

import { cn } from '@/utils/cn'

interface SkeletonProps extends ComponentProps<'div'> {
  className?: string
}

function Skeleton({ className, ...props }: SkeletonProps): ReactElement {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-muted animate-pulse rounded-xl', className)}
      {...props}
    />
  )
}

export { Skeleton }
