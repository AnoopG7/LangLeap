import { useState } from 'react'
import { Bell, Check, MailCheck, Sparkles } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { useAuthStore } from '@/stores'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/data/learner'
import type { LangLeapNotification } from '@/lib'
import { formatDate } from '@/data/progression'
import { ensureLearnerData } from '@/data/bootstrap'

export default function NotificationsPage() {
  const user = useAuthStore((s) => s.user)
  const [notes, setNotes] = useState<LangLeapNotification[]>(() => {
    if (!user) return []
    ensureLearnerData(user.id)
    return getNotifications(user.id)
  })

  if (!user) return null

  const unread = notes.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Lesson completions, unlocks, streak action and daily reminders (FR-10).
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={notes.length === 0}
          onClick={() => setNotes(markAllNotificationsRead(user.id))}
        >
          <MailCheck className="size-4" /> Mark all read
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="size-4 text-primary" /> Inbox
            <span className="text-xs font-normal text-muted-foreground">{unread} unread</span>
          </CardTitle>
          <CardDescription>Notifications stay in your browser and reset with your progress.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
              <Sparkles className="size-6" />
              <span>No notifications yet. Complete a lesson to see activity here.</span>
            </div>
          ) : (
            notes.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setNotes(markNotificationRead(user.id, n.id))}
                className={`flex w-full items-start gap-3 rounded-lg border border-border/70 p-3 text-left transition-colors ${n.read ? 'bg-transparent' : 'bg-primary/5'}`}
              >
                {n.read ? (
                  <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Check className="size-2.5" />
                  </div>
                ) : (
                  <div className="mt-0.5 size-2 shrink-0 rounded-full bg-primary" />
                )}
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{n.title}</span>
                  <span className="text-xs text-muted-foreground">{n.message}</span>
                  <span className="text-[10px] text-muted-foreground/70">{formatDate(n.createdAt)}</span>
                </span>
              </button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}