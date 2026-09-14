import { useState } from 'react'
import { X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { TASK_TYPES, PRIORITIES } from '@/lib/constants'

interface Props { open: boolean; onClose: () => void }

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', fontSize: 14, background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }

export function AddTaskModal({ open, onClose }: Props) {
  const { addTask, subjects } = useAppStore()
  const [form, setForm] = useState({
    title: '', subject: subjects[0] ?? '', type: 'Homework' as const,
    due_date: new Date().toISOString().slice(0, 16),
    priority: 'Medium' as const, estimated_minutes: 30, notes: '',
  })

  if (!open) return null

  const submit = () => {
    if (!form.title.trim()) return
    addTask({ ...form, status: 'Todo', actual_minutes: 0, repeat: 'none' })
    onClose()
    setForm((f) => ({ ...f, title: '', notes: '' }))
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{
        position: 'relative', zIndex: 10, width: '100%', maxWidth: 460,
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 20, boxShadow: 'var(--shadow-md)', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 28px 18px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Add task</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><X size={18} /></button>
        </div>

        <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input autoFocus value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="What do you need to do?" style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Subject</label>
              <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} style={{ ...inputStyle, appearance: 'none' }}>
                {subjects.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as typeof form.type }))} style={{ ...inputStyle, appearance: 'none' }}>
                {TASK_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Due date</label>
              <input type="datetime-local" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as typeof form.priority }))} style={{ ...inputStyle, appearance: 'none' }}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <button onClick={submit} disabled={!form.title.trim()} style={{
            width: '100%', padding: '12px', borderRadius: 10, border: 'none',
            background: 'var(--accent)', color: 'var(--bg-surface)',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            opacity: form.title.trim() ? 1 : 0.35, transition: 'opacity 120ms ease',
          }}>
            Add task
          </button>
        </div>
      </div>
    </div>
  )
}
