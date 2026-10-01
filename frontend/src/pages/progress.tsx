import { Check, Flame, Snowflake } from 'lucide-react'
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { useAuthStore } from '@/stores'
import { getLessons } from '@/data/lessons'
import { getProgress, getStreak, todayKey } from '@/data/learner'
import { formatDate, formatScore } from '@/data/progression'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function ProgressPage() {
  const user = useAuthStore((s) => s.user)
  if (!user) return null

  const lessons = getLessons()
  const progress = getProgress(user.id)
  const streak = getStreak(user.id)
  const today = todayKey()

  // Last 7 days (Sun-thru-Sat frame), marking activity from progress completion dates.
  const days = Array.from({ length: 7 }, (_, i) => i - 6).map((offset) => {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    const key = d.toISOString().slice(0, 10)
    const active = Object.values(progress).some((r) => r.completedAt.slice(0, 10) === key && r.passed)
      || key === streak.lastDay
    return { key, active, weekday: WEEKDAYS[d.getDay()] }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Progress &amp; Streak</h1>
        <p className="text-sm text-muted-foreground">
          Complete a lesson each calendar day to advance your streak. One weekly freeze protects you from a
          single miss (FR-08).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs"><Flame className="size-3.5 text-primary" /> Current streak</CardDescription>
            <CardTitle className="text-3xl">{streak.current} day{streak.current === 1 ? '' : 's'}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {streak.current === 0 ? 'Start today to light the flame.' : streak.lastDay === today ? 'Completed today. Come back tomorrow.' : 'One day is still safe — or use your weekly freeze.'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs"><Flame className="size-3.5 text-primary" /> Best streak</CardDescription>
            <CardTitle className="text-3xl">{streak.best} day{streak.best === 1 ? '' : 's'}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">your longest run yet</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs"><Snowflake className="size-3.5 text-primary" /> Freeze this week</CardDescription>
            <CardTitle className="text-3xl">{streak.freezesUsed}/1</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">a missed day is forgiven while a freeze is available</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">This week</CardTitle>
          <CardDescription>Green days are days you completed a lesson.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between gap-2">
            {days.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-xs text-muted-foreground">{d.weekday}</span>
                <div className={`flex size-9 items-center justify-center rounded-lg border ${d.active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted/40 text-muted-foreground'}`}>
                  {d.active ? <Check className="size-4" /> : '·'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lesson results</CardTitle>
          <CardDescription>Every quiz attempt, newest first.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lesson</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Speaking</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(progress)
                .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
                .map((r) => {
                  const lesson = lessons.find((l) => l.id === r.lessonId)
                  return (
                    <TableRow key={r.lessonId}>
                      <TableCell className="font-medium">{lesson?.title ?? r.lessonId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={r.passed ? 'default' : 'secondary'}>{formatScore(r.score)}</Badge>
                          {r.passed && <Check className="size-3.5 text-emerald-500" />}
                        </div>
                      </TableCell>
                      <TableCell>{r.speakingScore != null ? formatScore(r.speakingScore) : '—'}</TableCell>
                      <TableCell>{r.attempts}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(r.completedAt)}</TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}