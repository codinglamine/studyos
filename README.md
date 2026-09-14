# StudyOS

A study and productivity application for the IB Diploma Programme: assignments, grades,
the IB core (EE, TOK, CAS), extracurriculars, time tracking and an AI study helper, in one
place.

I built it because the things an IB student has to hold in their head are spread across a
school portal, a gradebook, a calendar and a paper planner, and none of them talk to each
other. StudyOS is my attempt at the single place.

## Stack

| Part | Built with |
|---|---|
| Web | React 19, TypeScript, Vite, React Router, Tailwind CSS 4, Radix UI |
| State | Zustand, TanStack Query |
| Motion / charts | Framer Motion, Recharts, dnd-kit for drag and drop |
| API | Express 5 on Node, TypeScript |
| AI | Anthropic API via `@anthropic-ai/sdk` |

It is an npm workspaces monorepo: `apps/web` (the interface), `apps/api` (the server).

## What is in it

- **Dashboard** — the week at a glance: what is due, where the time went, current grades
- **Calendar** — assignments and sessions on a month and week view
- **Tasks** — task list with drag-and-drop ordering and a Pomodoro timer
- **Grades** — grade entry and trend charts per subject
- **IB Work** — the IB core: Extended Essay, TOK and internal assessments, with deadlines
- **ECs** — extracurriculars and CAS
- **Time Tracker** — logs study sessions and reports against them
- **AI Study Helper** — a study chat backed by the Anthropic API, plus a floating chat
  available anywhere in the app
- **Onboarding** — first-run setup: subjects, levels, targets
- **Store** — XP earned from completed work, spent on small rewards

The API exposes `/api/ai` for the study helper and `/api/pronote` for pulling in
timetable and assessment data from Pronote, the school portal.

## Running it

Requires Node 22 or newer.

```bash
npm install

cp apps/api/.env.example apps/api/.env
# then put your own ANTHROPIC_API_KEY in apps/api/.env

npm run dev
```

`npm run dev` starts the Vite dev server on `http://localhost:5173` and the API on
`http://localhost:3001`. On Windows, `.\start.ps1` does the same thing in two windows.

Everything except the AI features works without a key.

## State of the project

Working and in daily use, but personal software rather than a finished product: there is
no authentication, data lives in browser state rather than a database, and the Pronote
integration is written against my own school's instance.

## Licence

MIT.
