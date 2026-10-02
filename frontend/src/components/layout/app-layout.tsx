import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { CloudOff, LogOut, Mic2 } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui'
import { AppSidebar } from '@/components/layout'
import { ModeToggle } from '@/components/theme'
import { useAuthStore } from '@/stores'
import { NotificationsPopover } from '@/components/alerts'
import { useOfflineSync } from '@/hooks/use-offline-sync'

export function AppLayout({ children }: { children?: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()
  const userId = useAuthStore((s) => s.user?.id)
  const { online, pending } = useOfflineSync(userId)

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
            <span>LangLeap</span>
            {isAuthenticated && (!online || pending > 0) && (
              <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs">
                <CloudOff className="size-3" />
                {online ? `${pending} pending sync` : 'Offline'}
              </span>
            )}
          </div>
          <UserMenu />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children ?? <Outlet />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function UserMenu() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const signOut = useAuthStore((s) => s.signOut)

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <ModeToggle />
        <Button variant="outline" size="sm" asChild>
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    )
  }

  const initials = user.fullName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex items-center gap-2">
      <NotificationsPopover />
      <ModeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 pl-1.5">
            <Avatar className="size-7">
              <AvatarFallback>{initials || 'U'}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">
              {user.fullName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.fullName}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => void signOut()} variant="destructive">
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function BrandLogo() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <Mic2 className="size-4" />
    </div>
  )
}