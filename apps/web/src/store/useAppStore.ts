import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Task {
  id: string
  title: string
  subject: string
  type: 'Homework' | 'Test' | 'Project' | 'IB' | 'EC' | 'Personal'
  due_date: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  status: 'Todo' | 'In Progress' | 'Done' | 'Overdue'
  estimated_minutes: number
  actual_minutes: number
  notes: string
  repeat: 'none' | 'daily' | 'weekly' | 'custom'
  created_at: string
}

export interface Grade {
  id: string
  subject: string
  assessment_name: string
  type: 'Test' | 'Homework' | 'Project' | 'IA' | 'Mock' | 'Other'
  score: number
  max_score: number
  weight: number
  date: string
}

export interface TimeEntry {
  id: string
  activity: string
  category: 'focused-work' | 'study' | 'leisure' | 'sleep' | 'meetings' | 'procrastination' | 'workout'
  duration_minutes: number
  mood_tag: 'Focused' | 'Refreshed' | 'Neutral' | 'Distracted' | 'Tired' | 'Stressed'
  started_at: string
}

export interface XPEvent {
  id: string
  amount: number
  reason: string
  x: number
  y: number
}

export interface CalEvent {
  id: string
  title: string
  start: string | null
  end: string | null
  location: string
  description: string
  category: string
}

export interface RoutineBlock {
  id: string
  dayOfWeek: number // 0=Sun 1=Mon ... 6=Sat
  startHour: number
  durationMinutes: number
  subject: string
  activity: string
  color: string
}

export type IBWorkStatus = 'Not Started' | 'Research' | 'Draft 1' | 'Draft 2' | 'Final' | 'Submitted'

export interface IBWork {
  id: string
  type: 'IA' | 'EE'
  subject: string
  title: string
  supervisor: string
  status: IBWorkStatus
  wordCount: number
  targetWordCount: number
  dueDate: string
  notes: string
  createdAt: string
}

export interface UserProfile {
  name: string
  age: string
  school: string
  ibYear: 'DP1' | 'DP2'
  session: string
  subjects: string[]
  goals: string[]
  universityTargets: string[]
  pronoteCalendarUrl: string
  customPlan: string
}

interface AppState {
  theme: 'light' | 'dark' | 'system'
  xp: number
  streak: number
  lastLoginDate: string
  tasks: Task[]
  grades: Grade[]
  timeEntries: TimeEntry[]
  subjects: string[]
  xpEvents: XPEvent[]
  pomodoroRunning: boolean
  pomodoroSubject: string
  pomodoroSecondsLeft: number
  chatOpen: boolean
  currentPage: string
  onboardingDone: boolean
  userProfile: UserProfile | null
  pronoteEvents: CalEvent[]
  lastPronoteSync: string
  ibWorks: IBWork[]
  studyRoutine: RoutineBlock[]

