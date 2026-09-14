import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Plus, Clock, BookOpen, Target, Calendar, Sparkles, RefreshCw } from 'lucide-react'
import { GlassCard } from '@/components/glass/GlassCard'
import { useAppStore } from '@/store/useAppStore'
import { getLevelFromXP, formatRelativeDate } from '@/lib/utils'
import { MOODS } from '@/lib/constants'
import { AddTaskModal } from '@/features/tasks/AddTaskModal'
import { PomodoroWidget } from '@/features/pomodoro/PomodoroWidget'

function GreetingHero() {
  const { xp, tasks, userProfile, pronoteEvents } = useAppStore()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const name = userProfile?.name ?? 'Student'
  const pending = tasks.filter((t) => t.status !== 'Done').length
  const now = new Date()

  const upcomingClass = pronoteEvents.find((e) => {
    if (!e.start) return false
    const d = new Date(e.start)
    return d >= now
  })

  return (
    <GlassCard className="bento-xl" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '36px 40px' }} noHover>
      <div>
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 style={{ fontSize: 34, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
          {greeting}, {name}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {pending > 0 ? `You have ${pending} task${pending !== 1 ? 's' : ''} to complete.` : 'All tasks done — incredible work! 🎉'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 28 }}>
        {userProfile?.ibYear && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-overlay)' }}>
            <BookOpen size={13} /> {userProfile.ibYear} · {userProfile.session}
          </span>
        )}
        {userProfile?.school && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-overlay)' }}>
            {userProfile.school}
          </span>
        )}
        {upcomingClass && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, border: '1px solid rgba(184,131,46,0.35)', fontSize: 13, color: 'var(--accent-warm)', background: 'var(--accent-warm-bg)' }}>
            <Clock size={13} /> Next: {upcomingClass.title} · {upcomingClass.start ? new Date(upcomingClass.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        )}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-overlay)' }}>
          {xp.toLocaleString()} XP
        </span>
      </div>
    </GlassCard>
  )
}

function XPRingCard() {
  const xp = useAppStore((s) => s.xp)
  const { level, current, next, progress } = getLevelFromXP(xp)
  const r = 52; const circ = 2 * Math.PI * r

  return (
    <GlassCard className="bento-sm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 28 }} noHover>
      <svg width="124" height="124" viewBox="0 0 124 124">
        <circle cx="62" cy="62" r={r} fill="none" stroke="var(--border)" strokeWidth="7" />
        <circle cx="62" cy="62" r={r} fill="none"
          stroke="var(--accent-warm)" strokeWidth="7"
          strokeDasharray={`${progress * circ} ${circ}`}
          strokeLinecap="round" transform="rotate(-90 62 62)"
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
        <text x="62" y="56" textAnchor="middle" fontSize="30" fontWeight="700" fill="var(--text-primary)" fontFamily="Inter">{level}</text>
        <text x="62" y="74" textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontFamily="Inter" letterSpacing="2">LEVEL</text>
      </svg>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>{current.toLocaleString()} / {next.toLocaleString()} XP</p>
    </GlassCard>
  )
}

function StreakCard() {
  const streak = useAppStore((s) => s.streak)
  return (
    <GlassCard className="bento-sm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 28 }} noHover>
      <span className={streak > 7 ? 'streak-flame' : ''} style={{ fontSize: 44 }}>🔥</span>
      <p style={{ fontSize: 52, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{streak}</p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>day streak</p>
    </GlassCard>
  )
}

function TodayFocusCard() {
  const tasks = useAppStore((s) => s.tasks)
  const top = tasks
    .filter((t) => t.status !== 'Done')
    .sort((a, b) => ({ Urgent: 0, High: 1, Medium: 2, Low: 3 }[a.priority] ?? 3) - ({ Urgent: 0, High: 1, Medium: 2, Low: 3 }[b.priority] ?? 3))
    .slice(0, 5)

  return (
    <GlassCard className="bento-md" style={{ display: 'flex', flexDirection: 'column', padding: 28, gap: 18 }} noHover>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Today's Focus</h3>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--border)' }}>{top.length} tasks</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {top.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 32 }}>All clear! 🎉</p>
        ) : top.map((t, i) => (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '13px 0',
            borderBottom: i < top.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-warm)', flexShrink: 0 }} />
            <p style={{ fontSize: 14, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{formatRelativeDate(t.due_date)}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

function GradeTrendCard() {
  const grades = useAppStore((s) => s.grades)
  const recent = grades.slice(-5)

  return (
    <GlassCard className="bento-md" style={{ display: 'flex', flexDirection: 'column', padding: 28, gap: 18 }} noHover>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Grade Trend</h3>
        {recent.length > 1 && (
          (recent[recent.length - 1].score / recent[recent.length - 1].max_score) >= (recent[recent.length - 2].score / recent[recent.length - 2].max_score)
            ? <TrendingUp size={17} color="#6aaa64" />
            : <TrendingDown size={17} color="#c84b4b" />
        )}
      </div>
      {recent.length === 0 ? (
        <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 24 }}>No grades yet — add some!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
          {recent.map((g) => {
            const pct = Math.round((g.score / g.max_score) * 100)
            return (
              <div key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>{g.assessment_name}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0 }}>{pct}%</span>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
              </div>
            )
          })}
        </div>
      )}
    </GlassCard>
  )
}

