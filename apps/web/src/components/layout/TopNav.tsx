import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, CheckSquare, Calendar, Sparkles,
  BarChart2, Dumbbell, ShoppingBag, Timer, Settings,
  GraduationCap, Flame, BookOpen,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { getLevelFromXP } from '@/lib/utils'

const NAV = [
  { path: '/',         label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tasks',    label: 'Tasks',     icon: CheckSquare },
  { path: '/calendar', label: 'Calendar',  icon: Calendar },
  { path: '/ai',       label: 'AI Tutor',  icon: Sparkles },
  { path: '/grades',   label: 'Grades',    icon: BarChart2 },
  { path: '/ib-work',  label: 'IB Work',   icon: BookOpen },
  { path: '/ecs',      label: 'ECs',       icon: Dumbbell },
  { path: '/store',    label: 'Store',     icon: ShoppingBag },
  { path: '/time',     label: 'Time',      icon: Timer },
  { path: '/settings', label: 'Settings',  icon: Settings },
]

export function TopNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { xp, streak, userProfile } = useAppStore()
  const { level, progress } = getLevelFromXP(xp)
  const r = 10; const circ = 2 * Math.PI * r
  const name = userProfile?.name ?? 'Student'
  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <nav className="glass-nav" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 56,
      display: 'flex', alignItems: 'center',
      padding: '0 20px',
      gap: 4,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 12, flexShrink: 0 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9, background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <GraduationCap size={16} style={{ color: 'var(--bg-surface)' }} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          StudyOS
        </span>
      </div>

      {/* Tabs — scrollable */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {NAV.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 10, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                fontSize: 13, fontWeight: active ? 600 : 400,
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? 'var(--bg-surface)' : 'var(--text-muted)',
                transition: 'background 120ms ease, color 120ms ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'var(--bg-overlay)'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' } }}
            >
              <Icon size={14} />
              {label}
            </button>
          )
        })}
      </div>

      {/* Right: streak + XP ring + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 999,
          border: '1px solid var(--border)', background: 'var(--bg-overlay)',
          fontSize: 12,
        }}>
          <Flame size={12} style={{ color: 'var(--accent-warm)' }} />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{streak}</span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          border: '1px solid var(--border)', background: 'var(--bg-overlay)',
          fontSize: 12,
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22">
            <circle cx="11" cy="11" r={r} fill="none" stroke="var(--border)" strokeWidth="2" />
            <circle cx="11" cy="11" r={r} fill="none" stroke="var(--accent-warm)"
              strokeWidth="2"
              strokeDasharray={`${progress * circ} ${circ}`}
              strokeLinecap="round"
              transform="rotate(-90 11 11)"
              style={{ transition: 'stroke-dasharray 0.4s ease' }}
            />
            <text x="11" y="15" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--accent-warm)" fontFamily="Inter">{level}</text>
          </svg>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{xp.toLocaleString()} XP</span>
        </div>

        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--accent)', color: 'var(--bg-surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          border: '2px solid var(--glass-border)',
        }}
          onClick={() => navigate('/settings')}
          title={name}
        >
          {initials}
        </div>
      </div>
    </nav>
  )
}
