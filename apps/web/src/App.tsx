import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Onboarding } from '@/pages/Onboarding'
import { Dashboard } from '@/pages/Dashboard'
import { Tasks } from '@/pages/Tasks'
import { Calendar } from '@/pages/Calendar'
import { AIStudyHelper } from '@/pages/AIStudyHelper'
import { Grades } from '@/pages/Grades'
import { ECs } from '@/pages/ECs'
import { Store } from '@/pages/Store'
import { TimeTracker } from '@/pages/TimeTracker'
import { Settings } from '@/pages/Settings'
import { IbWork } from '@/pages/IbWork'
import { useAppStore } from '@/store/useAppStore'

function AppShell() {
  const { checkStreak, userProfile, pronoteEvents, setPronoteEvents, setLastPronoteSync, lastPronoteSync } = useAppStore()

  // Auto-actions on mount: streak + Pronote sync
  useEffect(() => {
    checkStreak()

    const url = userProfile?.pronoteCalendarUrl
    if (!url) return
    const lastSync = lastPronoteSync ? new Date(lastPronoteSync).getTime() : 0
    const stale = Date.now() - lastSync > 60 * 60 * 1000 // re-sync if >1h old
    if (stale || pronoteEvents.length === 0) {
      fetch('/api/pronote/ical', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.events) {
            setPronoteEvents(data.events)
            setLastPronoteSync(new Date().toISOString())
          }
        })
        .catch(() => {})
    }
  }, [])

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/ai" element={<AIStudyHelper />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/ib-work" element={<IbWork />} />
        <Route path="/ecs" element={<ECs />} />
        <Route path="/store" element={<Store />} />
        <Route path="/time" element={<TimeTracker />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AppLayout>
  )
}

export default function App() {
  const onboardingDone = useAppStore((s) => s.onboardingDone)

  if (!onboardingDone) {
    return <Onboarding />
  }

  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
