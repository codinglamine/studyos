import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { TopNav } from './TopNav'
import { FloatingChat } from './FloatingChat'
import { XPPopups } from '@/components/glass/XPPopup'
import { useAppStore } from '@/store/useAppStore'

const PAGE_MAP: Record<string, string> = {
  '/': 'dashboard', '/tasks': 'tasks', '/calendar': 'calendar',
  '/ai': 'ai', '/grades': 'grades', '/ecs': 'ecs',
  '/store': 'store', '/time': 'time', '/settings': 'settings',
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { setCurrentPage, theme, checkStreak } = useAppStore()
  const location = useLocation()

  useEffect(() => { setCurrentPage(PAGE_MAP[location.pathname] ?? 'dashboard') }, [location.pathname])
  useEffect(() => { checkStreak() }, [])
  useEffect(() => {
    const resolved = theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : theme
    document.documentElement.setAttribute('data-theme', resolved)
  }, [theme])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <XPPopups />
      <TopNav />
      <main style={{ paddingTop: 56, minHeight: '100vh' }}>
        <div style={{ padding: '32px 36px', maxWidth: 1440, margin: '0 auto' }}>
          {children}
        </div>
      </main>
      <FloatingChat />
    </div>
  )
}
