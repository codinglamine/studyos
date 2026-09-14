import { useState } from 'react'
import { Moon, Sun, Monitor, Plus, X, Link, RotateCcw } from 'lucide-react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassPill } from '@/components/glass/GlassPill'
import { useAppStore } from '@/store/useAppStore'
import { getLevelFromXP } from '@/lib/utils'

const inputSt: React.CSSProperties = { width: '100%', padding: '11px 14px', fontSize: 14, background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }
const labelSt: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }

export function Settings() {
  const { theme, setTheme, subjects, setSubjects, xp, streak, userProfile, updateUserProfile, setPronoteEvents } = useAppStore()
  const [newSubject, setNewSubject] = useState('')
  const { level } = getLevelFromXP(xp)
  const [pronoteLoading, setPronoteLoading] = useState(false)
  const [pronoteStatus, setPronoteStatus] = useState('')

  const name = userProfile?.name ?? 'Student'
  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  const syncPronote = async () => {
    const url = userProfile?.pronoteCalendarUrl
    if (!url) return
    setPronoteLoading(true)
    setPronoteStatus('')
    try {
      const res = await fetch('/api/pronote/ical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (res.ok) {
        setPronoteEvents(data.events)
        setPronoteStatus(`✓ Synced — ${data.count} events loaded`)
      } else {
        setPronoteStatus(`✗ ${data.error}`)
      }
    } catch {
      setPronoteStatus('✗ Could not reach server')
    } finally {
      setPronoteLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1 className="page-title">Settings</h1>

      {/* Profile */}
      <GlassCard style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }} noHover>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Profile</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-surface)', fontWeight: 700, fontSize: 20, flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{name}</p>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              <GlassPill>Level {level}</GlassPill>
              <GlassPill>{xp.toLocaleString()} XP</GlassPill>
              <GlassPill>🔥 {streak} days</GlassPill>
              {userProfile?.ibYear && <GlassPill>{userProfile.ibYear}</GlassPill>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelSt}>Name</label>
              <input defaultValue={name} onChange={(e) => updateUserProfile({ name: e.target.value })} style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Age</label>
              <input defaultValue={userProfile?.age ?? ''} onChange={(e) => updateUserProfile({ age: e.target.value })} placeholder="Age" style={inputSt} />
            </div>
          </div>
          <div>
            <label style={labelSt}>School</label>
            <input defaultValue={userProfile?.school ?? ''} onChange={(e) => updateUserProfile({ school: e.target.value })} placeholder="School name" style={inputSt} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelSt}>IB Year</label>
              <select defaultValue={userProfile?.ibYear ?? 'DP2'} onChange={(e) => updateUserProfile({ ibYear: e.target.value as 'DP1' | 'DP2' })} style={{ ...inputSt, appearance: 'none' }}>
                <option value="DP1">DP1</option>
                <option value="DP2">DP2</option>
              </select>
            </div>
            <div>
              <label style={labelSt}>Exam session</label>
              <select defaultValue={userProfile?.session ?? 'May 2026'} onChange={(e) => updateUserProfile({ session: e.target.value })} style={{ ...inputSt, appearance: 'none' }}>
                {['May 2025', 'November 2025', 'May 2026', 'November 2026'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Pronote */}
      <GlassCard style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }} noHover>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Pronote Calendar</h2>
        <div>
          <label style={labelSt}>iCal URL</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              defaultValue={userProfile?.pronoteCalendarUrl ?? ''}
              onChange={(e) => updateUserProfile({ pronoteCalendarUrl: e.target.value })}
              placeholder="https://0xxxxxxxx.index-education.net/pronote/ical/..."
              style={{ ...inputSt, flex: 1 }}
            />
            <button onClick={syncPronote} disabled={!userProfile?.pronoteCalendarUrl || pronoteLoading}
              style={{ padding: '11px 16px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: 'var(--bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: userProfile?.pronoteCalendarUrl ? 1 : 0.4 }}>
              {pronoteLoading ? <RotateCcw size={14} style={{ animation: 'ring-pulse 1s linear infinite' }} /> : <Link size={14} />}
              {pronoteLoading ? 'Syncing…' : 'Sync'}
            </button>
          </div>
          {pronoteStatus && (
            <p style={{ fontSize: 13, marginTop: 8, color: pronoteStatus.startsWith('✓') ? '#6aaa64' : '#c84b4b' }}>{pronoteStatus}</p>
          )}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Go to Pronote → Planning → Export calendar → copy the iCal link. Your timetable will appear on the Dashboard.
        </p>
      </GlassCard>

      {/* Appearance */}
      <GlassCard style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }} noHover>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Appearance</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          {([
            { value: 'dark', icon: Moon, label: 'Dark' },
            { value: 'light', icon: Sun, label: 'Light' },
            { value: 'system', icon: Monitor, label: 'System' },
          ] as const).map(({ value, icon: Icon, label }) => (
            <button key={value} onClick={() => setTheme(value)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '14px', borderRadius: 14, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                border: theme === value ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: theme === value ? 'var(--accent)' : 'transparent',
                color: theme === value ? 'var(--bg-surface)' : 'var(--text-muted)',
                transition: 'all 120ms ease',
              }}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Subjects */}
      <GlassCard style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }} noHover>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Subjects</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {subjects.map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 999, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
              {s}
              <button onClick={() => setSubjects(subjects.filter((x) => x !== s))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', marginLeft: 2 }}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={newSubject} onChange={(e) => setNewSubject(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && newSubject.trim() && !subjects.includes(newSubject.trim())) { setSubjects([...subjects, newSubject.trim()]); setNewSubject('') } }}
            placeholder="Add subject (press Enter)" style={{ ...inputSt, flex: 1 }} />
          <button
            onClick={() => { if (newSubject.trim() && !subjects.includes(newSubject.trim())) { setSubjects([...subjects, newSubject.trim()]); setNewSubject('') } }}
            className="btn btn-primary">
            <Plus size={14} />
          </button>
        </div>
      </GlassCard>

      {/* Data */}
      <GlassCard style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }} noHover>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Data & Privacy</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>All data is stored locally in your browser. No account required.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => {
            const blob = new Blob([JSON.stringify({ xp: useAppStore.getState().xp, tasks: useAppStore.getState().tasks, grades: useAppStore.getState().grades }, null, 2)], { type: 'application/json' })
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'studyos-export.json'; a.click()
          }} className="btn btn-ghost">Export data</button>
          <button onClick={() => { if (confirm('Reset onboarding and clear profile?')) { useAppStore.setState({ onboardingDone: false, userProfile: null }); localStorage.removeItem('studyos-store'); window.location.reload() } }}
            style={{ padding: '10px 20px', borderRadius: 12, border: '1px solid rgba(200,80,80,0.35)', background: 'transparent', color: '#c84b4b', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
            Reset & re-onboard
          </button>
        </div>
      </GlassCard>
    </div>
  )
}
