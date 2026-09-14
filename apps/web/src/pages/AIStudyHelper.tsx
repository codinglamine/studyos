import { useState, useRef, useCallback } from 'react'
import { Sparkles, FileText, X, ImagePlus, Upload } from 'lucide-react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassPill } from '@/components/glass/GlassPill'
import { useAppStore } from '@/store/useAppStore'

interface QuizQuestion { id: string; question: string; type: 'mcq' | 'short' | 'truefalse'; options?: string[]; answer: string; explanation: string }

function QuizWidget({ questions, onClose }: { questions: QuizQuestion[]; onClose: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const { addXP } = useAppStore()
  const score = submitted ? questions.filter((q) => answers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim()).length : 0

  const submit = () => {
    setSubmitted(true)
    if (score / questions.length >= 0.8) addXP(30, 'Practice test passed!')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Practice Test</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {submitted && <GlassPill>{score}/{questions.length} correct</GlassPill>}
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
      </div>
      {questions.map((q, i) => {
        const correct = submitted && answers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim()
        const wrong = submitted && answers[q.id] && !correct
        return (
          <GlassCard key={q.id} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, borderColor: submitted ? correct ? 'rgba(100,160,100,0.4)' : wrong ? 'rgba(200,80,80,0.35)' : undefined : undefined }} noHover>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}><span style={{ color: 'var(--text-muted)', marginRight: 6 }}>Q{i + 1}.</span>{q.question}</p>
            {q.type === 'mcq' && q.options ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {q.options.map((o) => (
                  <button key={o} disabled={submitted} onClick={() => setAnswers((a) => ({ ...a, [q.id]: o }))} style={{
                    textAlign: 'left', padding: '10px 14px', borderRadius: 10, fontSize: 14,
                    cursor: submitted ? 'default' : 'pointer', fontFamily: 'inherit',
                    border: answers[q.id] === o ? submitted ? o.toLowerCase() === q.answer.toLowerCase() ? '1px solid rgba(100,180,100,0.5)' : '1px solid rgba(200,80,80,0.4)' : 'none' : '1px solid var(--border)',
                    background: answers[q.id] === o ? submitted ? o.toLowerCase() === q.answer.toLowerCase() ? 'rgba(100,180,100,0.1)' : 'rgba(200,80,80,0.08)' : 'var(--accent)' : 'transparent',
                    color: answers[q.id] === o && !submitted ? 'var(--bg-surface)' : 'var(--text-primary)',
                  }}>{o}</button>
                ))}
              </div>
            ) : q.type === 'truefalse' ? (
              <div style={{ display: 'flex', gap: 10 }}>
                {['True', 'False'].map((o) => (
                  <button key={o} disabled={submitted} onClick={() => setAnswers((a) => ({ ...a, [q.id]: o }))} style={{
                    flex: 1, padding: '10px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                    cursor: submitted ? 'default' : 'pointer', fontFamily: 'inherit',
                    border: answers[q.id] === o ? 'none' : '1px solid var(--border)',
                    background: answers[q.id] === o ? 'var(--accent)' : 'transparent',
                    color: answers[q.id] === o ? 'var(--bg-surface)' : 'var(--text-secondary)',
                  }}>{o}</button>
                ))}
              </div>
            ) : (
              <input disabled={submitted} value={answers[q.id] ?? ''} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                placeholder="Your answer…" style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }} />
            )}
            {submitted && (
              <p style={{ fontSize: 13, padding: '8px 12px', borderRadius: 8, background: correct ? 'rgba(100,180,100,0.1)' : 'rgba(200,80,80,0.08)', color: correct ? '#5a9e5a' : '#c84b4b' }}>
                {correct ? '✓ Correct' : `✗ Answer: ${q.answer}`}{q.explanation ? ` — ${q.explanation}` : ''}
              </p>
            )}
          </GlassCard>
        )
      })}
      {!submitted && (
        <button onClick={submit} style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: 'var(--bg-surface)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Submit answers
        </button>
      )}
    </div>
  )
}

function ImageAttachment({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
      <img src={src} alt="Attached" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
      <button onClick={onRemove} style={{
        position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%',
        background: 'var(--accent)', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-surface)',
      }}>
        <X size={11} />
      </button>
    </div>
  )
}

