import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, X } from 'lucide-react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassPill } from '@/components/glass/GlassPill'
import { useAppStore } from '@/store/useAppStore'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// Parse "YYYY-MM-DD" without timezone shift
function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function fmtTime(isoStr: string | null): string {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function Calendar() {
  const [nav, setNav] = useState(new Date())
  const [selected, setSelected] = useState<number | null>(null)
  const [syncing, setSyncing] = useState(false)
  const { tasks, pronoteEvents, ibWorks, studyRoutine, userProfile, setPronoteEvents, setLastPronoteSync, lastPronoteSync } = useAppStore()

  const year = nav.getFullYear()
  const month = nav.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  // Auto-sync Pronote on mount if URL is set and last sync was >30 min ago
  useEffect(() => {
    const url = userProfile?.pronoteCalendarUrl
    if (!url) return
    const lastSync = lastPronoteSync ? new Date(lastPronoteSync).getTime() : 0
    const stale = Date.now() - lastSync > 30 * 60 * 1000
    if (stale || pronoteEvents.length === 0) {
      syncPronote(url)
    }
  }, [])

  const syncPronote = async (url?: string) => {
    const target = url ?? userProfile?.pronoteCalendarUrl
    if (!target) return
    setSyncing(true)
    try {
      const res = await fetch('/api/pronote/ical', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      })
      const data = await res.json()
      if (res.ok) {
        setPronoteEvents(data.events)
        setLastPronoteSync(new Date().toISOString())
      }
    } catch {}
    setSyncing(false)
  }

  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => (i < firstDay ? null : i - firstDay + 1))

  const tasksForDay = (day: number) =>
    tasks.filter((t) => {
      if (!t.due_date) return false
      const d = parseLocalDate(t.due_date)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })

  const pronoteForDay = (day: number) =>
    pronoteEvents.filter((e) => {
      if (!e.start) return false
      const d = new Date(e.start)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })

  const ibWorkForDay = (day: number) =>
    ibWorks.filter((w) => {
      if (!w.dueDate) return false
      const d = parseLocalDate(w.dueDate)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })

  const routineForDay = (day: number) => {
    const dow = new Date(year, month, day).getDay()
    return studyRoutine.filter((b) => b.dayOfWeek === dow).sort((a, b) => a.startHour - b.startHour)
  }

  // Selected day data
  const selTasks = selected ? tasksForDay(selected) : []
  const selClasses = selected ? pronoteForDay(selected) : []
  const selIBWork = selected ? ibWorkForDay(selected) : []
  const selRoutine = selected ? routineForDay(selected) : []
  const hasSelection = selected !== null

  // Upcoming lists (next 2 weeks)
  const soon = new Date(today); soon.setDate(today.getDate() + 14)
  const upcomingTasks = tasks
    .filter((t) => t.due_date && !['Done'].includes(t.status) && parseLocalDate(t.due_date) >= today && parseLocalDate(t.due_date) <= soon)
    .sort((a, b) => parseLocalDate(a.due_date).getTime() - parseLocalDate(b.due_date).getTime())
    .slice(0, 6)
  const upcomingClasses = pronoteEvents
    .filter((e) => e.start && new Date(e.start) >= today)
    .sort((a, b) => new Date(a.start!).getTime() - new Date(b.start!).getTime())
    .slice(0, 6)

  return (
    <div className="page-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-sub">
            Tasks, IB deadlines{userProfile?.pronoteCalendarUrl ? ' & Pronote timetable' : ''}
            {lastPronoteSync && <span style={{ color: 'var(--border-strong)' }}> · synced {new Date(lastPronoteSync).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {userProfile?.pronoteCalendarUrl && (
            <button onClick={() => syncPronote()} disabled={syncing}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', cursor: syncing ? 'default' : 'pointer', fontSize: 13, fontFamily: 'inherit', color: 'var(--text-muted)' }}>
              <RefreshCw size={13} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
              {syncing ? 'Syncing…' : 'Sync'}
            </button>
          )}
          <button onClick={() => setNav(new Date(year, month - 1))} className="btn btn-ghost" style={{ padding: '8px 10px' }}><ChevronLeft size={16} /></button>
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', minWidth: 140, textAlign: 'center' }}>{MONTHS[month]} {year}</span>
          <button onClick={() => setNav(new Date(year, month + 1))} className="btn btn-ghost" style={{ padding: '8px 10px' }}><ChevronRight size={16} /></button>
          <button onClick={() => { setNav(new Date()); setSelected(today.getDate()) }} className="btn btn-ghost" style={{ fontSize: 13 }}>Today</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: hasSelection ? '1fr 280px' : '1fr', gap: 16, alignItems: 'start' }}>
        {/* Main calendar grid */}
        <GlassCard style={{ padding: 16, overflow: 'hidden' }} noHover>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
            {DAYS.map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '6px 0' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={`e${i}`} />
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              const isSelected = day === selected
              const dayTasks = tasksForDay(day)
              const dayClasses = pronoteForDay(day)
              const dayIBWork = ibWorkForDay(day)
              const dayRoutine = routineForDay(day)
              const total = dayTasks.length + dayClasses.length + dayIBWork.length + dayRoutine.length

              return (
                <div key={day} onClick={() => setSelected(day === selected ? null : day)}
                  style={{
                    minHeight: 80, padding: 6, borderRadius: 10, cursor: 'pointer',
                    border: isSelected ? '1.5px solid var(--accent-warm)' : isToday ? '1px solid rgba(184,131,46,0.4)' : '1px solid transparent',
                    background: isSelected ? 'var(--accent-warm-bg)' : 'transparent',
                    transition: 'background 120ms ease, border 120ms ease',
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-surface-hover)' }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 22, height: 22, borderRadius: '50%', marginBottom: 3,
                    background: isToday ? 'var(--accent-warm)' : 'transparent',
                    color: isToday ? 'white' : isSelected ? 'var(--accent-warm)' : 'var(--text-muted)',
                  }}>
                    {day}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayClasses.slice(0, 1).map((e) => (
                      <div key={e.id} style={{ fontSize: 9, padding: '2px 4px', borderRadius: 3, background: 'var(--accent-warm-bg)', borderLeft: '2px solid var(--accent-warm)', color: 'var(--accent-warm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {e.title}
                      </div>
                    ))}
                    {dayIBWork.slice(0, 1).map((w) => (
                      <div key={w.id} style={{ fontSize: 9, padding: '2px 4px', borderRadius: 3, background: 'rgba(106,170,100,0.15)', borderLeft: '2px solid #6aaa64', color: '#6aaa64', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {w.type}: {w.subject.replace(/ (HL|SL)$/, '')}
                      </div>
                    ))}
                    {dayRoutine.slice(0, 1).map((b) => (
                      <div key={b.id} style={{ fontSize: 9, padding: '2px 4px', borderRadius: 3, borderLeft: `2px solid ${b.color}`, color: b.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: b.color + '18' }}>
                        {b.subject.replace(/ (HL|SL)$/, '')}
                      </div>
                    ))}
                    {dayTasks.slice(0, Math.max(0, 2 - dayClasses.length - dayIBWork.length - dayRoutine.length)).map((t) => (
                      <div key={t.id} style={{ fontSize: 9, padding: '2px 4px', borderRadius: 3, background: 'var(--bg-overlay)', borderLeft: '2px solid var(--border-strong)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.title}
                      </div>
                    ))}
                    {total > 2 && <p style={{ fontSize: 9, color: 'var(--text-muted)', paddingLeft: 2 }}>+{total - 2}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>

        {/* Day detail panel */}
        {hasSelection && selected !== null && (
          <GlassCard style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }} noHover>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{selected}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{MONTHS[month]} {year}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                <X size={16} />
              </button>
            </div>

            {selClasses.length === 0 && selTasks.length === 0 && selIBWork.length === 0 && selRoutine.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>Nothing scheduled</p>
            )}

            {selRoutine.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Study sessions</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selRoutine.map((b) => {
                    const endHour = b.startHour + Math.floor(b.durationMinutes / 60)
                    const endMin = b.durationMinutes % 60
                    const fmt = (h: number, m: number) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
                    return (
                      <div key={b.id} style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${b.color}40`, background: b.color + '18', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 3, height: 28, borderRadius: 999, background: b.color, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.subject}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{b.activity}</p>
                        </div>
                        <p style={{ fontSize: 11, color: b.color, fontWeight: 500, flexShrink: 0 }}>{fmt(b.startHour, 0)}–{fmt(endHour, endMin)}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {selClasses.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Classes</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selClasses.map((e) => (
                    <div key={e.id} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(184,131,46,0.25)', background: 'var(--accent-warm-bg)' }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{e.title}</p>
                      <p style={{ fontSize: 11, color: 'var(--accent-warm)', marginTop: 2 }}>
                        {fmtTime(e.start)}{e.end ? ` – ${fmtTime(e.end)}` : ''}
                        {e.location ? ` · ${e.location}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selIBWork.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>IB Deadlines</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selIBWork.map((w) => (
                    <div key={w.id} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(106,170,100,0.25)', background: 'rgba(106,170,100,0.08)' }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{w.type} · {w.subject.replace(/ (HL|SL)$/, '')}</p>
                      <p style={{ fontSize: 11, color: '#6aaa64', marginTop: 2 }}>{w.title || 'Due today'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selTasks.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Tasks due</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selTasks.map((t) => (
                    <div key={t.id} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{t.subject}</p>
                      </div>
                      <GlassPill>{t.priority}</GlassPill>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        )}
      </div>

      {/* Bottom panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <GlassCard style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }} noHover>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Upcoming deadlines</h3>
          {upcomingTasks.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No upcoming deadlines 🎉</p>
          ) : upcomingTasks.map((t) => {
            const d = parseLocalDate(t.due_date)
            return (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'center', flexShrink: 0, width: 34 }}>
                  <div style={{ fontWeight: 700, color: 'var(--accent-warm)', fontSize: 17 }}>{d.getDate()}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{MONTHS[d.getMonth()].slice(0, 3)}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{t.subject}</p>
                </div>
                <GlassPill>{t.priority}</GlassPill>
              </div>
            )
          })}
        </GlassCard>

        <GlassCard style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }} noHover>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Upcoming classes</h3>
          {upcomingClasses.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
              {userProfile?.pronoteCalendarUrl ? 'Syncing timetable…' : 'Connect Pronote in Settings to see classes'}
            </p>
          ) : upcomingClasses.map((e) => {
            const start = e.start ? new Date(e.start) : null
            return (
              <div key={e.id} style={{ display: 'flex', gap: 12, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                {start && (
                  <div style={{ textAlign: 'center', flexShrink: 0, width: 34 }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent-warm)', fontSize: 17 }}>{start.getDate()}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{MONTHS[start.getMonth()].slice(0, 3)}</div>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                    {start ? fmtTime(e.start) : ''}
                    {e.location ? ` · ${e.location}` : ''}
                  </p>
                </div>
              </div>
            )
          })}
        </GlassCard>
      </div>
    </div>
  )
}
