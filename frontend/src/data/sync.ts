import type { ProgressRecord } from '@/lib'

const QUEUE_KEY = 'langleap_sync_queue'

export interface PendingSyncItem {
  id: string
  userId: string
  kind: 'quiz_result'
  record: ProgressRecord
  queuedAt: string
}

function readQueue(): PendingSyncItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? (JSON.parse(raw) as PendingSyncItem[]) : []
  } catch {
    return []
  }
}

function writeQueue(queue: PendingSyncItem[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function getPendingSyncCount(userId?: string): number {
  return readQueue().filter((item) => !userId || item.userId === userId).length
}

export function queueQuizResult(userId: string, record: ProgressRecord): number {
  const queue = readQueue().filter(
    (item) => !(item.userId === userId && item.kind === 'quiz_result' && item.record.lessonId === record.lessonId),
  )
  queue.push({
    id: `sync-${userId}-${record.lessonId}`,
    userId,
    kind: 'quiz_result',
    record,
    queuedAt: new Date().toISOString(),
  })
  writeQueue(queue)
  return getPendingSyncCount(userId)
}

export function flushPendingSync(userId?: string): number {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return getPendingSyncCount(userId)
  const remaining = readQueue().filter((item) => userId && item.userId !== userId)
  writeQueue(remaining)
  return getPendingSyncCount(userId)
}