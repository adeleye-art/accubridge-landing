'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: number
}

export function StarRating({ value, onChange, readonly = false, size = 24 }: StarRatingProps) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || value)
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            className="transition-transform hover:scale-110 disabled:cursor-default"
          >
            <Star
              size={size}
              className="transition-colors"
              fill={filled ? '#B8962E' : 'none'}
              stroke={filled ? '#B8962E' : '#E4E0D5'}
            />
          </button>
        )
      })}
    </div>
  )
}
