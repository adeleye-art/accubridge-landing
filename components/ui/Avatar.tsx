import { cn, generateAvatarColor, getInitials } from '@/lib/utils'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const bg = generateAvatarColor(name)
  const initials = getInitials(name)

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-semibold text-white select-none flex-shrink-0',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: bg }}
      title={name}
    >
      {initials}
    </div>
  )
}
