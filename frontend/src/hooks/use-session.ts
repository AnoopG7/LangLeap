import { useEffect } from 'react'
import { useAuthStore } from '@/stores'

/**
 * Frontend-only session bootstrap. With no backend, “re-validate” means
 * re-hydrating the stored profile from localStorage on mount / token change.
 */
export function useSession() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)

  const fetchMe = useAuthStore((s) => s.fetchMe)

  useEffect(() => {
    if (token) {
      void fetchMe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return { user, isLoading }
}