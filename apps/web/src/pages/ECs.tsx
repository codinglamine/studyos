import { useState } from 'react'
import { Plus, Dumbbell, Music, BookOpen, Globe, Heart, Trophy } from 'lucide-react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassPill } from '@/components/glass/GlassPill'
import { useAppStore } from '@/store/useAppStore'

interface EC { id: string; name: string; category: string; hours_per_week: number; role: string; description: string }
interface Workout { id: string; date: string; type: string; duration_minutes: number; mood_after: number }

const EC_ICONS: Record<string, React.ElementType> = { Sport: Dumbbell, Music, Academic: BookOpen, Community: Globe, Volunteering: Heart, Leadership: Trophy }
const WORKOUT_TYPES = ['🏃 Run','🏋️ Gym','🏊 Swim','⚽ Sport','🧘 Yoga','🚴 Cycle']
const MOODS = ['😩','😐','🙂','😊','🔥']

const modalStyle: React.CSSProperties = { background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:18, boxShadow:'var(--shadow-md)' }
const inputStyle: React.CSSProperties = { width:'100%', padding:'10px 14px', fontSize:14, background:'var(--bg-base)', border:'1px solid var(--border)', borderRadius:10, color:'var(--text-primary)', outline:'none', fontFamily:'inherit' }

export function ECs() {
  const [ecs, setEcs] = useState<EC[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [tab, setTab] = useState<'ecs'|'workout'>('ecs')
  const [addEcOpen, setAddEcOpen] = useState(false)
  const [addWorkoutOpen, setAddWorkoutOpen] = useState(false)
  const { addXP } = useAppStore()

  const [ecForm, setEcForm] = useState({ name:'', category:'Sport', hours_per_week:3, role:'', description:'' })
  const [wForm, setWForm] = useState({ type:'🏃 Run', duration_minutes:30, mood_after:3, date:new Date().toISOString().slice(0,10) })

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)' }}>ECs & Activities</h1>
        <button onClick={() => tab==='ecs' ? setAddEcOpen(true) : setAddWorkoutOpen(true)}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:10, border:'none', background:'var(--accent)', color:'var(--bg-surface)', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
          <Plus size={14} /> Add {tab==='ecs'?'EC':'workout'}
        </button>
      </div>

      <div style={{ display:'flex', borderRadius:10, border:'1px solid var(--border)', overflow:'hidden', width:'fit-content' }}>
        {(['ecs','workout'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'8px 18px', fontSize:13, fontWeight:500, border:'none', cursor:'pointer', fontFamily:'inherit',
            background: tab===t ? 'var(--accent)' : 'transparent',
            color: tab===t ? 'var(--bg-surface)' : 'var(--text-muted)',
            transition:'background 120ms ease, color 120ms ease',
          }}>
            {t==='ecs'?'Extracurriculars':'Workouts'}
          </button>
        ))}
      </div>

      {tab==='ecs' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {ecs.length===0 ? (
            <GlassCard style={{ gridColumn:'1/-1', padding:48, textAlign:'center' }} noHover>
              <p style={{ fontSize:14, color:'var(--text-muted)' }}>No ECs yet — add your first activity!</p>
            </GlassCard>
          ) : ecs.map((ec) => {
            const Icon = EC_ICONS[ec.category] ?? Trophy
            return (
              <GlassCard key={ec.id} style={{ padding:20, display:'flex', flexDirection:'column', gap:12 }} noHover>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon size={16} style={{ color:'var(--text-secondary)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{ec.name}</p>
                    <p style={{ fontSize:12, color:'var(--text-muted)' }}>{ec.role}</p>
                  </div>
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  <GlassPill>{ec.category}</GlassPill>
                  <GlassPill>{ec.hours_per_week}h/wk</GlassPill>
                </div>
                {ec.description && <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.5 }}>{ec.description}</p>}
              </GlassCard>
            )
          })}
        </div>
      )}

      {tab==='workout' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {workouts.length===0 ? (
            <GlassCard style={{ padding:48, textAlign:'center' }} noHover>
              <p style={{ fontSize:14, color:'var(--text-muted)' }}>No workouts yet — log your first session!</p>
            </GlassCard>
          ) : workouts.map((w) => (
            <GlassCard key={w.id} style={{ padding:16, display:'flex', alignItems:'center', gap:16 }} noHover>
              <span style={{ fontSize:28 }}>{w.type.split(' ')[0]}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:500, color:'var(--text-primary)' }}>{w.type.slice(2)}</p>
                <p style={{ fontSize:12, color:'var(--text-muted)' }}>{w.date} · {w.duration_minutes} min</p>
              </div>
              <span style={{ fontSize:22 }}>{MOODS[w.mood_after-1]}</span>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Add EC modal */}
      {addEcOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)' }} onClick={() => setAddEcOpen(false)} />
          <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:420, padding:28, display:'flex', flexDirection:'column', gap:14, ...modalStyle }}>
            <h2 style={{ fontSize:16, fontWeight:600, color:'var(--text-primary)' }}>Add Extracurricular</h2>
            <input value={ecForm.name} onChange={(e) => setEcForm((f) => ({...f, name:e.target.value}))} placeholder="Activity name" style={inputStyle} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <select value={ecForm.category} onChange={(e) => setEcForm((f) => ({...f, category:e.target.value}))} style={{ ...inputStyle, appearance:'none' }}>
                {Object.keys(EC_ICONS).map((c) => <option key={c}>{c}</option>)}
              </select>
              <input type="number" value={ecForm.hours_per_week} onChange={(e) => setEcForm((f) => ({...f, hours_per_week:parseInt(e.target.value)||1}))} placeholder="h/week" style={inputStyle} min={1} />
            </div>
            <input value={ecForm.role} onChange={(e) => setEcForm((f) => ({...f, role:e.target.value}))} placeholder="Role (e.g. Captain)" style={inputStyle} />
            <textarea value={ecForm.description} onChange={(e) => setEcForm((f) => ({...f, description:e.target.value}))} placeholder="Description (max 150 chars)" maxLength={150} style={{ ...inputStyle, minHeight:70, resize:'none' }} />
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setAddEcOpen(false)} style={{ flex:1, padding:'10px', borderRadius:10, border:'1px solid var(--border)', background:'transparent', color:'var(--text-muted)', cursor:'pointer', fontSize:14, fontFamily:'inherit' }}>Cancel</button>
              <button onClick={() => { setEcs((e) => [...e, {...ecForm, id:crypto.randomUUID()}]); addXP(10,'EC logged!'); setAddEcOpen(false) }}
                disabled={!ecForm.name}
                style={{ flex:1, padding:'10px', borderRadius:10, border:'none', background:'var(--accent)', color:'var(--bg-surface)', cursor:'pointer', fontSize:14, fontWeight:600, fontFamily:'inherit', opacity:ecForm.name?1:0.35 }}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Workout modal */}
      {addWorkoutOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)' }} onClick={() => setAddWorkoutOpen(false)} />
          <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:380, padding:28, display:'flex', flexDirection:'column', gap:16, ...modalStyle }}>
            <h2 style={{ fontSize:16, fontWeight:600, color:'var(--text-primary)' }}>Log Workout</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {WORKOUT_TYPES.map((t) => (
                <button key={t} onClick={() => setWForm((f) => ({...f, type:t}))} style={{
                  padding:'8px 4px', borderRadius:10, fontSize:13, border:'1px solid var(--border)', cursor:'pointer', fontFamily:'inherit',
                  background: wForm.type===t ? 'var(--accent)' : 'transparent',
                  color: wForm.type===t ? 'var(--bg-surface)' : 'var(--text-secondary)',
                  transition:'background 120ms ease',
                }}>
                  {t}
                </button>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <input type="number" value={wForm.duration_minutes} onChange={(e) => setWForm((f) => ({...f, duration_minutes:parseInt(e.target.value)||30}))} placeholder="Minutes" style={inputStyle} min={1} />
              <input type="date" value={wForm.date} onChange={(e) => setWForm((f) => ({...f, date:e.target.value}))} style={inputStyle} />
            </div>
            <div>
              <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:10 }}>Mood after</p>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                {MOODS.map((m, i) => (
                  <button key={i} onClick={() => setWForm((f) => ({...f, mood_after:i+1}))} style={{
                    fontSize:26, background:'none', border:'none', cursor:'pointer', padding:4,
                    opacity: wForm.mood_after===i+1 ? 1 : 0.4,
                    transform: wForm.mood_after===i+1 ? 'scale(1.3)' : 'scale(1)',
                    transition:'opacity 120ms ease, transform 120ms ease',
                  }}>{m}</button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setAddWorkoutOpen(false)} style={{ flex:1, padding:'10px', borderRadius:10, border:'1px solid var(--border)', background:'transparent', color:'var(--text-muted)', cursor:'pointer', fontSize:14, fontFamily:'inherit' }}>Cancel</button>
              <button onClick={() => { setWorkouts((w) => [...w, {...wForm, id:crypto.randomUUID()}]); addXP(12,'Workout logged!'); setAddWorkoutOpen(false) }}
                style={{ flex:1, padding:'10px', borderRadius:10, border:'none', background:'var(--accent)', color:'var(--bg-surface)', cursor:'pointer', fontSize:14, fontWeight:600, fontFamily:'inherit' }}>
                Log +12 XP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