  setTheme: (t: 'light' | 'dark' | 'system') => void
  addXP: (amount: number, reason: string, x?: number, y?: number) => void
  removeXPEvent: (id: string) => void
  addTask: (task: Omit<Task, 'id' | 'created_at'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  completeTask: (id: string) => void
  addGrade: (grade: Omit<Grade, 'id'>) => void
  updateGrade: (id: string, updates: Partial<Grade>) => void
  deleteGrade: (id: string) => void
  addTimeEntry: (entry: Omit<TimeEntry, 'id'>) => void
  setSubjects: (subjects: string[]) => void
  setPomodoroRunning: (v: boolean) => void
  setPomodoroSubject: (s: string) => void
  setPomodoroSecondsLeft: (n: number) => void
  setChatOpen: (v: boolean) => void
  setCurrentPage: (p: string) => void
  checkStreak: () => void
  setOnboardingDone: (v: boolean) => void
  setUserProfile: (p: UserProfile) => void
  updateUserProfile: (updates: Partial<UserProfile>) => void
  setPronoteEvents: (events: CalEvent[]) => void
  setLastPronoteSync: (ts: string) => void
  addIbWork: (work: Omit<IBWork, 'id' | 'createdAt'>) => void
  updateIbWork: (id: string, updates: Partial<IBWork>) => void
  deleteIbWork: (id: string) => void
  setStudyRoutine: (blocks: RoutineBlock[]) => void
  addRoutineBlock: (block: Omit<RoutineBlock, 'id'>) => void
  deleteRoutineBlock: (id: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      xp: 0,
      streak: 0,
      lastLoginDate: '',
      tasks: [],
      grades: [],
      timeEntries: [],
      subjects: [],
      xpEvents: [],
      pomodoroRunning: false,
      pomodoroSubject: '',
      pomodoroSecondsLeft: 25 * 60,
      chatOpen: false,
      currentPage: 'dashboard',
      onboardingDone: false,
      userProfile: null,
      pronoteEvents: [],
      lastPronoteSync: '',
      ibWorks: [],
      studyRoutine: [],

      setTheme: (t) => set({ theme: t }),

      addXP: (amount, reason, x = window.innerWidth / 2, y = window.innerHeight / 2) => {
        const id = crypto.randomUUID()
        set((s) => ({
          xp: s.xp + amount,
          xpEvents: [...s.xpEvents, { id, amount, reason, x, y }],
        }))
        setTimeout(() => get().removeXPEvent(id), 1400)
      },

      removeXPEvent: (id) =>
        set((s) => ({ xpEvents: s.xpEvents.filter((e) => e.id !== id) })),

      addTask: (task) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            { ...task, id: crypto.randomUUID(), created_at: new Date().toISOString() },
          ],
        })),

      updateTask: (id, updates) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)) })),

      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      completeTask: (id) => {
        const task = get().tasks.find((t) => t.id === id)
        if (!task) return
        get().updateTask(id, { status: 'Done' })
        const dueDate = new Date(task.due_date)
        const now = new Date()
        const isEarly = dueDate.getTime() - now.getTime() > 24 * 60 * 60 * 1000
        get().addXP(20 + (isEarly ? 10 : 0), isEarly ? 'Early completion!' : 'Task complete!')
      },

      addGrade: (grade) =>
        set((s) => ({ grades: [...s.grades, { ...grade, id: crypto.randomUUID() }] })),

      updateGrade: (id, updates) =>
        set((s) => ({ grades: s.grades.map((g) => (g.id === id ? { ...g, ...updates } : g)) })),

      deleteGrade: (id) => set((s) => ({ grades: s.grades.filter((g) => g.id !== id) })),

      addTimeEntry: (entry) =>
        set((s) => ({
          timeEntries: [...s.timeEntries, { ...entry, id: crypto.randomUUID() }],
        })),

      setSubjects: (subjects) => set({ subjects }),
      setPomodoroRunning: (v) => set({ pomodoroRunning: v }),
      setPomodoroSubject: (s) => set({ pomodoroSubject: s }),
      setPomodoroSecondsLeft: (n) => set({ pomodoroSecondsLeft: n }),
      setChatOpen: (v) => set({ chatOpen: v }),
      setCurrentPage: (p) => set({ currentPage: p }),
      setOnboardingDone: (v) => set({ onboardingDone: v }),
      setUserProfile: (p) => set({ userProfile: p, subjects: p.subjects }),
      updateUserProfile: (updates) =>
        set((s) => ({ userProfile: s.userProfile ? { ...s.userProfile, ...updates } : null })),
      setPronoteEvents: (events) => set({ pronoteEvents: events }),
      setLastPronoteSync: (ts) => set({ lastPronoteSync: ts }),

      addIbWork: (work) =>
        set((s) => ({
          ibWorks: [...s.ibWorks, { ...work, id: crypto.randomUUID(), createdAt: new Date().toISOString() }],
        })),

      updateIbWork: (id, updates) =>
        set((s) => ({ ibWorks: s.ibWorks.map((w) => (w.id === id ? { ...w, ...updates } : w)) })),

      deleteIbWork: (id) => set((s) => ({ ibWorks: s.ibWorks.filter((w) => w.id !== id) })),

      setStudyRoutine: (blocks) => set({ studyRoutine: blocks }),

      addRoutineBlock: (block) =>
        set((s) => ({ studyRoutine: [...s.studyRoutine, { ...block, id: crypto.randomUUID() }] })),

      deleteRoutineBlock: (id) =>
        set((s) => ({ studyRoutine: s.studyRoutine.filter((b) => b.id !== id) })),

      checkStreak: () => {
        const today = new Date().toDateString()
        const { lastLoginDate, streak } = get()
        if (lastLoginDate === today) return
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const isConsecutive = lastLoginDate === yesterday.toDateString()
        const newStreak = isConsecutive ? streak + 1 : 1
        set({ streak: newStreak, lastLoginDate: today })
        if (newStreak === 7) get().addXP(100, '7-day streak!')
      },
    }),
    {
      name: 'studyos-store',
      partialize: (s) => ({
        theme: s.theme,
        xp: s.xp,
        streak: s.streak,
        lastLoginDate: s.lastLoginDate,
        tasks: s.tasks,
        grades: s.grades,
        timeEntries: s.timeEntries,
        subjects: s.subjects,
        onboardingDone: s.onboardingDone,
        userProfile: s.userProfile,
        pronoteEvents: s.pronoteEvents,
        lastPronoteSync: s.lastPronoteSync,
        ibWorks: s.ibWorks,
        studyRoutine: s.studyRoutine,
      }),
    }
  )
)
