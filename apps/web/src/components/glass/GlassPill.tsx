import { cn } from '@/lib/utils'

interface GlassPillProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  active?: boolean
}

export function GlassPill({ children, className, onClick, active }: GlassPillProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border select-none',
        active
          ? 'bg-[var(--accent)] text-[var(--bg-surface)] border-[var(--accent)]'
          : 'bg-[var(--bg-overlay)] border-[var(--border)] text-[var(--text-secondary)]',
        onClick && 'cursor-pointer spring hover:bg-[var(--bg-surface-hover)]',
        className
      )}
    >
      {children}
    </div>
  )
}
