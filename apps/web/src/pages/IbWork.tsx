import { useState } from 'react'
import { Plus, Trash2, ChevronDown, FileText, BookOpen } from 'lucide-react'
import { GlassCard } from '@/components/glass/GlassCard'
import { useAppStore } from '@/store/useAppStore'
import type { IBWork, IBWorkStatus } from '@/store/useAppStore'

const STATUSES: IBWorkStatus[] = ['Not Started', 'Research', 'Draft 1', 'Draft 2', 'Final', 'Submitted']
const STATUS_IDX: Record<IBWorkStatus, number> = { 'Not Started': 0, 'Research': 1, 'Draft 1': 2, 'Draft 2': 3, 'Final': 4, 'Submitted': 5 }

const STATUS_COLOR: Record<IBWorkStatus, string> = {
  'Not Started': 'var(--border-strong)',
  'Research':    '#8B9FC0',
  'Draft 1':     '#C0A88B',
  'Draft 2':     '#C09B3A',
  'Final':       '#8BC0A8',
  'Submitted':   '#6aaa64',
}

const inputSt: React.CSSProperties = {
  width: '100%', padding: '11px 14px', fontSize: 14,
  background: 'var(--bg-base)', border: '1px solid var(--border)',
  borderRadius: 12, color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit',
}
const labelSt: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 500,
  color: 'var(--text-muted)', textTransform: 'uppercase',
  letterSpacing: '0.08em', marginBottom: 6,
}

