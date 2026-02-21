import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface GradientTextProps {
  children: ReactNode
  className?: string
  animated?: boolean
}

export function GradientText({ children, className, animated = true }: GradientTextProps) {
  return (
    <span className={cn(animated ? 'gradient-text' : 'gradient-text-static', className)}>
      {children}
    </span>
  )
}
