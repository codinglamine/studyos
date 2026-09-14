import { useState } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassPill } from '@/components/glass/GlassPill'
import { useAppStore } from '@/store/useAppStore'
import type { Grade } from '@/store/useAppStore'

const inputSt: React.CSSProperties = { width: '100%', padding: '11px 14px', fontSize: 14, background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }
const labelSt: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }

function AddGradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addGrade, subjects } = useAppStore()
  const [form, setForm] = useState({
    subject: subjects[0] ?? '', assessment_name: '', type: 'Test' as Grade['type'],
    score: 0, max_score: 100, weight: 1, date: new Date().toISOString().slice(0, 10),
  })
  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 460, padding: 28, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--glass-card-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 22, boxShadow: 'var(--shadow-lg)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Add Grade</h2>
        <div>
          <label style={labelSt}>Assessment name</label>
          <input value={form.assessment_name} onChange={(e) => setForm((f) => ({ ...f, assessment_name: e.target.value }))}
            autoFocus placeholder="e.g. Biology Mock Paper 2" style={inputSt} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelSt}>Subject</label>
            <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} style={{ ...inputSt, appearance: 'none' }}>
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={labelSt}>Type</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Grade['type'] }))} style={{ ...inputSt, appearance: 'none' }}>
              {['Test', 'Homework', 'Project', 'IA', 'Mock', 'Other'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {(['score', 'max_score', 'weight'] as const).map((k) => (
            <div key={k}>
              <label style={labelSt}>{k.replace('_', ' ')}</label>
              <input type="number" value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: parseFloat(e.target.value) || 0 }))} style={inputSt} />
            </div>
          ))}
        </div>
        <div>
          <label style={labelSt}>Date</label>
          <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} style={inputSt} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={() => { addGrade(form); onClose() }} disabled={!form.assessment_name.trim()}
            style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: 'var(--bg-surface)', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', opacity: form.assessment_name.trim() ? 1 : 0.4 }}>
            Add grade
          </button>
        </div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { name: string; score: number } }[] }) => {
  if (!active || !payload?.[0]) return null
  return (
    <div className="card" style={{ padding: '8px 12px' }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{payload[0].payload.name}</p>
      <p style={{ fontSize: 13, color: 'var(--accent-warm)' }}>{payload[0].payload.score}%</p>
    </div>
  )
}

export function Grades() {
  const [addOpen, setAddOpen] = useState(false)
  const { grades, subjects, deleteGrade } = useAppStore()

  const bySubject = subjects.reduce((acc, s) => { acc[s] = grades.filter((g) => g.subject === s); return acc }, {} as Record<string, Grade[]>)
  const overall = grades.length > 0 ? Math.round(grades.reduce((s, g) => s + (g.score / g.max_score) * 100, 0) / grades.length) : 0
  const chartData = grades.slice(-10).map((g) => ({ name: g.assessment_name.slice(0, 14), score: Math.round((g.score / g.max_score) * 100) }))

  return (
    <div className="page-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Grades & Analytics</h1>
          <p className="page-sub">{grades.length} assessments logged</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn btn-primary"><Plus size={14} /> Add grade</button>
      </div>

      {/* Hero */}
      <GlassCard style={{ padding: '32px 36px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }} noHover>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Overall average</p>
          <p style={{ fontSize: 64, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>{overall}<span style={{ fontSize: 28, color: 'var(--text-muted)', fontWeight: 400 }}>%</span></p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>IB Predicted</p>
          <p style={{ fontSize: 40, fontWeight: 700, color: 'var(--accent-warm)', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {Math.min(45, Math.round(overall / 100 * 7) * Math.max(1, subjects.filter((s) => !['TOK', 'CAS', 'EE'].includes(s)).length))}<span style={{ fontSize: 20, color: 'var(--text-muted)', fontWeight: 400 }}>/45</span>
          </p>
        </div>
      </GlassCard>

      {/* Bar chart */}
      {chartData.length > 0 && (
        <GlassCard style={{ padding: 24 }} noHover>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>Assessment scores</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={28}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-overlay)' }} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={entry.score >= 70 ? 'var(--accent-warm)' : 'var(--border-strong)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {/* Subject cards */}
      {subjects.filter((s) => bySubject[s]?.length > 0).length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {subjects.filter((s) => bySubject[s]?.length > 0).map((s) => {
            const gs = bySubject[s]
            const avg = Math.round(gs.reduce((sum, g) => sum + (g.score / g.max_score) * 100 * g.weight, 0) / gs.reduce((sum, g) => sum + g.weight, 0))
            const trend = gs.length > 1 ? (gs[gs.length - 1].score / gs[gs.length - 1].max_score) >= (gs[gs.length - 2].score / gs[gs.length - 2].max_score) : true
            return (
              <GlassCard key={s} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }} noHover>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s}</span>
                  {trend ? <TrendingUp size={14} style={{ color: '#6aaa64', flexShrink: 0 }} /> : <TrendingDown size={14} style={{ color: '#c84b4b', flexShrink: 0 }} />}
                </div>
                <p style={{ fontSize: 36, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{avg}<span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 400 }}>%</span></p>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${avg}%` }} /></div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{gs.length} assessment{gs.length !== 1 ? 's' : ''}</p>
              </GlassCard>
            )
          })}
        </div>
      )}

      {/* Table */}
      {grades.length > 0 && (
        <GlassCard noHover>
          <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Assessment', 'Subject', 'Score', 'Date'].map((h) => (
                  <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => {
                const pct = Math.round((g.score / g.max_score) * 100)
                return (
                  <tr key={g.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '14px 18px', fontWeight: 500, color: 'var(--text-primary)' }}>{g.assessment_name}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)' }}>{g.subject}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontWeight: 600, color: pct >= 70 ? 'var(--accent-warm)' : pct >= 50 ? 'var(--text-secondary)' : '#C84B4B' }}>
                        {g.score}/{g.max_score} ({pct}%)
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)' }}>{g.date}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <button onClick={() => deleteGrade(g.id)}
                        style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#c84b4b')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </GlassCard>
      )}

      {grades.length === 0 && (
        <GlassCard style={{ padding: 48, textAlign: 'center' }} noHover>
          <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>No grades yet — add your first assessment!</p>
        </GlassCard>
      )}

      <AddGradeModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