function AddWorkModal({ open, onClose, defaultType }: { open: boolean; onClose: () => void; defaultType: 'IA' | 'EE' }) {
  const { addIbWork, subjects } = useAppStore()
  const subjectOptions = subjects.filter((s) => !['Theory of Knowledge (TOK)', 'CAS', 'Extended Essay (EE)'].includes(s))

  const [form, setForm] = useState<Omit<IBWork, 'id' | 'createdAt'>>({
    type: defaultType,
    subject: subjectOptions[0] ?? '',
    title: '',
    supervisor: '',
    status: 'Not Started',
    wordCount: 0,
    targetWordCount: defaultType === 'EE' ? 4000 : 2000,
    dueDate: '',
    notes: '',
  })

  if (!open) return null

  const isEE = form.type === 'EE'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} onClick={onClose} />
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 500, padding: 28, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--glass-card-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 22, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['IA', 'EE'] as const).map((t) => (
            <button key={t} onClick={() => setForm((f) => ({ ...f, type: t, targetWordCount: t === 'EE' ? 4000 : 2000 }))}
              style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, background: form.type === t ? 'var(--accent)' : 'var(--bg-base)', color: form.type === t ? 'var(--bg-surface)' : 'var(--text-muted)', transition: 'all 120ms ease' }}>
              {t === 'IA' ? 'Internal Assessment' : 'Extended Essay'}
            </button>
          ))}
        </div>

        {isEE && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--accent-warm-bg)', border: '1px solid rgba(184,131,46,0.25)', fontSize: 13, color: 'var(--accent-warm)' }}>
            4,000 words max · One subject · Due ~18 months before exams
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelSt}>Subject</label>
            <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} style={{ ...inputSt, appearance: 'none' }}>
              {subjectOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={labelSt}>Due date</label>
            <input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} style={inputSt} />
          </div>
        </div>

        <div>
          <label style={labelSt}>Title / research question</label>
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder={isEE ? 'e.g. "How does X affect Y in the context of Z?"' : 'e.g. "Investigation into..."'} style={inputSt} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelSt}>Supervisor</label>
            <input value={form.supervisor} onChange={(e) => setForm((f) => ({ ...f, supervisor: e.target.value }))} placeholder="Mr. / Ms." style={inputSt} />
          </div>
          <div>
            <label style={labelSt}>Word count</label>
            <input type="number" value={form.wordCount} onChange={(e) => setForm((f) => ({ ...f, wordCount: parseInt(e.target.value) || 0 }))} style={inputSt} />
          </div>
          <div>
            <label style={labelSt}>Target words</label>
            <input type="number" value={form.targetWordCount} onChange={(e) => setForm((f) => ({ ...f, targetWordCount: parseInt(e.target.value) || 0 }))} style={inputSt} />
          </div>
        </div>

        <div>
          <label style={labelSt}>Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2}
            placeholder="Key sources, ideas, next steps…" style={{ ...inputSt, resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={() => { addIbWork(form); onClose() }} disabled={!form.subject}
            style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: 'var(--bg-surface)', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', opacity: form.subject ? 1 : 0.4 }}>
            Add {form.type}
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusPipeline({ status, onChange }: { status: IBWorkStatus; onChange: (s: IBWorkStatus) => void }) {
  const idx = STATUS_IDX[status]
  return (
    <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
      {STATUSES.map((s, i) => (
        <button key={s} onClick={() => onChange(s)} title={s} style={{
          flex: 1, padding: '5px 0', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 10, fontWeight: i <= idx ? 600 : 400,
          background: i <= idx ? STATUS_COLOR[status] : 'var(--bg-base)',
          color: i <= idx ? (i <= idx && ['Final', 'Submitted'].includes(status) ? '#fff' : 'var(--bg-surface)') : 'var(--text-muted)',
          transition: 'all 120ms ease',
          borderRight: i < STATUSES.length - 1 ? '1px solid var(--border)' : 'none',
        }}>
          {s.split(' ')[0]}
        </button>
      ))}
    </div>
  )
}

function WorkCard({ work }: { work: IBWork }) {
  const { updateIbWork, deleteIbWork } = useAppStore()
  const [expanded, setExpanded] = useState(false)
  const pct = work.targetWordCount > 0 ? Math.min(100, Math.round((work.wordCount / work.targetWordCount) * 100)) : 0
  const isEE = work.type === 'EE'
  const daysLeft = work.dueDate ? Math.ceil((new Date(work.dueDate + 'T00:00:00').getTime() - Date.now()) / 86400000) : null

  return (
    <GlassCard style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }} noHover>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: isEE ? 'var(--accent-warm-bg)' : 'rgba(139,159,192,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isEE ? <BookOpen size={15} style={{ color: 'var(--accent-warm)' }} /> : <FileText size={15} style={{ color: '#8B9FC0' }} />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: isEE ? 'var(--accent-warm)' : '#8B9FC0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{work.type}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{work.subject}</span>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
              {work.title || <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontStyle: 'italic' }}>Untitled</span>}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {daysLeft !== null && (
            <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: daysLeft < 14 ? 'rgba(200,75,75,0.12)' : 'var(--bg-overlay)', color: daysLeft < 14 ? '#C84B4B' : 'var(--text-muted)', fontWeight: 500 }}>
              {daysLeft < 0 ? 'Overdue' : `${daysLeft}d left`}
            </span>
          )}
          <button onClick={() => setExpanded((e) => !e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
            <ChevronDown size={14} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }} />
          </button>
          <button onClick={() => deleteIbWork(work.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#C84B4B')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Status pipeline */}
      <StatusPipeline status={work.status} onChange={(s) => updateIbWork(work.id, { status: s })} />

      {/* Word count */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>Words</span>
          <span style={{ fontWeight: 600, color: pct >= 80 ? '#6aaa64' : 'var(--text-primary)' }}>
            {work.wordCount.toLocaleString()} / {work.targetWordCount.toLocaleString()} ({pct}%)
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 100 ? '#6aaa64' : 'var(--accent-warm)' }} />
        </div>
      </div>

      {/* Expanded edit section */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelSt}>Title / RQ</label>
              <input value={work.title} onChange={(e) => updateIbWork(work.id, { title: e.target.value })} style={inputSt} placeholder="Research question" />
            </div>
            <div>
              <label style={labelSt}>Supervisor</label>
              <input value={work.supervisor} onChange={(e) => updateIbWork(work.id, { supervisor: e.target.value })} style={inputSt} placeholder="Teacher name" />
            </div>
            <div>
              <label style={labelSt}>Word count</label>
              <input type="number" value={work.wordCount} onChange={(e) => updateIbWork(work.id, { wordCount: parseInt(e.target.value) || 0 })} style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Due date</label>
              <input type="date" value={work.dueDate} onChange={(e) => updateIbWork(work.id, { dueDate: e.target.value })} style={inputSt} />
            </div>
          </div>
          <div>
            <label style={labelSt}>Notes</label>
            <textarea value={work.notes} onChange={(e) => updateIbWork(work.id, { notes: e.target.value })} rows={2}
              style={{ ...inputSt, resize: 'vertical' }} placeholder="Key sources, ideas, next steps…" />
          </div>
          {work.supervisor && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Supervisor: {work.supervisor}</p>
          )}
        </div>
      )}
    </GlassCard>
  )
}

