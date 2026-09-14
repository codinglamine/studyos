import { useState, useRef, useEffect } from 'react'
import { GraduationCap, X, Send } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

interface Message { id: string; role: 'user' | 'assistant'; content: string }

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 14 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="waveform-bar" style={{ height: 12, animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  )
}

export function FloatingChat() {
  const { chatOpen, setChatOpen } = useAppStore()
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: 'Hi! Ask me anything about your studies, IB requirements, or university applications.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') setChatOpen(!chatOpen) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [chatOpen, setChatOpen])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })) }),
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      const aiMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '' }
      setMessages((m) => [...m, aiMsg])
      setLoading(false)
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          for (const line of decoder.decode(value).split('\n').filter((l) => l.startsWith('data: '))) {
            const d = line.slice(6)
            if (d === '[DONE]') break
            try { aiMsg.content += JSON.parse(d).delta?.text ?? ''; setMessages((m) => m.map((msg) => msg.id === aiMsg.id ? { ...aiMsg } : msg)) } catch {}
          }
        }
      }
    } catch {
      setLoading(false)
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'assistant', content: 'Connection error — is the backend running?' }])
    }
  }

  const btn: React.CSSProperties = {
    position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
    width: 48, height: 48, borderRadius: '50%', border: 'none',
    background: 'var(--accent)', color: 'var(--bg-surface)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  }

  const panel: React.CSSProperties = {
    position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
    width: 340, height: 480,
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 20, boxShadow: 'var(--shadow-md)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  }

  if (!chatOpen) {
    return (
      <button className="fab-pulse" style={btn} onClick={() => setChatOpen(true)} title="AI Assistant (Ctrl+Shift+A)">
        <GraduationCap size={20} />
      </button>
    )
  }

  return (
    <div style={panel}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={15} style={{ color: 'var(--bg-surface)' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>StudyOS AI</span>
          {loading && <TypingDots />}
        </div>
        <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '82%', padding: '10px 14px', fontSize: 14, lineHeight: 1.5,
              background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-base)',
              color: msg.role === 'user' ? 'var(--bg-surface)' : 'var(--text-primary)',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
              border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex' }}>
            <div style={{ padding: '10px 14px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '4px 16px 16px 16px' }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0 }}>
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about your studies…"
          style={{ flex: 1, padding: '9px 14px', fontSize: 13, background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }}
        />
        <button onClick={send} disabled={!input.trim() || loading} style={{
          width: 36, height: 36, borderRadius: 10, border: 'none',
          background: 'var(--accent)', color: 'var(--bg-surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', opacity: input.trim() && !loading ? 1 : 0.35,
          transition: 'opacity 120ms ease',
        }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}
