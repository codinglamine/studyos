import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatXP(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
  return xp.toString()
}

export function getLevelFromXP(xp: number): { level: number; current: number; next: number; progress: number } {
  if (xp < 500) return { level: 1, current: xp, next: 500, progress: xp / 500 }
  const level = Math.floor((xp - 500) / 1000) + 2
  const levelStart = 500 + (level - 2) * 1000
  const levelEnd = levelStart + 1000
  return {
    level,
    current: xp - levelStart,
    next: 1000,
    progress: (xp - levelStart) / 1000,
  }
}

export function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    'Math': '#7C3AED',
    'Physics': '#2563EB',
    'Chemistry': '#059669',
    'Biology': '#16A34A',
    'English': '#DC2626',
    'History': '#D97706',
    'Economics': '#0891B2',
    'French': '#DB2777',
    'Spanish': '#EA580C',
    'Geography': '#65A30D',
    'CS': '#7C3AED',
    'TOK': '#9333EA',
    'CAS': '#06B6D4',
    'EE': '#F59E0B',
  }
  return colors[subject] ?? '#6B7280'
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatRelativeDate(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const days = Math.round(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  if (days > 0) return `In ${days} days`
  return `${Math.abs(days)} days ago`
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    Low: '#10B981',
    Medium: '#F59E0B',
    High: '#EF4444',
    Urgent: '#DC2626',
  }
  return map[priority] ?? '#6B7280'
}