export function IbWork() {
  const { ibWorks, subjects } = useAppStore()
  const [addOpen, setAddOpen] = useState(false)
  const [addType, setAddType] = useState<'IA' | 'EE'>('IA')

  const ias = ibWorks.filter((w) => w.type === 'IA')
  const ees = ibWorks.filter((w) => w.type === 'EE')

  const openAdd = (type: 'IA' | 'EE') => { setAddType(type); setAddOpen(true) }

  // Subjects that should have an IA (groups 1–4, 6 arts — not core/math that has its own)
  const iaSubjects = subjects.filter((s) => {
    const core = ['Theory of Knowledge (TOK)', 'CAS', 'Extended Essay (EE)']
    const isMath = s.startsWith('Math:')
    return !core.includes(s) && !isMath
  })
  const missingIAs = iaSubjects.filter((s) => !ias.find((ia) => ia.subject === s))

  return (
    <div className="page-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">IB Work — IAs & EE</h1>
          <p className="page-sub">{ias.length} IA{ias.length !== 1 ? 's' : ''} · {ees.length} EE{ees.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => openAdd('IA')} className="btn btn-ghost"><Plus size={14} /> Add IA</button>
          <button onClick={() => openAdd('EE')} className="btn btn-primary"><Plus size={14} /> Add EE</button>
        </div>
      </div>

      {/* Missing IA nudge */}
      {missingIAs.length > 0 && (
        <div style={{ padding: '14px 18px', borderRadius: 14, border: '1px solid rgba(184,131,46,0.3)', background: 'var(--accent-warm-bg)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--accent-warm)', fontWeight: 500, flex: 1 }}>
            You have IAs to track for: {missingIAs.map((s) => s.replace(/ (HL|SL)$/, '')).join(', ')}
          </span>
          <button onClick={() => openAdd('IA')} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: 'none', background: 'var(--accent-warm)', color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
            Add IA
          </button>
        </div>
      )}

      {/* Extended Essay */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={16} style={{ color: 'var(--accent-warm)' }} />
          Extended Essay
        </h2>
        {ees.length === 0 ? (
          <GlassCard style={{ padding: 32, textAlign: 'center' }} noHover>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 14 }}>
              No EE added yet. The Extended Essay is a 4,000-word independent research piece — a core component of the IB Diploma.
            </p>
            <button onClick={() => openAdd('EE')} className="btn btn-primary" style={{ margin: '0 auto' }}><Plus size={14} /> Start EE</button>
          </GlassCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ees.map((w) => <WorkCard key={w.id} work={w} />)}
          </div>
        )}
      </div>

      {/* Internal Assessments */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={16} style={{ color: '#8B9FC0' }} />
          Internal Assessments
        </h2>
        {ias.length === 0 ? (
          <GlassCard style={{ padding: 32, textAlign: 'center' }} noHover>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 14 }}>
              Each IB subject has an IA worth 20–30% of your final grade.
            </p>
            <button onClick={() => openAdd('IA')} className="btn btn-ghost" style={{ margin: '0 auto' }}><Plus size={14} /> Add IA</button>
          </GlassCard>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
            {ias.map((w) => <WorkCard key={w.id} work={w} />)}
          </div>
        )}
      </div>

      <AddWorkModal open={addOpen} onClose={() => setAddOpen(false)} defaultType={addType} />
    </div>
  )
}
