import { useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { GlassCard } from '@/components/glass/GlassCard'
import { useAppStore } from '@/store/useAppStore'

const WORK = 25 * 60

export function PomodoroWidget() {
  const { pomodoroRunning, pomodoroSecondsLeft, pomodoroSubject,
    setPomodoroRunning, setPomodoroSecondsLeft, setPomodoroSubject, subjects, addXP } = useAppStore()
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (pomodoroRunning) {
      ref.current = setInterval(() => {
        setPomodoroSecondsLeft(pomodoroSecondsLeft - 1)
        if (pomodoroSecondsLeft <= 1) { setPomodoroRunning(false); setPomodoroSecondsLeft(WORK); addXP(15, 'Study session!') }
      }, 1000)
    }
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [pomodoroRunning, pomodoroSecondsLeft])

  useEffect(() => {
    const m = Math.floor(pomodoroSecondsLeft / 60); const s = pomodoroSecondsLeft % 60
    document.title = pomodoroRunning ? `⏱ ${m}:${String(s).padStart(2,'0')} — ${pomodoroSubject || 'Study'}` : 'StudyOS'
    return () => { document.title = 'StudyOS' }
  }, [pomodoroRunning, pomodoroSecondsLeft, pomodoroSubject])

  const mins = Math.floor(pomodoroSecondsLeft / 60)
  const secs = pomodoroSecondsLeft % 60
  const progress = 1 - pomodoroSecondsLeft / WORK
  const r = 38; const circ = 2 * Math.PI * r

  return (
    <GlassCard className="bento-sm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }} noHover>
      <p style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pomodoro</p>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
        <circle cx="50" cy="50" r={r} fill="none"
          stroke="var(--accent-warm)" strokeWidth="5"
          strokeDasharray={`${progress * circ} ${circ}`}
          strokeLinecap="round" transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dasharray 1s linear' }}
        />
        <text x="50" y="55" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--text-primary)" fontFamily="Inter">
          {mins}:{String(secs).padStart(2, '0')}
        </text>
      </svg>
      <select value={pomodoroSubject} onChange={(e) => setPomodoroSubject(e.target.value)}
        style={{ fontSize: 12, color: 'var(--text-muted)', background: 'transparent', border: 'none', outline: 'none', width: '100%', textAlign: 'center', cursor: 'pointer' }}>
        <option value="">Select subject…</option>
        {subjects.map((s) => <option key={s}>{s}</option>)}
      </select>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setPomodoroRunning(!pomodoroRunning)} style={{
          width: 36, height: 36, borderRadius: '50%', border: 'none',
          background: 'var(--accent)', color: 'var(--bg-surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'opacity 120ms ease',
        }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
          {pomodoroRunning ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button onClick={() => { setPomodoroRunning(false); setPomodoroSecondsLeft(WORK) }} style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '1px solid var(--border)', background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 120ms ease',
        }} onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-hover)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
          <RotateCcw size={14} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>
    </GlassCard>
  )
}
