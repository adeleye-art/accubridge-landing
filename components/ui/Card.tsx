import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean
}

export function Card({ className, children, noPadding, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-xl border border-surface-dark shadow-sm',
        !noPadding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-base font-semibold text-text-primary tracking-tight', className)} {...props}>
      {children}
    </h3>
  )
}
