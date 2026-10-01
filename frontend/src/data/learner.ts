import type {
  LangLeapNotification,
  ProgressRecord,
  Streak,
} from '@/lib'
import { PASS_THRESHOLD } from '@/lib'

// ── Persistence helpers ─────────────────────────────────────────────────────

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

// ── Dates ───────────────────────────────────────────────────────────────────

function key(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10)
}

export function todayKey(): string {
  return key()
}

export function dateOffsetKey(days: number, from: Date = new Date()): string {
  const d = new Date(from)
  d.setDate(d.getDate() + days)
  return key(d)
}

// ── Progress ────────────────────────────────────────────────────────────────

const PROGRESS_KEY = 'langleap_progress'

export function getProgress(userId: string): Record<string, ProgressRecord> {
  return read<Record<string, ProgressRecord>>(`${PROGRESS_KEY}:${userId}`, {})
}

export function setProgress(userId: string, lessonId: string, record: ProgressRecord) {
  const all = getProgress(userId)
  all[lessonId] = record
  write(`${PROGRESS_KEY}:${userId}`, all)
}

export function resetProgress(userId: string) {
  localStorage.removeItem(`${PROGRESS_KEY}:${userId}`)
}

// ── Unveiling rules (FR-07) — LL-Test-Plan §4 decision table ────────────────

export function evaluateUnlock(
  previousPassed: boolean,
  score: number,
  nextPublished: boolean,
): boolean {
  return previousPassed && score >= PASS_THRESHOLD && nextPublished
}

// ── Streak (FR-08) — LL-Test-Plan §5 decision table ─────────────────────────

export type StreakAction = 'increment' | 'start' | 'freeze' | 'reset' | 'noop'

export function evaluateStreak(
  completedToday: boolean,
  streakActiveYesterday: boolean,
  freezeAvailable: boolean,
): StreakAction {
  if (completedToday && streakActiveYesterday) return 'increment'
  if (completedToday && !streakActiveYesterday) return 'start'
  if (!completedToday && streakActiveYesterday && freezeAvailable) return 'freeze'
  if (!completedToday && streakActiveYesterday && !freezeAvailable) return 'reset'
  return 'noop'
}

export function freezeAvailableThisWeek(s: Streak): boolean {
  return s.freezeWeek !== currentWeek() || s.freezesUsed < 1
}

function currentWeek(): string {
  const d = new Date()
  const start = new Date(d)
  start.setDate(d.getDate() - d.getDay())
  return key(start)
}

const STREAK_KEY = 'langleap_streak'

export function getStreak(userId: string): Streak {
  return read<Streak>(`${STREAK_KEY}:${userId}`, {
    current: 0,
    best: 0,
    lastDay: '',
    freezesUsed: 0,
    freezeWeek: '',
  })
}

/** Applies the streak rule for today after a lesson pass (FR-08). */
export function applyStreak(userId: string): { streak: Streak; action: StreakAction } {
  const streak = getStreak(userId)
  const today = todayKey()
  const completedToday = streak.lastDay === today
  const streakActiveYesterday = streak.lastDay === dateOffsetKey(-1)
  const action = evaluateStreak(completedToday, streakActiveYesterday, freezeAvailableThisWeek(streak))
  const next: Streak = { ...streak }

  switch (action) {
    case 'increment':
      next.current += 1
      next.lastDay = today
      break
    case 'start':
      next.current = 1
      next.lastDay = today
      if (next.best < 1) next.best = 1
      break
    case 'freeze':
      next.freezesUsed += 1
      next.freezeWeek = currentWeek()
      break
    case 'reset':
      next.current = 0
      next.lastDay = today
      break
    case 'noop':
      break
  }
  if (next.current > next.best) next.best = next.current
  write(`${STREAK_KEY}:${userId}`, next)
  return { streak: next, action }
}

// ── Notifications (FR-10) ───────────────────────────────────────────────────

const NOTE_KEY = 'langleap_notifications'

export function getNotifications(userId: string): LangLeapNotification[] {
  return read<LangLeapNotification[]>(`${NOTE_KEY}:${userId}`, [])
}

export function addNotification(userId: string, title: string, message: string): LangLeapNotification[] {
  const notes = getNotifications(userId)
  const note: LangLeapNotification = {
    id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  }
  const next = [note, ...notes].slice(0, 30)
  write(`${NOTE_KEY}:${userId}`, next)
  return next
}

export function markNotificationRead(userId: string, id: string): LangLeapNotification[] {
  const next = getNotifications(userId).map((n) => (n.id === id ? { ...n, read: true } : n))
  write(`${NOTE_KEY}:${userId}`, next)
  return next
}

export function markAllNotificationsRead(userId: string): LangLeapNotification[] {
  const next = getNotifications(userId).map((n) => ({ ...n, read: true }))
  write(`${NOTE_KEY}:${userId}`, next)
  return next
}