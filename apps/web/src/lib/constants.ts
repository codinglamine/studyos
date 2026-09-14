export const SUBJECTS = [
  'Math HL', 'Math SL', 'Physics HL', 'Physics SL',
  'Chemistry HL', 'Chemistry SL', 'Biology HL', 'Biology SL',
  'English A', 'English B', 'History HL', 'History SL',
  'Economics HL', 'Economics SL', 'French', 'Spanish',
  'Geography', 'CS HL', 'CS SL', 'TOK', 'CAS', 'EE',
]

export const TASK_TYPES = ['Homework', 'Test', 'Project', 'IB', 'EC', 'Personal'] as const
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const
export const STATUSES = ['Todo', 'In Progress', 'Done', 'Overdue'] as const

export const XP_REWARDS = {
  COMPLETE_TASK: 20,
  EARLY_COMPLETION: 10,
  STUDY_SESSION: 15,
  PRACTICE_TEST_PASS: 30,
  LOG_EC: 10,
  LOG_WORKOUT: 12,
  SEVEN_DAY_STREAK: 100,
  IB_COMPONENT: 25,
  SUBJECT_STREAK_5: 50,
  DISCIPLINE: 5,
} as const

export const STORE_ITEMS = [
  { key: 'screen-time-pass', name: 'Screen Time Pass', description: '30 min free time countdown', emoji: '📱', cost: 100 },
  { key: 'streak-shield', name: 'Streak Shield', description: 'One missed day grace', emoji: '🛡️', cost: 150 },
  { key: 'ui-theme-pack', name: 'UI Theme Pack', description: 'Ocean / Sunset / Midnight themes', emoji: '🎨', cost: 200 },
  { key: 'xp-booster', name: 'XP Booster 2×', description: 'All XP doubled for 24h', emoji: '⚡', cost: 250 },
  { key: 'deadline-extension', name: 'Deadline Extension Token', description: 'Extend task due-date by 1 day', emoji: '⏰', cost: 300 },
  { key: 'custom-badge', name: 'Custom Badge Slot', description: 'Custom emoji badge on profile', emoji: '🏅', cost: 400 },
  { key: 'ai-session-pack', name: 'AI Session Pack', description: '+5 extra AI Study Helper sessions', emoji: '🤖', cost: 180 },
  { key: 'leaderboard-invisibility', name: 'Leaderboard Invisibility', description: 'Hide from leaderboard for 7 days', emoji: '👻', cost: 80 },
  { key: 'ambient-sound-pack', name: 'Ambient Sound Pack', description: 'Cafe / Thunderstorm / Ocean sounds', emoji: '🎵', cost: 120 },
] as const

export const BADGES = [
  { key: 'ib-survivor', name: 'IB Survivor', description: 'Complete all IB components', emoji: '🏆' },
  { key: 'night-owl', name: 'Night Owl', description: 'Study after midnight 5 times', emoji: '🦉' },
  { key: 'perfect-week', name: 'Perfect Week', description: '7 day streak with all tasks done', emoji: '⭐' },
  { key: 'gym-rat', name: 'Gym Rat', description: 'Log 30 workouts', emoji: '💪' },
  { key: 'first-blood', name: 'First Blood', description: 'Complete your first task', emoji: '🩸' },
  { key: 'polyglot', name: 'Polyglot', description: 'A streak in 3+ subjects', emoji: '🌍' },
] as const

export const MOODS = [
  { emoji: '😩', label: 'Struggling', value: 1 },
  { emoji: '😐', label: 'Neutral', value: 2 },
  { emoji: '🙂', label: 'Good', value: 3 },
  { emoji: '😊', label: 'Great', value: 4 },
  { emoji: '🔥', label: 'On Fire', value: 5 },
] as const

export const PAGE_ORB_CONFIGS: Record<string, { a: string; b: string; c: string }> = {
  dashboard: {
    a: 'rgba(124,58,237,0.25)',
    b: 'rgba(6,182,212,0.20)',
    c: 'rgba(253,230,138,0.15)',
  },
  tasks: {
    a: 'rgba(79,70,229,0.25)',
    b: 'rgba(16,185,129,0.20)',
    c: 'rgba(245,158,11,0.15)',
  },
  calendar: {
    a: 'rgba(6,182,212,0.25)',
    b: 'rgba(79,70,229,0.20)',
    c: 'rgba(34,197,94,0.15)',
  },
  ai: {
    a: 'rgba(14,165,233,0.25)',
    b: 'rgba(99,102,241,0.20)',
    c: 'rgba(6,182,212,0.15)',
  },
  grades: {
    a: 'rgba(245,158,11,0.25)',
    b: 'rgba(124,58,237,0.20)',
    c: 'rgba(239,68,68,0.15)',
  },
  ecs: {
    a: 'rgba(16,185,129,0.25)',
    b: 'rgba(6,182,212,0.20)',
    c: 'rgba(124,58,237,0.15)',
  },
  store: {
    a: 'rgba(253,230,138,0.25)',
    b: 'rgba(124,58,237,0.20)',
    c: 'rgba(6,182,212,0.15)',
  },
  time: {
    a: 'rgba(15,23,42,0.25)',
    b: 'rgba(124,58,237,0.20)',
    c: 'rgba(6,182,212,0.15)',
  },
}
