import { beforeEach, describe, expect, it } from 'vitest'
import {
  evaluateStreak,
  evaluateUnlock,
} from '@/data/learner'
import {
  flushPendingSync,
  getPendingSyncCount,
  queueQuizResult,
} from '@/data/sync'
import { gateLesson } from '@/data/lessons'
import type { Lesson, ProgressRecord } from '@/lib'

describe('lesson unlock rules', () => {
  it('requires a passing score and a published next lesson', () => {
    expect(evaluateUnlock(true, 70, true)).toBe(true)
    expect(evaluateUnlock(true, 69, true)).toBe(false)
    expect(evaluateUnlock(true, 100, false)).toBe(false)
    expect(evaluateUnlock(false, 100, true)).toBe(false)
  })
})

describe('streak rules', () => {
  it('covers start, increment, freeze and reset decisions', () => {
    expect(evaluateStreak(true, false, true)).toBe('start')
    expect(evaluateStreak(true, true, true)).toBe('increment')
    expect(evaluateStreak(false, true, true)).toBe('freeze')
    expect(evaluateStreak(false, true, false)).toBe('reset')
  })
})

describe('content publish gate', () => {
  const lesson: Lesson = {
    id: 'l-gate',
    code: 'LL-GATE',
    title: 'Gate test',
    level: 'A1',
    position: 1,
    state: 'in_review',
    version: 1,
    script: [
      { en: 'One line here.', hi: 'एक पंक्ति।', mr: 'एक ओळ.' },
      { en: 'Another line here.', hi: 'दूसरी पंक्ति।', mr: 'दुसरी ओळ.' },
    ],
    hint: { en: 'A hint', hi: 'संकेत', mr: 'सूचना' },
    quiz: [
      { id: 'q1', prompt: 'Q1', options: ['A', 'B'], correctIndex: 0 },
      { id: 'q2', prompt: 'Q2', options: ['A', 'B'], correctIndex: 0 },
      { id: 'q3', prompt: 'Q3', options: ['A', 'B'], correctIndex: 0 },
    ],
    audioUrl: 'mock-audio/gate',
    audioDurationSec: 10,
    scriptTargetSec: 10,
  }

  it('requires explicit audio acceptance before publish', () => {
    expect(gateLesson({ ...lesson, audioStatus: 'submitted' }).ok).toBe(false)
    expect(gateLesson({ ...lesson, audioStatus: 'accepted' }).ok).toBe(true)
  })
})
describe('offline sync queue', () => {
  const record: ProgressRecord = {
    lessonId: 'l-01',
    score: 80,
    speakingScore: 78,
    passed: true,
    attempts: 1,
    completedAt: '2026-10-02T00:00:00.000Z',
  }

  beforeEach(() => localStorage.clear())

  it('deduplicates a lesson result and flushes it after reconnect', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false })
    queueQuizResult('u-1', record)
    queueQuizResult('u-1', record)
    expect(getPendingSyncCount('u-1')).toBe(1)

    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
    expect(flushPendingSync('u-1')).toBe(0)
  })
})