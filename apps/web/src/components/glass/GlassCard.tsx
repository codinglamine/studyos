import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'modal' | 'pill'
  noHover?: boolean
  glow?: boolean
  className?: string
  children?: React.ReactNode
}

// Plain div — no Framer Motion overhead on every card
const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ variant = 'default', noHover, glow, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'card',
          !noHover && 'card-hover',
          variant === 'modal' && 'glass-card--modal',
          variant === 'pill' && 'glass-card--pill',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'
export { GlassCard }
