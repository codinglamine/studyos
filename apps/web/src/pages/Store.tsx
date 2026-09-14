import { useState } from 'react'
import { Check } from 'lucide-react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassPill } from '@/components/glass/GlassPill'
import { useAppStore } from '@/store/useAppStore'
import { STORE_ITEMS } from '@/lib/constants'
import { formatXP } from '@/lib/utils'

export function Store() {
  const { xp } = useAppStore()
  const [purchased, setPurchased] = useState<Set<string>>(new Set())

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)' }}>Reward Store</h1>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>Spend XP on rewards</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 20px', borderRadius:999, border:'1px solid var(--border)', background:'var(--bg-base)' }}>
          <span style={{ fontSize:15, fontWeight:700, color:'var(--accent-warm)' }}>{formatXP(xp)}</span>
          <span style={{ fontSize:13, color:'var(--text-muted)' }}>XP available</span>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        {STORE_ITEMS.map((item) => {
          const canAfford = xp >= item.cost
          const owned = purchased.has(item.key)
          return (
            <GlassCard key={item.key} style={{ padding:24, display:'flex', flexDirection:'column', alignItems:'center', gap:14, textAlign:'center' }} noHover>
              <div style={{ fontSize:36, marginTop:4 }}>{item.emoji}</div>
              <div>
                <p style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', marginBottom:4 }}>{item.name}</p>
                <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.5 }}>{item.description}</p>
              </div>
              <GlassPill>{item.cost} XP</GlassPill>
              <button
                onClick={() => { if (canAfford && !owned) setPurchased((p) => new Set([...p, item.key])) }}
                disabled={!canAfford || owned}
                style={{
                  width:'100%', padding:'8px', borderRadius:10, fontSize:13, fontWeight:500, cursor: canAfford && !owned ? 'pointer' : 'not-allowed',
                  border: owned ? '1px solid rgba(100,160,100,0.4)' : canAfford ? 'none' : '1px solid var(--border)',
                  background: owned ? 'transparent' : canAfford ? 'var(--accent)' : 'transparent',
                  color: owned ? '#6aaa64' : canAfford ? 'var(--bg-surface)' : 'var(--text-muted)',
                  opacity: !canAfford && !owned ? 0.55 : 1,
                  fontFamily:'inherit', transition:'opacity 120ms ease',
                }}
              >
                {owned
                  ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}><Check size={12} /> Owned</span>
                  : canAfford ? 'Purchase' : `Need ${item.cost - xp} more XP`}
              </button>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
