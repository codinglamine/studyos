import { useState } from 'react'
import { ChevronRight, ChevronLeft, Check, GraduationCap, Link, Plus, Sparkles, CalendarDays, ListChecks } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { UserProfile, RoutineBlock } from '@/store/useAppStore'

// Subjects that can be taken at HL or SL
const IB_BASE: Record<string, string[]> = {
  'Group 1 – Language & Lit': ['English A: Literature', 'English A: Lang & Lit', 'French A', 'Spanish A', 'Arabic A', 'German A', 'Chinese A'],
  'Group 2 – Language Acquisition': ['French B', 'Spanish B', 'English B', 'German B', 'Mandarin B', 'Arabic B', 'Japanese B'],
  'Group 3 – Individuals & Societies': ['History', 'Economics', 'Geography', 'Business Management', 'Psychology', 'Philosophy', 'Global Politics', 'ITGS', 'Social & Cultural Anthropology'],
  'Group 4 – Sciences': ['Biology', 'Chemistry', 'Physics', 'Computer Science', 'Environmental Systems & Societies', 'Sports, Exercise & Health'],
  'Group 6 – Arts': ['Visual Arts', 'Music', 'Theatre', 'Film', 'Dance'],
}

// Math has its own course+level combos
const MATH_OPTIONS = ['Math: Analysis & Approaches HL', 'Math: Analysis & Approaches SL', 'Math: Applications & Interpretation HL', 'Math: Applications & Interpretation SL']

// Core components (no HL/SL)
const CORE = ['Theory of Knowledge (TOK)', 'Extended Essay (EE)', 'CAS']

const UNIVERSITIES = ['Oxford', 'Cambridge', 'Imperial College', 'UCL', 'LSE', 'Edinburgh', 'Harvard', 'MIT', 'Stanford', 'Sciences Po', 'TU Delft', 'McGill']
const SESSIONS = ['May 2025', 'November 2025', 'May 2026', 'November 2026', 'May 2027']

const card: React.CSSProperties = {
  background: 'var(--glass-card-bg)',
  backdropFilter: 'blur(20px) saturate(160%)',
  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
  border: '1px solid var(--glass-border)',
  borderRadius: 24,
  boxShadow: 'var(--shadow-lg), var(--glass-inset)',
  padding: '40px 44px',
  width: '100%',
  maxWidth: 600,
}

const inputSt: React.CSSProperties = {
  width: '100%', padding: '12px 16px', fontSize: 15,
  background: 'var(--bg-base)', border: '1px solid var(--border)',
  borderRadius: 12, color: 'var(--text-primary)', outline: 'none',
  fontFamily: 'inherit',
}

const labelSt: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 500,
  color: 'var(--text-muted)', textTransform: 'uppercase',
  letterSpacing: '0.08em', marginBottom: 8,
}

function Pill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 14px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
      fontFamily: 'inherit', border: selected ? 'none' : '1px solid var(--border)',
      background: selected ? 'var(--accent)' : 'transparent',
      color: selected ? 'var(--bg-surface)' : 'var(--text-secondary)',
      transition: 'all 120ms ease',
      display: 'flex', alignItems: 'center', gap: 5,
    }}>
      {selected && <Check size={11} />}
      {label}
    </button>
  )
}

function SubjectRow({ name, selected, onToggle }: {
  name: string
  selected: 'HL' | 'SL' | null
  onToggle: (level: 'HL' | 'SL') => void
}) {
  const levelBtn = (level: 'HL' | 'SL') => ({
    padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', border: 'none', fontFamily: 'inherit',
    background: selected === level ? (level === 'HL' ? 'var(--accent)' : 'var(--accent-warm)') : 'var(--bg-base)',
    color: selected === level ? 'var(--bg-surface)' : 'var(--text-muted)',
    transition: 'all 120ms ease',
  })

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '9px 12px', borderRadius: 10,
      border: selected ? `1px solid ${selected === 'HL' ? 'rgba(24,22,15,0.3)' : 'rgba(184,131,46,0.3)'}` : '1px solid var(--border)',
      background: selected ? (selected === 'HL' ? 'rgba(24,22,15,0.05)' : 'var(--accent-warm-bg)') : 'transparent',
      transition: 'all 120ms ease',
    }}>
      <span style={{ fontSize: 13, color: selected ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: selected ? 500 : 400 }}>
        {name}
        {selected && <span style={{ fontSize: 11, marginLeft: 6, color: selected === 'HL' ? 'var(--accent)' : 'var(--accent-warm)', fontWeight: 600 }}>{selected}</span>}
      </span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => onToggle('HL')} style={{ ...levelBtn('HL'), border: `1px solid ${selected === 'HL' ? 'transparent' : 'var(--border)'}` }}>HL</button>
        <button onClick={() => onToggle('SL')} style={{ ...levelBtn('SL'), border: `1px solid ${selected === 'SL' ? 'transparent' : 'var(--border)'}` }}>SL</button>
      </div>
    </div>
  )
}

