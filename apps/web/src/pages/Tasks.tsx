import { useState } from 'react'
import { Plus, CheckCircle, Circle, Trash2 } from 'lucide-react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassPill } from '@/components/glass/GlassPill'
import { AddTaskModal } from '@/features/tasks/AddTaskModal'
import { useAppStore } from '@/store/useAppStore'
import type { Task } from '@/store/useAppStore'
import { formatRelativeDate } from '@/lib/utils'
import { STATUSES } from '@/lib/constants'

const PRIORITY_DOT: Record<string, string> = {
  Low: '#6B7280', Medium: '#C08B3A', High: '#E57347', Urgent: '#C84B4B',
}

function TaskCard({ task }: { task: Task }) {
  const { completeTask, deleteTask } = useAppStore()
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id })
  const done = task.status === 'Done'

  return (
    <div
      ref={setNodeRef}
      className="card"
      style={{ transform: CSS.Transform.toString(transform), transition, cursor: 'grab' }}
      {...attributes} {...listeners}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px 0' }}>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => !done && completeTask(task.id)}
          style={{ marginTop: 1, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}
        >
          {done
            ? <CheckCircle size={16} style={{ color: 'var(--accent-warm)' }} />
            : <Circle size={16} style={{ color: 'var(--text-muted)' }} />}
        </button>
        <p style={{ fontSize: 14, flex: 1, lineHeight: 1.4, textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: done ? 400 : 500 }}>
          {task.title}
        </p>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => deleteTask(task.id)}
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexShrink: 0, padding: 0 }}>
          <Trash2 size={13} />
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px 14px', paddingLeft: 42 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_DOT[task.priority], flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{task.subject}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{formatRelativeDate(task.due_date)}</span>
      </div>
    </div>
  )
}

function KanbanColumn({ status, tasks }: { status: string; tasks: Task[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 260, flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{status}</span>
        <GlassPill>{tasks.length}</GlassPill>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 80 }}>
          {tasks.map((t) => <TaskCard key={t.id} task={t} />)}
        </div>
      </SortableContext>
    </div>
  )
}

function ListView() {
  const { tasks, completeTask, deleteTask } = useAppStore()
  const sorted = [...tasks].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

  return (
    <GlassCard noHover>
      <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Task', 'Subject', 'Priority', 'Due', 'Status'].map((h) => (
              <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
            ))}
            <th style={{ width: 40 }} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((t) => (
            <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <td style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button onClick={() => t.status !== 'Done' && completeTask(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0, flexShrink: 0 }}>
                    {t.status === 'Done'
                      ? <CheckCircle size={16} style={{ color: 'var(--accent-warm)' }} />
                      : <Circle size={16} style={{ color: 'var(--text-muted)' }} />}
                  </button>
                  <span style={{ textDecoration: t.status === 'Done' ? 'line-through' : 'none', color: t.status === 'Done' ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: 500 }}>{t.title}</span>
                </div>
              </td>
              <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: 13 }}>{t.subject}</td>
              <td style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_DOT[t.priority] }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.priority}</span>
                </div>
              </td>
              <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-muted)' }}>{formatRelativeDate(t.due_date)}</td>
              <td style={{ padding: '14px 18px' }}><GlassPill>{t.status}</GlassPill></td>
              <td style={{ padding: '14px 18px' }}>
                <button onClick={() => deleteTask(t.id)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#c84b4b')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>
                  <Trash2 size={13} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px 0', fontSize: 14 }}>No tasks yet — add one!</p>}
    </GlassCard>
  )
}

export function Tasks() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [addOpen, setAddOpen] = useState(false)
  const { tasks, updateTask } = useAppStore()

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const target = tasks.find((t) => t.id === over.id)
    if (target) updateTask(active.id as string, { status: target.status })
  }

  const grouped = STATUSES.reduce((acc, s) => { acc[s] = tasks.filter((t) => t.status === s); return acc }, {} as Record<string, Task[]>)

  return (
    <div className="page-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Tasks & Homework</h1>
          <p className="page-sub">{tasks.filter((t) => t.status !== 'Done').length} remaining</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="tab-strip">
            {(['kanban', 'list'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={view === v ? 'active' : ''}>
                {v[0].toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => setAddOpen(true)} className="btn btn-primary">
            <Plus size={14} /> Add task
          </button>
        </div>
      </div>

      {view === 'kanban' ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12 }}>
            {STATUSES.map((s) => <KanbanColumn key={s} status={s} tasks={grouped[s] ?? []} />)}
          </div>
        </DndContext>
      ) : <ListView />}

      <AddTaskModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
