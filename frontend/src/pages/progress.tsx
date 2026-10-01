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
import {
  freezeAvailableThisWeek,
  getProgress,
  getStreak,
  todayKey,
} from '@/data/learner'
import { formatDate, formatScore } from '@/data/progression'
import { ensureLearnerData } from '@/data/bootstrap'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function ProgressPage() {
  const user = useAuthStore((s) => s.user)
  if (!user) return null

  ensureLearnerData(user.id)

  const lessons = getLessons()
  const progress = getProgress(user.id)
  const streak = getStreak(user.id)
  const today = todayKey()

  const isActive = (key: string) =>
    Object.values(progress).some((r) => r.completedAt.slice(0, 10) === key && r.passed) ||
    key === streak.lastDay

  // Three calendar weeks (Sun-thru-Sat): previous, current, next.
  const weekFrames = (offsetWeeks: number) => {
    const anchor = new Date()
    anchor.setDate(anchor.getDate() - anchor.getDay())
    anchor.setDate(anchor.getDate() + offsetWeeks * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(anchor)
      d.setDate(d.getDate() + i)
      return {
        key: d.toISOString().slice(0, 10),
        weekday: WEEKDAYS[d.getDay()],
        inPast: d.getTime() < Date.now(),
      }
    })
  }

  const previousWeek = weekFrames(-1)
  const thisWeek = weekFrames(0)
  const nextWeek = weekFrames(1)

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
            <CardTitle className="text-3xl">{freezeAvailableThisWeek(streak) ? '1' : '0'}<span className="text-lg text-muted-foreground"> left</span></CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {freezeAvailableThisWeek(streak)
              ? 'still available — a missed day is forgiven'
              : 'already used this week — miss again and your streak resets'}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Streak calendar</CardTitle>
          <CardDescription>Previous and current week show real activity; next week is your target.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(
            [
              { label: 'Previous week', days: previousWeek },
              { label: 'This week', days: thisWeek },
              { label: 'Next week', days: nextWeek },
            ] as const
          ).map(({ label, days }) => (
            <div key={label}>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
              <div className="flex justify-between gap-2">
                {days.map((d) => {
                  const active = isActive(d.key)
                  const future = !d.inPast
                  return (
                    <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">{d.weekday}</span>
                      <div
                        className={`flex size-9 items-center justify-center rounded-lg border ${
                          future
                            ? 'border-dashed border-border bg-muted/30 text-muted-foreground/60'
                            : active
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-muted/40 text-muted-foreground'
                        }`}
                      >
                        {future ? '·' : active ? <Check className="size-4" /> : '·'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
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