function Progress({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 999,
          background: i < step ? 'var(--accent-warm)' : 'var(--border)',
          transition: 'background 300ms ease',
        }} />
      ))}
    </div>
  )
}

export function Onboarding() {
  const { setUserProfile, setOnboardingDone, addTask, setStudyRoutine } = useAppStore()
  const [step, setStep] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [genPhase, setGenPhase] = useState('')
  const [planResult, setPlanResult] = useState<{ summary: string; taskCount: number; routineCount: number } | null>(null)
  const [pronoteLoading, setPronoteLoading] = useState(false)
  const [pronoteStatus, setPronoteStatus] = useState('')

  const [form, setForm] = useState<Omit<UserProfile, 'customPlan'>>({
    name: '', age: '', school: '', ibYear: 'DP2', session: 'May 2026',
    subjects: [], goals: [], universityTargets: [], pronoteCalendarUrl: '',
  })

  const [customGoal, setCustomGoal] = useState('')
  const [customUni, setCustomUni] = useState('')

  const STEPS = 6
  const next = () => setStep((s) => Math.min(s + 1, STEPS - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  // Count non-core subjects (HL/SL ones)
  const nonCoreCount = form.subjects.filter((s) => !CORE.includes(s)).length
  const hlCount = form.subjects.filter((s) => s.endsWith(' HL')).length

  const toggleSubjectLevel = (baseName: string, level: 'HL' | 'SL') => {
    const hlName = `${baseName} HL`
    const slName = `${baseName} SL`
    const current = form.subjects.includes(hlName) ? 'HL' : form.subjects.includes(slName) ? 'SL' : null
    const newName = `${baseName} ${level}`

    if (current === level) {
      // Deselect
      setForm((f) => ({ ...f, subjects: f.subjects.filter((s) => s !== hlName && s !== slName) }))
    } else {
      // Select this level (remove other level if present)
      setForm((f) => ({ ...f, subjects: [...f.subjects.filter((s) => s !== hlName && s !== slName), newName] }))
    }
  }

  const toggleFixed = (s: string) =>
    setForm((f) => ({ ...f, subjects: f.subjects.includes(s) ? f.subjects.filter((x) => x !== s) : [...f.subjects, s] }))

  const toggleGoal = (g: string) =>
    setForm((f) => ({ ...f, goals: f.goals.includes(g) ? f.goals.filter((x) => x !== g) : [...f.goals, g] }))

  const toggleUni = (u: string) =>
    setForm((f) => ({ ...f, universityTargets: f.universityTargets.includes(u) ? f.universityTargets.filter((x) => x !== u) : [...f.universityTargets, u] }))

  const getSubjectLevel = (baseName: string): 'HL' | 'SL' | null => {
    if (form.subjects.includes(`${baseName} HL`)) return 'HL'
    if (form.subjects.includes(`${baseName} SL`)) return 'SL'
    return null
  }

  const testPronote = async () => {
    if (!form.pronoteCalendarUrl.trim()) return
    setPronoteLoading(true); setPronoteStatus('')
    try {
      const res = await fetch('/api/pronote/ical', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: form.pronoteCalendarUrl }),
      })
      const data = await res.json()
      setPronoteStatus(res.ok ? `✓ Connected — ${data.count} events found` : `✗ ${data.error}`)
    } catch { setPronoteStatus('✗ Could not reach server') }
    setPronoteLoading(false)
  }

  const finish = async () => {
    setGenerating(true)
    setGenPhase('Analysing your subject combination…')
    try {
      await new Promise((r) => setTimeout(r, 600))
      setGenPhase('Building your personalised study routine…')

      const res = await fetch('/api/ai/plan-structured', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: form, today: new Date().toISOString().slice(0, 10) }),
      })

      setGenPhase('Scheduling tasks and deadlines…')
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Plan generation failed')

      const summary: string = data.summary || ''
      const tasks: Record<string, unknown>[] = Array.isArray(data.tasks) ? data.tasks : []
      const routine: Record<string, unknown>[] = Array.isArray(data.weeklyRoutine) ? data.weeklyRoutine : []

      // Import tasks
      for (const t of tasks) {
        try {
          addTask({
            title: String(t.title || ''),
            subject: String(t.subject || form.subjects[0] || ''),
            type: (t.type as 'Homework' | 'Test' | 'Project' | 'IB' | 'EC' | 'Personal') || 'Homework',
            due_date: String(t.due_date || new Date().toISOString().slice(0, 10)),
            priority: (t.priority as 'Low' | 'Medium' | 'High' | 'Urgent') || 'Medium',
            status: 'Todo',
            estimated_minutes: Number(t.estimated_minutes) || 60,
            actual_minutes: 0,
            notes: String(t.notes || ''),
            repeat: 'none',
          })
        } catch {}
      }

      // Import routine
      const routineBlocks: RoutineBlock[] = routine.map((b) => ({
        id: crypto.randomUUID(),
        dayOfWeek: Number(b.dayOfWeek) || 1,
        startHour: Number(b.startHour) || 16,
        durationMinutes: Number(b.durationMinutes) || 60,
        subject: String(b.subject || ''),
        activity: String(b.activity || 'Study session'),
        color: String(b.color || '#8B9FC0'),
      }))
      setStudyRoutine(routineBlocks)

      setUserProfile({ ...form, customPlan: summary })
      setPlanResult({ summary, taskCount: tasks.length, routineCount: routineBlocks.length })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown'
      setUserProfile({ ...form, customPlan: `Plan generation failed: ${msg}. You can regenerate from the Dashboard.` })
      setPlanResult({ summary: `Could not connect to AI. You can regenerate your plan from the Dashboard once the backend is running.`, taskCount: 0, routineCount: 0 })
    }
    setGenerating(false)
  }

  const btnStyle = (primary = true, disabled = false): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '12px 24px', borderRadius: 12,
    border: primary ? 'none' : '1px solid var(--border)',
    fontSize: 14, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    background: primary ? 'var(--accent)' : 'transparent',
    color: primary ? 'var(--bg-surface)' : 'var(--text-muted)',
    opacity: disabled ? 0.4 : 1,
    fontFamily: 'inherit', transition: 'opacity 120ms ease',
  })

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '15%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,131,46,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,120,200,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="step-in" style={card}>
        <Progress step={step + 1} total={STEPS} />

        {/* Step 0: Name + basic info */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={22} style={{ color: 'var(--bg-surface)' }} />
              </div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Welcome to StudyOS</h1>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 2 }}>Let's set up your personal study hub</p>
              </div>
            </div>
            <div>
              <label style={labelSt}>Your name</label>
              <input autoFocus value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && form.name.trim() && next()}
                placeholder="e.g. Ahmad" style={inputSt} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelSt}>Age</label>
                <input value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} placeholder="16" type="number" style={inputSt} />
              </div>
              <div>
                <label style={labelSt}>School</label>
                <input value={form.school} onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))} placeholder="Your school name" style={inputSt} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={next} disabled={!form.name.trim()} style={btnStyle(true, !form.name.trim())}>
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 1: IB Year & Session */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Your IB programme</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Tell us where you are in the IB journey</p>
            </div>
            <div>
              <label style={labelSt}>IB Year</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['DP1', 'DP2'] as const).map((y) => (
                  <Pill key={y} label={y} selected={form.ibYear === y} onClick={() => setForm((f) => ({ ...f, ibYear: y }))} />
                ))}
              </div>
            </div>
            <div>
              <label style={labelSt}>Exam session</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {SESSIONS.map((s) => (
                  <Pill key={s} label={s} selected={form.session === s} onClick={() => setForm((f) => ({ ...f, session: s }))} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={back} style={btnStyle(false)}><ChevronLeft size={16} /> Back</button>
              <button onClick={next} style={btnStyle()}>Continue <ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Step 2: Subjects with HL/SL */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Your IB subjects</h2>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {nonCoreCount} / 6 subjects · {hlCount} HL · {nonCoreCount - hlCount} SL
                </span>
                {nonCoreCount < 6 && (
                  <span style={{ fontSize: 12, color: 'var(--accent-warm)', fontWeight: 500 }}>
                    Need {6 - nonCoreCount} more
                  </span>
                )}
                {nonCoreCount >= 6 && (
                  <span style={{ fontSize: 12, color: '#6aaa64', fontWeight: 500 }}>✓ Minimum met</span>
                )}
              </div>
            </div>

            <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20, paddingRight: 4 }}>
              {/* HL/SL subject groups */}
              {Object.entries(IB_BASE).map(([group, subjects]) => (
                <div key={group}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{group}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {subjects.map((s) => (
                      <SubjectRow key={s} name={s} selected={getSubjectLevel(s)} onToggle={(level) => toggleSubjectLevel(s, level)} />
                    ))}
                  </div>
                </div>
              ))}

              {/* Math — 4 fixed options */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Group 5 – Mathematics</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {MATH_OPTIONS.map((m) => (
                    <Pill key={m} label={m} selected={form.subjects.includes(m)} onClick={() => toggleFixed(m)} />
                  ))}
                </div>
              </div>

              {/* Core */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Core</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CORE.map((s) => (
                    <Pill key={s} label={s} selected={form.subjects.includes(s)} onClick={() => toggleFixed(s)} />
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 18, height: 14, borderRadius: 4, background: 'var(--accent)' }} /> HL
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 18, height: 14, borderRadius: 4, background: 'var(--accent-warm)' }} /> SL
              </div>
              <span>· IB requires 3 HL + 3 SL minimum</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={back} style={btnStyle(false)}><ChevronLeft size={16} /> Back</button>
              <button onClick={next} disabled={nonCoreCount < 6} style={btnStyle(true, nonCoreCount < 6)}>
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Goals & Universities */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Goals & ambitions</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>What are you working towards?</p>
            </div>
            <div>
              <label style={labelSt}>Quick goals</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Get 40+ points', 'Strong IA', 'Top uni offer', 'Improve weak subjects', 'Better time management', 'Reduce stress', 'Build study routine'].map((g) => (
                  <Pill key={g} label={g} selected={form.goals.includes(g)} onClick={() => toggleGoal(g)} />
                ))}
              </div>
            </div>
            <div>
              <label style={labelSt}>Add custom goal</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={customGoal} onChange={(e) => setCustomGoal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && customGoal.trim()) { toggleGoal(customGoal.trim()); setCustomGoal('') } }}
                  placeholder="Type and press Enter" style={{ ...inputSt, flex: 1 }} />
                <button onClick={() => { if (customGoal.trim()) { toggleGoal(customGoal.trim()); setCustomGoal('') } }}
                  style={{ padding: '12px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: 'var(--bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div>
              <label style={labelSt}>Target universities (optional)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {UNIVERSITIES.map((u) => (
                  <Pill key={u} label={u} selected={form.universityTargets.includes(u)} onClick={() => toggleUni(u)} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={customUni} onChange={(e) => setCustomUni(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && customUni.trim()) { toggleUni(customUni.trim()); setCustomUni('') } }}
                  placeholder="Add university" style={{ ...inputSt, flex: 1 }} />
                <button onClick={() => { if (customUni.trim()) { toggleUni(customUni.trim()); setCustomUni('') } }}
                  style={{ padding: '12px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: 'var(--bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={back} style={btnStyle(false)}><ChevronLeft size={16} /> Back</button>
              <button onClick={next} style={btnStyle()}>Continue <ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Step 4: Pronote */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Connect Pronote</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Sync your timetable from Pronote. You can skip this and add it later in Settings.</p>
            </div>
            <div style={{ padding: 16, borderRadius: 14, border: '1px solid var(--border)', background: 'var(--bg-overlay)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>How to get your iCal URL</p>
              <ol style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: 18 }}>
                <li>Open Pronote → Planning / Emploi du temps</li>
                <li>Click the calendar icon or "Exporter"</li>
                <li>Copy the iCal / .ics link shown</li>
                <li>Paste it below</li>
              </ol>
            </div>
            <div>
              <label style={labelSt}>Pronote iCal URL</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={form.pronoteCalendarUrl}
                  onChange={(e) => { setForm((f) => ({ ...f, pronoteCalendarUrl: e.target.value })); setPronoteStatus('') }}
                  placeholder="https://0xxxxxxxx.index-education.net/pronote/ical/..."
                  style={{ ...inputSt, flex: 1 }} />
                <button onClick={testPronote} disabled={!form.pronoteCalendarUrl.trim() || pronoteLoading}
                  style={{ padding: '12px 16px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: 'var(--bg-surface)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', opacity: form.pronoteCalendarUrl.trim() ? 1 : 0.4 }}>
                  <Link size={14} /> {pronoteLoading ? 'Testing…' : 'Test'}
                </button>
              </div>
              {pronoteStatus && (
                <p style={{ fontSize: 13, marginTop: 8, color: pronoteStatus.startsWith('✓') ? '#6aaa64' : '#c84b4b' }}>{pronoteStatus}</p>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={back} style={btnStyle(false)}><ChevronLeft size={16} /> Back</button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={next} style={btnStyle(false)}>Skip</button>
                <button onClick={next} style={btnStyle()}>Continue <ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Generate Plan */}
        {step === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {!generating && !planResult ? (
              /* Pre-generation: profile summary + generate button */
              <>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>All set, {form.name}!</h2>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    AI will build your personalised study plan — creating tasks, scheduling your weekly routine, and setting IB milestones. Takes ~15 seconds.
                  </p>
                </div>
                <div style={{ padding: 20, borderRadius: 16, border: '1px solid var(--border)', background: 'var(--bg-overlay)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    ['Name', form.name],
                    ['Programme', `${form.ibYear} · ${form.session}`],
                    ['Subjects', `${nonCoreCount} subjects (${hlCount} HL, ${nonCoreCount - hlCount} SL)`],
                    form.goals.length > 0 ? ['Goals', form.goals.slice(0, 2).join(', ') + (form.goals.length > 2 ? '…' : '')] : null,
                    form.universityTargets.length > 0 ? ['Target unis', form.universityTargets.slice(0, 2).join(', ')] : null,
                  ].filter(Boolean).map(([k, v]) => (
                    <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{k as string}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v as string}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={back} style={btnStyle(false)}><ChevronLeft size={16} /> Back</button>
                  <button onClick={finish} style={btnStyle()}>
                    <Sparkles size={15} /> Generate my plan
                  </button>
                </div>
              </>
            ) : generating ? (
              /* Generating state */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, padding: '16px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-warm-bg)', border: '2px solid var(--accent-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={28} style={{ color: 'var(--accent-warm)' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Building your plan…</h2>
                  <p style={{ fontSize: 14, color: 'var(--accent-warm)', fontWeight: 500 }}>{genPhase}</p>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="waveform-bar" style={{ height: 18, animationDelay: `${i * 0.12}s` }} />
                  ))}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                  Claude is analysing your {form.subjects.length} subjects and building a realistic {form.session} exam schedule
                </p>
              </div>
            ) : planResult ? (
              /* Success state */
              <>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Your plan is live!</h2>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{planResult.summary}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ padding: '16px 20px', borderRadius: 14, border: '1px solid var(--border)', background: 'var(--bg-overlay)', textAlign: 'center' }}>
                    <ListChecks size={20} style={{ color: 'var(--accent-warm)', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{planResult.taskCount}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>tasks & milestones added</p>
                  </div>
                  <div style={{ padding: '16px 20px', borderRadius: 14, border: '1px solid var(--border)', background: 'var(--bg-overlay)', textAlign: 'center' }}>
                    <CalendarDays size={20} style={{ color: '#8B9FC0', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{planResult.routineCount}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>weekly study sessions</p>
                  </div>
                </div>

                <button onClick={() => setOnboardingDone(true)} style={btnStyle()}>
                  Start studying 🚀
                </button>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
