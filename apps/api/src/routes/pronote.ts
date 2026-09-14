import { Router, type Request, type Response } from 'express'

export const pronoteRouter = Router()

interface CalEvent {
  id: string
  title: string
  start: string | null
  end: string | null
  location: string
  description: string
  category: string
}

function parseIcalDate(value: string): string | null {
  if (!value) return null
  const clean = value.replace(/[Z]/g, '')
  const dt = clean.replace('T', '')
  if (dt.length === 8) {
    return `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}T00:00:00`
  }
  if (dt.length >= 14) {
    return `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}T${dt.slice(8, 10)}:${dt.slice(10, 12)}:${dt.slice(12, 14)}`
  }
  return null
}

function unfoldIcal(raw: string): string {
  return raw.replace(/\r\n[ \t]/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

function parseIcal(raw: string): CalEvent[] {
  const ical = unfoldIcal(raw)
  const events: CalEvent[] = []
  const blocks = ical.split('BEGIN:VEVENT').slice(1)

  for (const block of blocks) {
    const get = (key: string): string => {
      const regex = new RegExp(`^${key}(?:;[^:]*)?:(.*)$`, 'im')
      const match = block.match(regex)
      if (!match) return ''
      return match[1]
        .replace(/\\n/g, ' ')
        .replace(/\\N/g, ' ')
        .replace(/\\,/g, ',')
        .replace(/\\;/g, ';')
        .trim()
    }

    const title = get('SUMMARY')
    if (!title) continue

    events.push({
      id: crypto.randomUUID(),
      title,
      start: parseIcalDate(get('DTSTART')),
      end: parseIcalDate(get('DTEND')),
      location: get('LOCATION'),
      description: get('DESCRIPTION'),
      category: get('CATEGORIES'),
    })
  }

  // Sort by start time, upcoming first
  return events.sort((a, b) => {
    if (!a.start) return 1
    if (!b.start) return -1
    return new Date(a.start).getTime() - new Date(b.start).getTime()
  })
}

pronoteRouter.post('/ical', async (req: Request, res: Response) => {
  const { url } = req.body as { url?: string }
  if (!url?.trim()) {
    return res.status(400).json({ error: 'url is required' })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12000)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'StudyOS/1.0 (Calendar Sync)',
        'Accept': 'text/calendar, */*',
      },
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return res.status(502).json({ error: `Calendar server returned ${response.status}` })
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('calendar') && !contentType.includes('text') && !url.endsWith('.ics')) {
      return res.status(400).json({ error: 'URL does not appear to be an iCal feed' })
    }

    const ical = await response.text()
    if (!ical.includes('BEGIN:VCALENDAR')) {
      return res.status(400).json({ error: 'Response is not a valid iCal file' })
    }

    const events = parseIcal(ical)
    return res.json({ events, count: events.length })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg.includes('abort') || msg.includes('timeout')) {
      return res.status(504).json({ error: 'Calendar request timed out' })
    }
    return res.status(500).json({ error: `Failed to fetch calendar: ${msg}` })
  }
})
