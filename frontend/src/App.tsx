import { RouterProvider } from 'react-router-dom'
import router from './router'
import { useSession } from '@/hooks'
import { useAuthStore } from '@/stores'
import { useOfflineSync } from '@/hooks/use-offline-sync'

function App() {
  useSession()
  const userId = useAuthStore((s) => s.user?.id)
  useOfflineSync(userId)
  return <RouterProvider router={router} />
}

export default App
