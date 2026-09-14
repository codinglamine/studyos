import { useAppStore } from '@/store/useAppStore'

export function XPPopups() {
  const xpEvents = useAppStore((s) => s.xpEvents)

  return (
    <>
      {xpEvents.map((e) => (
        <div
          key={e.id}
          className="xp-popup"
          style={{ left: e.x, top: e.y }}
        >
          +{e.amount} XP
        </div>
      ))}
    </>
  )
}
