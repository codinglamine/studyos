import { Bell } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { getLevelFromXP, formatXP } from '@/lib/utils'

export function Header() {
  const { xp, streak, sidebarExpanded } = useAppStore()
  const { level, progress } = getLevelFromXP(xp)

  return (
    <header style={{
      position: 'fixed', top: 0, right: 0, zIndex: 40,
      left: sidebarExpanded ? 220 : 64,
      height: 60,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      padding: '0 32px', gap: 10,
      transition: 'left 180ms ease',
    }}>
      {/* Streak */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 16px', borderRadius: 999,
        border: '1px solid var(--border)',
        background: 'var(--bg-base)',
        fontSize: 13,
      }}>
        <span className={streak > 7 ? 'streak-flame' : ''} style={{ fontSize: 16 }}>🔥</span>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{streak}</span>
        <span style={{ color: 'var(--text-muted)' }}>day streak</span>
      </div>

      {/* XP */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 16px', borderRadius: 999,
        border: '1px solid var(--border)',
        background: 'var(--bg-base)',
        fontSize: 13,
      }}>
        <svg width="26" height="26" viewBox="0 0 26 26">
          <circle cx="13" cy="13" r="11" fill="none" stroke="var(--border)" strokeWidth="2" />
          <circle cx="13" cy="13" r="11" fill="none" stroke="var(--accent-warm)"
            strokeWidth="2"
            strokeDasharray={`${progress * 69.1} 69.1`}
            strokeLinecap="round"
            transform="rotate(-90 13 13)"
            style={{ transition: 'stroke-dasharray 0.4s ease' }}
          />
          <text x="13" y="17" textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--accent-warm)" fontFamily="Inter">{level}</text>
        </svg>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatXP(xp)} XP</span>
      </div>

      {/* Bell */}
      <button style={{
        width: 38, height: 38, borderRadius: 999,
        border: '1px solid var(--border)', background: 'var(--bg-base)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', position: 'relative',
        transition: 'background 120ms ease',
      }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-base)')}
      >
        <Bell size={16} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
        <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, background: 'var(--accent-warm)', borderRadius: '50%' }} />
      </button>
    </header>
  )
}