function UpcomingClassesCard() {
  const { pronoteEvents, userProfile, setPronoteEvents } = useAppStore()
  const [syncing, setSyncing] = useState(false)
  const now = new Date()
  const upcoming = pronoteEvents.filter((e) => e.start && new Date(e.start) >= now).slice(0, 5)

  const sync = async () => {
    const url = userProfile?.pronoteCalendarUrl
    if (!url) return
    setSyncing(true)
    try {
      const res = await fetch('/api/pronote/ical', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })
      const data = await res.json()
      if (res.ok) setPronoteEvents(data.events)
    } catch {}
    setSyncing(false)
  }

  useEffect(() => {
    if (userProfile?.pronoteCalendarUrl && pronoteEvents.length === 0) sync()
  }, [])

  if (!userProfile?.pronoteCalendarUrl) {
    return (
      <GlassCard className="bento-md" style={{ display: 'flex', flexDirection: 'column', padding: 28, gap: 16, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }} noHover>
        <Calendar size={32} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Connect Pronote</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Paste your Pronote iCal link in Settings to see your timetable here.</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="bento-md" style={{ display: 'flex', flexDirection: 'column', padding: 28, gap: 16 }} noHover>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Upcoming Classes</h3>
        <button onClick={sync} disabled={syncing} style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          {syncing ? 'Syncing…' : '↻ Sync'}
        </button>
      </div>
      {upcoming.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 16 }}>{syncing ? 'Loading…' : 'No upcoming events'}</p>
      ) : upcoming.map((e) => {
        const start = e.start ? new Date(e.start) : null
        return (
          <div key={e.id} style={{ display: 'flex', gap: 14, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            {start && (
              <div style={{ width: 40, flexShrink: 0, textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-warm)', lineHeight: 1 }}>{start.getDate()}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{start.toLocaleString('en-US', { month: 'short' })}</p>
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {start ? start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                {e.location ? ` · ${e.location}` : ''}
              </p>
            </div>
          </div>
        )
      })}
    </GlassCard>
  )
}

function TodayScheduleCard() {
  const studyRoutine = useAppStore((s) => s.studyRoutine)
  const todayDow = new Date().getDay()
  const todayBlocks = studyRoutine
    .filter((b) => b.dayOfWeek === todayDow)
    .sort((a, b) => a.startHour - b.startHour)

  if (studyRoutine.length === 0) return null

  return (
    <GlassCard className="bento-md" style={{ display: 'flex', flexDirection: 'column', padding: 28, gap: 16 }} noHover>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Today's Schedule</h3>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--border)' }}>
          {todayBlocks.length} session{todayBlocks.length !== 1 ? 's' : ''}
        </span>
      </div>
      {todayBlocks.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No study sessions today — enjoy the break!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {todayBlocks.map((b) => {
            const endHour = b.startHour + Math.floor(b.durationMinutes / 60)
            const endMin = b.durationMinutes % 60
            const fmt = (h: number, m: number) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
            const now = new Date()
            const isNow = now.getHours() >= b.startHour && now.getHours() < endHour
            return (
              <div key={b.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10,
                border: `1px solid ${isNow ? b.color + '60' : 'var(--border)'}`,
                background: isNow ? b.color + '18' : 'transparent',
              }}>
                <div style={{ width: 3, height: 36, borderRadius: 999, background: b.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.subject}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{b.activity}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: isNow ? b.color : 'var(--text-muted)' }}>
                    {fmt(b.startHour, 0)} – {fmt(endHour, endMin)}
                  </p>
                  {isNow && <p style={{ fontSize: 10, color: b.color, marginTop: 1, fontWeight: 600 }}>NOW</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </GlassCard>
  )
}

function StudyPlanCard() {
  const { userProfile, addTask, setStudyRoutine } = useAppStore()
  const customPlan = userProfile?.customPlan
  const [regenerating, setRegenerating] = useState(false)
  const [done, setDone] = useState(false)

  const regenerate = async () => {
    if (!userProfile) return
    setRegenerating(true)
    try {
      const res = await fetch('/api/ai/plan-structured', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: userProfile, today: new Date().toISOString().slice(0, 10) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const tasks: Record<string, unknown>[] = Array.isArray(data.tasks) ? data.tasks : []
      const routine: Record<string, unknown>[] = Array.isArray(data.weeklyRoutine) ? data.weeklyRoutine : []

      for (const t of tasks) {
        try {
          addTask({
            title: String(t.title || ''), subject: String(t.subject || userProfile.subjects[0] || ''),
            type: (t.type as 'Homework' | 'Test' | 'Project' | 'IB' | 'EC' | 'Personal') || 'Homework',
            due_date: String(t.due_date || new Date().toISOString().slice(0, 10)),
            priority: (t.priority as 'Low' | 'Medium' | 'High' | 'Urgent') || 'Medium',
            status: 'Todo', estimated_minutes: Number(t.estimated_minutes) || 60,
            actual_minutes: 0, notes: String(t.notes || ''), repeat: 'none',
          })
        } catch {}
      }

      setStudyRoutine(routine.map((b) => ({
        id: crypto.randomUUID(), dayOfWeek: Number(b.dayOfWeek) || 1,
        startHour: Number(b.startHour) || 16, durationMinutes: Number(b.durationMinutes) || 60,
        subject: String(b.subject || ''), activity: String(b.activity || 'Study session'),
        color: String(b.color || '#8B9FC0'),
      })))
      setDone(true)
      setTimeout(() => setDone(false), 3000)
    } catch {}
    setRegenerating(false)
  }

  if (!customPlan) return null

  return (
    <GlassCard className="bento-md" style={{ display: 'flex', flexDirection: 'column', padding: 28, gap: 14 }} noHover>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Target size={16} style={{ color: 'var(--accent-warm)' }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>AI Study Plan</h3>
        </div>
        <button onClick={regenerate} disabled={regenerating}
          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: done ? '#6aaa64' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          {done ? '✓ Updated' : <><RefreshCw size={11} style={{ animation: regenerating ? 'spin 1s linear infinite' : 'none' }} /> {regenerating ? 'Regenerating…' : 'Regenerate'}</>}
        </button>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {customPlan.slice(0, 280)}{customPlan.length > 280 ? '…' : ''}
      </p>
    </GlassCard>
  )
}

function MoodCheckIn() {
  const [selected, setSelected] = useState<number | null>(null)
  const addTimeEntry = useAppStore((s) => s.addTimeEntry)

  return (
    <GlassCard className="bento-sm" style={{ display: 'flex', flexDirection: 'column', padding: 28, gap: 18 }} noHover>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>How are you?</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1, alignItems: 'center' }}>
        {MOODS.map((m) => (
          <button
            key={m.value}
            onClick={() => {
              setSelected(m.value)
              addTimeEntry({ activity: 'Mood check-in', category: 'focused-work', duration_minutes: 0, mood_tag: 'Neutral', started_at: new Date().toISOString() })
            }}
            title={m.label}
            style={{
              fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              opacity: selected === m.value ? 1 : selected === null ? 0.55 : 0.25,
              transform: selected === m.value ? 'scale(1.35)' : 'scale(1)',
              transition: 'opacity 140ms ease, transform 140ms ease',
            }}
          >
            {m.emoji}
          </button>
        ))}
      </div>
      {selected !== null && <p style={{ fontSize: 12, color: 'var(--accent-warm)', textAlign: 'center', fontWeight: 500 }}>Logged ✓</p>}
    </GlassCard>
  )
}

export function Dashboard() {
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const customPlan = useAppStore((s) => s.userProfile?.customPlan)

  return (
    <div>
      <div className="bento-grid">
        <div className="bento-xl"><GreetingHero /></div>
        <div className="bento-sm"><XPRingCard /></div>
        <div className="bento-sm"><StreakCard /></div>
        <div className="bento-md"><TodayFocusCard /></div>
        <div className="bento-md"><UpcomingClassesCard /></div>
        <div className="bento-md"><TodayScheduleCard /></div>
        {customPlan && <div className="bento-md"><StudyPlanCard /></div>}
        <div className="bento-md"><GradeTrendCard /></div>
        <div className="bento-sm"><PomodoroWidget /></div>
        <div className="bento-sm"><MoodCheckIn /></div>
      </div>

      <button
        onClick={() => setAddTaskOpen(true)}
        className="fab-pulse"
        style={{
          position: 'fixed', bottom: 84, right: 28, zIndex: 50,
          width: 50, height: 50, borderRadius: '50%',
          background: 'var(--accent)', color: 'var(--bg-surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
        }}
        title="Add task"
      >
        <Plus size={22} />
      </button>

      <AddTaskModal open={addTaskOpen} onClose={() => setAddTaskOpen(false)} />
    </div>
  )
}
