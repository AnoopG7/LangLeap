import { useEffect, useState } from 'react'
import { flushPendingSync, getPendingSyncCount } from '@/data/sync'

export function useOfflineSync(userId?: string) {
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine)
  const [pending, setPending] = useState(() => getPendingSyncCount(userId))

  useEffect(() => {
    const refresh = () => {
      setOnline(navigator.onLine)
      setPending(flushPendingSync(userId))
    }
    window.addEventListener('online', refresh)
    window.addEventListener('offline', refresh)
    refresh()
    return () => {
      window.removeEventListener('online', refresh)
      window.removeEventListener('offline', refresh)
    }
  }, [userId])

  return { online, pending }
}