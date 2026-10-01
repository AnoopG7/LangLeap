import type { Lesson, ProgressRecord } from '@/lib'

export type LessonLaunchState = 'passed' | 'available' | 'locked'

/**
 * FR-07 lock rules, derived from the decision table:
 * a lesson is available only when the previous one passed AND it is published.
 */
export function lessonLaunchState(
  lesson: Lesson,
  progress: Record<string, ProgressRecord>,
  prevPassed: boolean,
): LessonLaunchState {
  if (progress[lesson.id]?.passed) return 'passed'
  if (lesson.state !== 'published') return 'locked'
  if (lesson.position <= 1) return 'available'
  return prevPassed ? 'available' : 'locked'
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatScore(score: number): string {
  return `${Math.round(score)}`
}