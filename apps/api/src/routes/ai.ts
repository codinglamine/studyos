import { Router, type Request, type Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'

export const aiRouter = Router()

const getClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

const CHAT_SYSTEM = `You are a focused academic assistant for a secondary school student using StudyOS.
Respond only to questions about: studying, homework, IB requirements, school subjects, career planning, and university applications.
Be concise, encouraging, and student-friendly. Use bullet points when listing steps or items.
If asked about anything outside academic topics, politely decline and redirect to study-related help.`

const EXPLAIN_SYSTEM = `You are an expert tutor. When given study material, produce a structured explanation with:
1. Key Concepts (3-5 bullet points)
2. Important Definitions
3. Worked Examples (where applicable)
4. Common Mistakes to Avoid
5. Quick Summary

Be thorough but readable. Use markdown formatting. Match the difficulty level requested.`

const QUIZ_SYSTEM = `You are a test generator. Given study material, create a practice test in valid JSON array format.
Each question object must have these exact fields:
- id: sequential string number ("0","1","2"...)
- question: string
- type: "mcq" | "short" | "truefalse"
- options: string[] (only for mcq, exactly 4 options)
- answer: string (for mcq: exact text of correct option; for truefalse: "True" or "False"; for short: key phrase)
- explanation: string (brief explanation of the correct answer)

Generate 5-8 questions of mixed types. Return ONLY the JSON array, no other text.`

function streamSSE(res: Response, stream: AsyncIterable<Anthropic.RawMessageStreamEvent>) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  return (async () => {
    try {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          res.write(`data: ${JSON.stringify({ delta: { text: event.delta.text } })}\n\n`)
        }
      }
      res.write('data: [DONE]\n\n')
    } catch (err) {
      res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`)
    } finally {
      res.end()
    }
  })()
}

aiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body as { messages: { role: 'user' | 'assistant'; content: string }[] }
    if (!messages?.length) return res.status(400).json({ error: 'messages required' })

    const client = getClient()
    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: CHAT_SYSTEM,
      messages: messages.slice(-20),
    })

    return streamSSE(res, stream)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (!res.headersSent) res.status(500).json({ error: msg })
  }
})

aiRouter.post('/explain', async (req: Request, res: Response) => {
  try {
    const { content, subject, difficulty } = req.body as { content: string; subject?: string; difficulty?: string }
    if (!content?.trim()) return res.status(400).json({ error: 'content required' })

    const client = getClient()
    const prompt = `Subject: ${subject || 'General'}\nDifficulty: ${difficulty || 'Standard'}\n\nContent to explain:\n${content.slice(0, 8000)}`

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: EXPLAIN_SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    })

    return streamSSE(res, stream)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (!res.headersSent) res.status(500).json({ error: msg })
  }
})

aiRouter.post('/quiz', async (req: Request, res: Response) => {
  try {
    const { content, subject, difficulty } = req.body as { content: string; subject?: string; difficulty?: string }
    if (!content?.trim()) return res.status(400).json({ error: 'content required' })

    const client = getClient()
    const prompt = `Subject: ${subject || 'General'}\nDifficulty: ${difficulty || 'Standard'}\n\nGenerate a practice test from this content:\n${content.slice(0, 6000)}`

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: QUIZ_SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    })

    return streamSSE(res, stream)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (!res.headersSent) res.status(500).json({ error: msg })
  }
})

aiRouter.post('/vision', async (req: Request, res: Response) => {
  try {
    const { imageData, mediaType, question, subject } = req.body as {
      imageData: string; mediaType: string; question?: string; subject?: string
    }
    if (!imageData) return res.status(400).json({ error: 'imageData required' })

    const client = getClient()
    const base64 = imageData.includes(',') ? imageData.split(',')[1] : imageData
    const mimeType = (mediaType || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
    const userQuestion = question?.trim() || `Analyse this ${subject ? subject + ' ' : ''}study material and explain it clearly for an IB student. Identify key concepts, formulas, or ideas.`

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: EXPLAIN_SYSTEM,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
          { type: 'text', text: userQuestion },
        ],
      }],
    })

    return streamSSE(res, stream)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (!res.headersSent) res.status(500).json({ error: msg })
  }
})

aiRouter.post('/plan', async (req: Request, res: Response) => {
  try {
    const { profile } = req.body as { profile: Record<string, unknown> }
    if (!profile) return res.status(400).json({ error: 'profile required' })
    const client = getClient()

    const prompt = `Create a personalised IB study plan for this student:
Name: ${profile.name}
Age: ${profile.age}
School: ${profile.school}
IB Year: ${profile.ibYear}
Exam Session: ${profile.session}
Subjects: ${(profile.subjects as string[]).join(', ')}
Goals: ${(profile.goals as string[]).join(', ')}
Target Universities: ${(profile.universityTargets as string[]).join(', ')}

Create a structured, encouraging study plan with:
1. Weekly study schedule by subject (with hours)
2. Key IB deadlines to remember (IAs, EE, TOK, exams)
3. Personalised advice for their subject combination
4. University application timeline
5. 3 quick wins they can do this week

Be specific, motivating, and formatted in clear markdown.`

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: 'You are an expert IB academic advisor creating personalised study plans. Be warm, specific, and action-oriented.',
      messages: [{ role: 'user', content: prompt }],
    })

    return streamSSE(res, stream)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (!res.headersSent) res.status(500).json({ error: msg })
  }
})

aiRouter.post('/plan-structured', async (req: Request, res: Response) => {
  try {
    const { profile, today } = req.body as { profile: Record<string, unknown>; today: string }
    if (!profile) return res.status(400).json({ error: 'profile required' })
    const client = getClient()

    const subjects = (profile.subjects as string[]) || []
    const hlSubjects = subjects.filter((s: string) => s.endsWith(' HL'))
    const slSubjects = subjects.filter((s: string) => s.endsWith(' SL'))
    const session = profile.session as string || 'May 2027'
    const ibYear = profile.ibYear as string || 'DP2'
    const goals = (profile.goals as string[]) || []
    const unis = (profile.universityTargets as string[]) || []

    const prompt = `You are creating a personalized IB study plan for ${profile.name}, a ${ibYear} student at ${profile.school}.
Today's date: ${today || new Date().toISOString().slice(0, 10)}
Exam session: ${session}
Subjects: ${subjects.join(', ')}
HL subjects (harder, 240h each): ${hlSubjects.join(', ')}
SL subjects: ${slSubjects.join(', ')}
Goals: ${goals.join(', ')}
Target universities: ${unis.join(', ')}

Generate a comprehensive, realistic IB study plan. Return ONLY valid JSON with this exact structure (no markdown, no code fences, just raw JSON):
{
  "summary": "2-3 sentence personalized overview of their plan and what makes it suited to them",
  "weeklyRoutine": [
    {
      "dayOfWeek": 1,
      "startHour": 16,
      "durationMinutes": 60,
      "subject": "Biology HL",
      "activity": "Past papers & active recall",
      "color": "#8B9FC0"
    }
  ],
  "tasks": [
    {
      "title": "Biology HL: Read Chapter 6 – Ecology",
      "subject": "Biology HL",
      "type": "Homework",
      "due_date": "2026-07-10",
      "priority": "Medium",
      "estimated_minutes": 60,
      "notes": "Focus on food chains and ecosystem diagrams"
    }
  ]
}

Rules for weeklyRoutine (generate 10-14 blocks):
- dayOfWeek: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
- Prioritize HL subjects with more sessions (2-3 per week each)
- SL subjects get 1-2 sessions per week
- Evening study: startHour 16-20
- No sessions on Sunday unless requested
- durationMinutes: 45-90
- color: use distinct colors per subject group (sciences=blue, humanities=purple, languages=green, math=teal, arts=pink)
- activity: be specific (e.g. "Past paper practice", "Flashcard review", "Essay planning", "Lab report writing")

Rules for tasks (generate 18-25 tasks):
- Spread across the next 4 months after today
- Include IA milestones for each HL/SL subject (research, outline, draft 1, draft 2, final)
- Include EE milestones if EE/Extended Essay is in subjects
- Include TOK essay/exhibition milestones if TOK is in subjects
- Include regular revision sessions for upcoming chapters/units
- Include practice exam sessions (1-2 per month)
- Priority: Urgent for things due <2 weeks, High for IAs/EE, Medium for regular work, Low for enrichment
- due_date: YYYY-MM-DD format, all dates AFTER today
- type must be one of: "Homework" | "Test" | "Project" | "IB" | "EC" | "Personal"
- estimated_minutes: realistic (30-240)
- notes: helpful specific guidance for each task`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: 'You are an expert IB academic planner. Output ONLY valid raw JSON — no markdown code fences, no explanation, no extra text. The response must be parseable by JSON.parse().',
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : '{}'
    // Strip markdown code fences if model added them anyway
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()

    let plan: Record<string, unknown>
    try {
      plan = JSON.parse(cleaned)
    } catch {
      return res.status(500).json({ error: 'Plan generation failed — could not parse AI response', raw: cleaned.slice(0, 200) })
    }

    res.json(plan)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (!res.headersSent) res.status(500).json({ error: msg })
  }
})

aiRouter.post('/advisor', async (req: Request, res: Response) => {
  try {
    const { grades, subjects, careerGoal, universities } = req.body
    const client = getClient()

    const prompt = `Student Profile:
Career goal: ${careerGoal || 'Not specified'}
Target universities: ${(universities || []).join(', ') || 'Not specified'}
Subjects and performance:
${JSON.stringify(grades, null, 2)}

Provide:
1. Strengths (2-3 bullet points)
2. Areas for Improvement (2-3 bullet points)
3. Recommended Specialisation
4. Action Plan (3-5 concrete steps)
5. University Fit assessment

Be specific, actionable, and encouraging.`

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: 'You are an IB academic advisor helping a student optimise their university application profile.',
      messages: [{ role: 'user', content: prompt }],
    })

    return streamSSE(res, stream)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (!res.headersSent) res.status(500).json({ error: msg })
  }
})
