import { useState } from 'react'
import { Bell, BookOpenCheck, MailCheck, Sparkles } from 'lucide-react'
import {
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui'
import { useAuthStore } from '@/stores'
import { addNotification, getNotifications, markAllNotificationsRead } from '@/data/learner'
import type { LangLeapNotification } from '@/lib'

/** Header bell: daily reminders + streak/already-unlock events (FR-10). */
export function NotificationsPopover() {
  const user = useAuthStore((s) => s.user)
  const [notes, setNotes] = useState<LangLeapNotification[]>(() =>
    user ? getNotifications(user.id) : [],
  )

  if (!user) return null

  const unread = notes.filter((n) => !n.read).length

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) setNotes(getNotifications(user.id))
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="size-4" />
          {unread > 0 && (
            <Badge className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]">{unread}</Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 text-xs text-muted-foreground"
            onClick={() => {
              setNotes(markAllNotificationsRead(user.id))
            }}
          >
            <MailCheck className="size-3" /> Mark all read
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notes.length === 0 ? (
          <div className="flex flex-col items-center gap-1 px-2 py-8 text-center text-sm text-muted-foreground">
            <Sparkles className="size-5" />
            <span>No notifications yet</span>
          </div>
        ) : (
          notes.slice(0, 6).map((n) => (
            <DropdownMenuItem key={n.id} className="items-start gap-2 px-3 py-2">
              <BookOpenCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <span className="flex flex-col gap-0.5">
                <span className="text-xs font-medium">{n.title}</span>
                <span className="text-xs text-muted-foreground">{n.message}</span>
              </span>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuLabel className="text-center">
          <Button
            variant="link"
            size="sm"
            className="h-6 text-xs"
            onClick={() => {
              addNotification(user.id, 'Test reminder', 'Daily practice reminder (demo).')
              setNotes(getNotifications(user.id))
            }}
          >
            Send demo reminder
          </Button>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}