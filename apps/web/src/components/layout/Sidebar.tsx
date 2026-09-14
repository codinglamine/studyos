import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, CheckSquare, CalendarDays, BrainCircuit,
  BarChart3, Trophy, ShoppingBag, Timer, Settings2,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { getLevelFromXP } from '@/lib/utils'
import { cn } from '@/lib/utils'

const NAV = [
  { path: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tasks',    icon: CheckSquare,     label: 'Tasks'     },
  { path: '/calendar', icon: CalendarDays,    label: 'Calendar'  },
  { path: '/ai',       icon: BrainCircuit,    label: 'AI Study'  },
  { path: '/grades',   icon: BarChart3,       label: 'Grades'    },
  { path: '/ecs',      icon: Trophy,          label: 'ECs'       },
  { path: '/store',    icon: ShoppingBag,     label: 'Store'     },
  { path: '/time',     icon: Timer,           label: 'Time'      },
  { path: '/settings', icon: Settings2,       label: 'Settings'  },
]

export function Sidebar() {
  const { sidebarExpanded, setSidebarExpanded, xp } = useAppStore()
  const location = useLocation()
  const { level, progress } = getLevelFromXP(xp)
  const w = sidebarExpanded ? 220 : 64

  return (
    <aside
      style={{
        width: w,
        transition: 'width 180ms ease',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        position: 'fixed', left: 0, top: 0, height: '100%', zIndex: 50,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
      onMouseEnter={() => setSidebarExpanded(true)}
      onMouseLeave={() => setSidebarExpanded(false)}
    >
      {/* Logo */}
      <div style={{ height: 60, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: 'var(--bg-surface)', fontWeight: 700, fontSize: 14 }}>S</span>
        </div>
        <span style={{
          fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', whiteSpace: 'nowrap',
          opacity: sidebarExpanded ? 1 : 0, transition: 'opacity 150ms ease',
        }}>
          StudyOS
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
        {NAV.map(({ path, icon: Icon, label }) => {
          const active = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
          return (
            <Link
              key={path}
              to={path}
              className="group"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '9px 10px', borderRadius: 10,
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? 'var(--bg-surface)' : 'var(--text-muted)',
                textDecoration: 'none',
                transition: 'background 120ms ease, color 120ms ease',
                position: 'relative', whiteSpace: 'nowrap', overflow: 'hidden',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-surface-hover)'; if (!active) e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; if (!active) e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} style={{ flexShrink: 0 }} />
              <span style={{
                fontSize: 13, fontWeight: 500,
                opacity: sidebarExpanded ? 1 : 0,
                transition: 'opacity 150ms ease',
              }}>
                {label}
              </span>
              {/* Tooltip */}
              {!sidebarExpanded && (
                <span style={{
                  position: 'absolute', left: '100%', marginLeft: 8,
                  padding: '4px 8px', borderRadius: 7,
                  background: 'var(--accent)', color: 'var(--bg-surface)',
                  fontSize: 12, fontWeight: 500,
                  pointerEvents: 'none', opacity: 0, whiteSpace: 'nowrap',
                  transition: 'opacity 100ms ease',
                }}
                  className="group-hover:!opacity-100"
                >
                  {label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-surface)', fontSize: 13, fontWeight: 700 }}>
              A
            </div>
            <svg style={{ position: 'absolute', top: -4, left: -4, width: 40, height: 40 }} viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="none" stroke="var(--border)" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="18" fill="none" stroke="var(--accent-warm)"
                strokeWidth="1.5"
                strokeDasharray={`${progress * 113.1} 113.1`}
                strokeLinecap="round"
                transform="rotate(-90 20 20)"
                style={{ transition: 'stroke-dasharray 0.4s ease' }}
              />
            </svg>
          </div>
          <div style={{ opacity: sidebarExpanded ? 1 : 0, transition: 'opacity 150ms ease', overflow: 'hidden' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 3 }}>Student</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Level {level} · {xp} XP</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
