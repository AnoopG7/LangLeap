import {
  addNotification,
  getNotifications,
  getProgress,
  setStreak,
} from './learner'

// ---------------------------------------------------------------------------
// Learner demo bootstrap (frontend-only mock)
//
// Keep learner bootstrap minimal so the unlock path remains exercisable.
// ---------------------------------------------------------------------------

export function ensureLearnerData(userId: string): boolean {
  const existing = getProgress(userId)

  if (Object.keys(existing).length > 0) return false

  setStreak(userId, {
    current: 0,
    best: 0,
    lastDay: '',
    freezesUsed: 0,
    freezeWeek: '',
  })

  if (getNotifications(userId).length === 0) {
    addNotification(userId, 'Welcome to LangLeap', 'Your first published lesson is ready. Pass its quiz to unlock the next one.')
    addNotification(userId, 'Daily practice reminder', 'Complete one lesson today to start your streak.')
  }

  return true
}