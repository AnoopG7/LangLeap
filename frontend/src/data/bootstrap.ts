import type { ProgressRecord, Streak } from '@/lib'
import { getLessons } from './lessons'
import {
  addNotification,
  dateOffsetKey,
  getNotifications,
  getProgress,
  setProgress,
  setStreak,
  todayKey,
  weekKey,
} from './learner'

// ---------------------------------------------------------------------------
// Learner demo bootstrap (frontend-only mock)
//
// Seed data exists so the app feels alive the moment a learner signs in,
// instead of an empty progress ledger and a zero streak. It:
//   • passes EVERY published lesson across a 20-day window (previous + current
//     calendar weeks plus a buffer), so every published quiz is re-takeable
//     and no published lesson appears locked;
//   • recreates the FR-08 streak story (misses → freeze → reset → rebuild) so
//     the freezesUsed counter and freezeWeek match the rules;
//   • writes notifications to the centre.
//
// It re-runs (self-heals) whenever a published lesson is not passed — e.g. after
// a failed quiz attempt or a newly published lesson — so the demo always shows
// a fully-unlocked path. Afterwards the user's own activity overwrites records.
// ---------------------------------------------------------------------------

const MISSING_DAYS = new Set([-10, -4, -3])
const SIM_START = -20

function isoDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysAgo)
  d.setHours(12, 0, 0, 0)
  return d.toISOString()
}

export function ensureLearnerData(userId: string): boolean {
  const lessons = getLessons()
  const byPosition = [...lessons].sort((a, b) => a.position - b.position)
  const published = byPosition.filter((l) => l.state === 'published')
  const existing = getProgress(userId)

  // Self-heal: seed (or re-seed) when anything published lacks a passing score.
  const ids = published.map((l) => l.id)
  const needsSeed =
    Object.keys(existing).length === 0 ||
    ids.some((id) => !existing[id]?.passed)

  if (!needsSeed) return false

  // Active days, oldest → newest (misses skipped).
  const activeSeq: number[] = []
  for (let d = SIM_START; d <= 0; d++) {
    if (!MISSING_DAYS.has(d)) activeSeq.push(d)
  }

  // Oldest active day walks up the path one lesson per day; once every
  // published id is passed, later days are revision retakes of the last one.
  const solveOrder = activeSeq.map((_, i) => ids[Math.min(i, ids.length - 1)])

  const dayRecords = new Map<string, ProgressRecord[]>()
  for (let i = 0; i < activeSeq.length; i++) {
    const daysAgo = activeSeq[i]
    const lessonId = solveOrder[i]
    const lesson = byPosition.find((l) => l.id === lessonId)
    if (!lesson) continue
    const recs = dayRecords.get(lessonId) ?? []
    const passNo = recs.length
    const score = passNo === 0 ? 72 + ((recs.length * 7) % 21) : 78 + (i % 14)
    const rec: ProgressRecord = {
      lessonId,
      score,
      speakingScore: Math.max(60, score - 3),
      passed: true,
      attempts: passNo + 1,
      completedAt: isoDate(daysAgo),
    }
    recs.push(rec)
    dayRecords.set(lessonId, recs)
  }

  dayRecords.forEach((recs) => {
    setProgress(userId, recs[0].lessonId, recs[recs.length - 1])
  })

  // Streak story: active every day except the misses; freezes recover the
  // first miss in a week, a second miss in the same week resets the run.
  const activeDays = new Set(activeSeq)
  const bestRun = () => {
    let best = 0
    let run = 0
    for (let d = SIM_START; d <= 0; d++) {
      run = activeDays.has(d) ? run + 1 : 0
      if (run > best) best = run
    }
    return best
  }
  let current = 0
  for (let d = 0; d >= SIM_START; d--) {
    if (activeDays.has(d)) current++
    else break
  }

  const missWeeks = new Set([...MISSING_DAYS].map((d) => weekKey(new Date(new Date().getTime() + d * 86_400_000))))
  const streak: Streak = {
    current,
    best: Math.max(bestRun(), current),
    lastDay: activeDays.has(0) ? todayKey() : dateOffsetKey(-1),
    freezesUsed: missWeeks.size,
    freezeWeek: missWeeks.has(weekKey()) ? weekKey() : [...missWeeks].pop() ?? '',
  }
  setStreak(userId, streak)

  if (getNotifications(userId).length === 0) {
    addNotification(userId, 'Welcome to LangLeap', 'Every published lesson is open — re-take any quiz anytime.')
    if (streak.best > 1) {
      addNotification(userId, 'Streak milestone', `Best streak reached ${streak.best} days — keep going!`)
    }
    addNotification(userId, 'All lessons open', 'Passed the whole published path. Review lessons or retake quizzes to practise.')
  }

  return true
}