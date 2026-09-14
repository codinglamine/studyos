import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassPill } from '@/components/glass/GlassPill'
import { useAppStore } from '@/store/useAppStore'
import type { TimeEntry } from '@/store/useAppStore'

const CATS: Record<string, string> = {
  'focused-work': 'Focused Work', 'study': 'Study', 'leisure': 'Leisure',
  'sleep': 'Sleep', 'meetings': 'Meetings', 'procrastination': 'Procrastination', 'workout': 'Workout',
}
const CAT_COLORS: Record<string, string> = {
  'focused-work': '#C08B3A', 'study': '#8B9FC0', 'leisure': '#8BC0A8', 'sleep': '#A0A0B0',
  'meetings': '#C0A88B', 'procrastination': '#C08B8B', 'workout': '#A88BC0',
}

const inputSt: React.CSSProperties = { width: '100%', padding: '11px 14px', fontSize: 14, background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }
const labelSt: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }

function AddEntryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addTimeEntry } = useAppStore()
  const [form, setForm] = useState({
    activity: '', category: 'study' as TimeEntry['category'], duration_minutes: 30,
    mood_tag: 'Neutral' as TimeEntry['mood_tag'], started_at: new Date().toISOString().slice(0, 16),
  })
  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420, padding: 28, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--glass-card-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 22, boxShadow: 'var(--shadow-lg)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Track Activity</h2>
        <div>
          <label style={labelSt}>Activity</label>
          <input value={form.activity} onChange={(e) => setForm((f) => ({ ...f, activity: e.target.value }))} placeholder="What did you do?" style={inputSt} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelSt}>Category</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as TimeEntry['category'] }))} style={{ ...inputSt, appearance: 'none' }}>
              {Object.entries(CATS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={labelSt}>Minutes</label>
            <input type="number" value={form.duration_minutes} onChange={(e) => setForm((f) => ({ ...f, duration_minutes: parseInt(e.target.value) || 0 }))} style={inputSt} min={1} />
          </div>
        </div>
        <div>
          <label style={labelSt}>Mood</label>
          <select value={form.mood_tag} onChange={(e) => setForm((f) => ({ ...f, mood_tag: e.target.value as TimeEntry['mood_tag'] }))} style={{ ...inputSt, appearance: 'none' }}>
            {['Focused', 'Refreshed', 'Neutral', 'Distracted', 'Tired', 'Stressed'].map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={() => { addTimeEntry(form); onClose() }} disabled={!form.activity.trim()}
            style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: 'var(--bg-surface)', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', opacity: form.activity.trim() ? 1 : 0.4 }}>
            Track
          </button>
        </div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (!active || !payload?.[0]) return null
  return (
    <div className="card" style={{ padding: '8px 12px' }}>
      <p style={{ fontSize: 13, color: 'var(--text-primary)' }}>{payload[0].name}</p>
      <p style={{ fontSize: 13, color: 'var(--accent-warm)', fontWeight: 600 }}>{Math.round((payload[0].value / 60) * 10) / 10}h</p>
    </div>
  )
}

export function TimeTracker() {
  const [addOpen, setAddOpen] = useState(false)
  const [tab, setTab] = useState<'timeline' | 'insights'>('timeline')
  const { timeEntries } = useAppStore()

  const today = timeEntries.filter((e) => new Date(e.started_at).toDateString() === new Date().toDateString())

  const pieData = Object.entries(
    timeEntries.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.duration_minutes; return acc }, {} as Record<string, number>)
  ).map(([cat, min]) => ({ name: CATS[cat] ?? cat, value: min, color: CAT_COLORS[cat] ?? '#888' }))

  const studyTotal = Math.round(timeEntries.filter((e) => ['study', 'focused-work'].includes(e.category)).reduce((s, e) => s + e.duration_minutes, 0) / 60 * 10) / 10

  return (
    <div className="page-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Time & Mood Tracker</h1>
          <p className="page-sub">{today.length} activities logged today</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn btn-primary"><Plus size={14} /> Track</button>
      </div>

      <div className="tab-strip" style={{ width: 'fit-content' }}>
        {(['timeline', 'insights'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? 'active' : ''}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'timeline' && (
        <GlassCard style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }} noHover>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Today</h3>
          {today.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>Nothing logged today</p>
          ) : today.map((e) => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: CAT_COLORS[e.category] }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.activity}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{CATS[e.category]} · {e.duration_minutes} min</p>
              </div>
              <GlassPill>{e.mood_tag}</GlassPill>
            </div>
          ))}
          <button onClick={() => setAddOpen(true)} style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px dashed var(--border)', background: 'transparent', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Plus size={13} /> Track new activity
          </button>
        </GlassCard>
      )}

      {tab === 'insights' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <GlassCard style={{ padding: 24 }} noHover>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Time breakdown</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3} dataKey="value">
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>No data yet</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {pieData.slice(0, 4).map((d) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                    <span style={{ color: 'var(--text-muted)' }}>{d.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{Math.round(d.value / 60 * 10) / 10}h</span>
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard style={{ padding: 24 }} noHover>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Study time</h3>
            <p style={{ fontSize: 52, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{studyTotal}<span style={{ fontSize: 22, color: 'var(--text-muted)', fontWeight: 400 }}>h</span></p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>total all time</p>
            <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Focused', 'Refreshed', 'Neutral'].map((m) => (
                <div key={m} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{m} sessions</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{timeEntries.filter((e) => e.mood_tag === m).length}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      <AddEntryModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