export function AIStudyHelper() {
  const [content, setContent] = useState('')
  const [subject, setSubject] = useState('')
  const [difficulty, setDifficulty] = useState('Standard')
  const [explanation, setExplanation] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null)
  const [mode, setMode] = useState<'explain' | 'quiz' | null>(null)
  const [attachedImages, setAttachedImages] = useState<{ dataUrl: string; mediaType: string }[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const { subjects } = useAppStore()
  const abortRef = useRef<AbortController | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', fontSize: 14, background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }

  const addImageFromFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setAttachedImages((imgs) => [...imgs, { dataUrl, mediaType: file.type }])
    }
    reader.readAsDataURL(file)
  }

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) addImageFromFile(file)
      }
    }
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    files.forEach(addImageFromFile)
  }

  const stream = async (endpoint: string) => {
    if (!content.trim() && attachedImages.length === 0) return
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    setStreaming(true); setExplanation(''); setQuiz(null)

    try {
      const isVision = attachedImages.length > 0
      const url = isVision ? '/api/ai/vision' : `/api/ai/${endpoint}`
      const body = isVision
        ? { imageData: attachedImages[0].dataUrl, mediaType: attachedImages[0].mediaType, question: content.trim() || undefined, subject }
        : { content: content.slice(0, 8000), subject, difficulty }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let full = ''
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          for (const line of decoder.decode(value).split('\n').filter((l) => l.startsWith('data: '))) {
            const d = line.slice(6)
            if (d === '[DONE]') break
            try { full += JSON.parse(d).delta?.text ?? ''; if (endpoint === 'explain' || isVision) setExplanation(full) } catch {}
          }
        }
      }
      if (endpoint === 'quiz' && !isVision) {
        try {
          const match = full.match(/\[[\s\S]*\]/)
          if (match) setQuiz(JSON.parse(match[0]).map((q: QuizQuestion, i: number) => ({ ...q, id: String(i) })))
        } catch {}
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') setExplanation('Error: could not connect to backend.')
    } finally { setStreaming(false) }
  }

  const btnStyle = (primary: boolean, disabled: boolean): React.CSSProperties => ({
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: primary ? 'none' : '1px solid var(--border)',
    background: primary ? 'var(--accent)' : 'transparent',
    color: primary ? 'var(--bg-surface)' : 'var(--text-secondary)',
    opacity: disabled ? 0.35 : 1, fontFamily: 'inherit', transition: 'opacity 120ms ease',
  })

  const hasInput = content.trim() || attachedImages.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h1 className="page-title">AI Study Helper</h1>
        <p className="page-sub">Explain, quiz, and analyse any study material — paste text, images, or screenshots</p>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Left: input panel */}
        <div style={{ flex: '0 0 56%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <GlassCard style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }} noHover>
            {/* Image drop zone + textarea */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{
                border: isDragging ? '2px dashed var(--accent-warm)' : '1px solid var(--border)',
                borderRadius: 12, transition: 'border 140ms ease',
                background: isDragging ? 'var(--accent-warm-bg)' : 'transparent',
              }}
            >
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={handlePaste}
                placeholder={attachedImages.length > 0 ? 'Add a question about the image (optional)…' : 'Paste notes, a question, or screenshot here. You can also drag & drop images.'}
                style={{ ...inputStyle, minHeight: 160, resize: 'none', border: 'none', background: 'transparent', borderRadius: 12, display: 'block' }}
              />
            </div>

            {/* Attached images */}
            {attachedImages.length > 0 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {attachedImages.map((img, i) => (
                  <ImageAttachment key={i} src={img.dataUrl} onRemove={() => setAttachedImages((a) => a.filter((_, j) => j !== i))} />
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ ...inputStyle, flex: 1, appearance: 'none' }}>
                <option value="">All subjects</option>
                {subjects.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ ...inputStyle, flex: 1, appearance: 'none' }}>
                {['Foundation', 'Standard', 'Advanced', 'IB HL'].map((d) => <option key={d}>{d}</option>)}
              </select>
              {/* Attach image button */}
              <button onClick={() => fileInputRef.current?.click()} title="Attach image"
                style={{ width: 44, height: 44, borderRadius: 12, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                <ImagePlus size={18} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                onChange={(e) => { Array.from(e.target.files ?? []).forEach(addImageFromFile); e.target.value = '' }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setMode('explain'); stream('explain') }} disabled={!hasInput || streaming} style={btnStyle(true, !hasInput || streaming)}>
                <Sparkles size={15} /> {attachedImages.length > 0 ? 'Analyse image' : 'Explain'}
              </button>
              <button onClick={() => { setMode('quiz'); stream('quiz') }} disabled={!content.trim() || streaming} style={btnStyle(false, !content.trim() || streaming)}>
                <FileText size={15} /> Generate test
              </button>
            </div>

            {streaming && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 14 }}>
                  {[0, 1, 2].map((i) => <div key={i} className="waveform-bar" style={{ height: 12, animationDelay: `${i * 0.15}s` }} />)}
                </div>
                Generating…
              </div>
            )}
          </GlassCard>

          {/* Paste tip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, border: '1px dashed var(--border)', color: 'var(--text-muted)', fontSize: 13 }}>
            <Upload size={14} style={{ flexShrink: 0 }} />
            <span>Tip: Ctrl+V to paste a screenshot directly • Drag & drop images • Supports JPEG, PNG, WebP, GIF</span>
          </div>
        </div>

        {/* Right: output panel */}
        <div style={{ flex: '1 1 0%', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          {explanation && (mode === 'explain' || attachedImages.length > 0) && (
            <GlassCard className="fade-in" style={{ padding: 24 }} noHover>
              <pre style={{ fontFamily: 'inherit', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.75, fontSize: 14 }}>{explanation}</pre>
            </GlassCard>
          )}
          {quiz && mode === 'quiz' && (
            <div className="fade-in">
              <QuizWidget questions={quiz} onClose={() => setQuiz(null)} />
            </div>
          )}
          {!explanation && !quiz && (
            <>
              <GlassCard style={{ padding: 24 }} noHover>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Study history</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Your AI explanations and quizzes will appear here.</p>
              </GlassCard>
              <GlassCard style={{ padding: 24 }} noHover>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Weak topics</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Gaps identified from practice tests will be tracked here.</p>
              </GlassCard>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
