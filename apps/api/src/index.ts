import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { aiRouter } from './routes/ai.ts'
import { pronoteRouter } from './routes/pronote.ts'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }))
app.use(express.json({ limit: '20mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/ai', aiRouter)
app.use('/api/pronote', pronoteRouter)

app.listen(PORT, () => {
  console.log(`StudyOS API running on http://localhost:${PORT}`)
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠  ANTHROPIC_API_KEY not set — AI features will not work')
  }
})
