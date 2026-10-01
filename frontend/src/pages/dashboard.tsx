import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  FileEdit,
  Flame,
  Languages,
  Mic,
  Plus,
  Sparkles,
  Star,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { useAuthStore } from '@/stores'
import { getLessons } from '@/data/lessons'
import { getProgress, getStreak, freezeAvailableThisWeek } from '@/data/learner'
import { lessonLaunchState } from '@/data/progression'
import { formatDate, formatScore } from '@/data/progression'
import { ROLE_LABELS, canAccessPath } from '@/data/users'
import { ensureLearnerData } from '@/data/bootstrap'
import { PASS_THRESHOLD } from '@/lib'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  if (!user) return null

  // ── Learner dashboard ──────────────────────────────────────────────────────
  if (user.role === 'learner') {
    ensureLearnerData(user.id)
    const lessons = getLessons()
    const progress = getProgress(user.id)
    const streak = getStreak(user.id)

    const passed = Object.values(progress).filter((p) => p.passed).length
    const published = lessons.filter((l) => l.state === 'published')
    const current =
    published.find((l, i) =>
      lessonLaunchState(l, progress, i === 0 ? true : Boolean(progress[published[i - 1].id]?.passed)) === 'available') ??
    // Once every published lesson is passed the path has no "available" step —
    // surface the most recent one so the demo still has an obvious next action.
    [...published].reverse().find((l) => progress[l.id]?.passed)

    const lastResults = Object.entries(progress)
      .map(([lessonId, rec]) => ({ ...rec, lessonId }))
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
      .slice(0, 5)

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user.fullName}</h1>
            <p className="text-sm text-muted-foreground">
              English for {user.firstLanguage === 'hindi' ? 'Hindi' : 'Marathi'} speakers · {user.level} level
            </p>
          </div>
          {current && (
            <Button className="gap-2" onClick={() => navigate(`/lesson/${current.id}`)}>
              <BookOpen className="size-4" />
              {progress[current.id]?.passed ? `Review lesson ${current.code}` : `Continue lesson ${current.code}`}
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5 text-xs">
                <Flame className="size-3.5 text-primary" /> Current streak
              </CardDescription>
              <CardTitle className="text-3xl">{streak.current} day{streak.current === 1 ? '' : 's'}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Best: {streak.best} · Freeze: {freezeAvailableThisWeek(streak) ? 'available' : 'used this week'}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="size-3.5 text-primary" /> Lessons passed
              </CardDescription>
              <CardTitle className="text-3xl">{passed}<span className="text-lg text-muted-foreground"> / {published.length}</span></CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">published lessons in your path</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5 text-xs">
                <Languages className="size-3.5 text-primary" /> Quiz pass rule
              </CardDescription>
              <CardTitle className="text-3xl">≥ {PASS_THRESHOLD}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">score needed to unlock the next lesson</CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">On the path</CardTitle>
            <CardDescription>Published lessons in order. Pass a lesson to unlock the next (FR-07).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {published.map((l, i) => {
                const prevPassed = i === 0 ? true : Boolean(progress[published[i - 1].id]?.passed)
                const state = lessonLaunchState(l, progress, prevPassed)
                return (
                  <Button
                    key={l.id}
                    variant={state === 'passed' ? 'outline' : state === 'available' ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-1.5"
                    disabled={state === 'locked'}
                    onClick={() => navigate(`/lesson/${l.id}`)}
                  >
                    {state === 'passed' ? (
                      <Check className="size-3.5" />
                    ) : state === 'available' ? (
                      <BookOpen className="size-3.5" />
                    ) : (
                      <Sparkles className="size-3.5" />
                    )}
                    {l.code}
                    {state === 'passed' && formatScore(progress[l.id]?.score ?? 0)}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent results</CardTitle>
            <CardDescription>Your latest quiz attempts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lesson</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lastResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                      No lessons attempted yet — start with the first published lesson.
                    </TableCell>
                  </TableRow>
                ) : (
                  lastResults.map((r) => {
                    const lesson = lessons.find((l) => l.id === r.lessonId)
                    return (
                      <TableRow key={r.lessonId}>
                        <TableCell className="font-medium">{lesson?.title ?? r.lessonId}</TableCell>
                        <TableCell>{formatScore(r.score)}</TableCell>
                        <TableCell>
                          {r.passed ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              <Check className="size-3" /> Passed
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Retry open</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(r.completedAt)}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Studio dashboard (writer / artist / reviewer / admin / product head) ──
  const lessons = getLessons()
  const published = lessons.filter((l) => l.state === 'published').length
  const drafts = lessons.filter((l) => l.state === 'draft').length
  const inReview = lessons.filter((l) => l.state === 'in_review').length
  const needVoice = lessons.filter(
    (l) => (l.state === 'draft' || l.state === 'in_review') && !l.audioUrl,
  ).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Content Studio</h1>
        <p className="text-sm text-muted-foreground">
          Hello, {user.fullName} ({ROLE_LABELS[user.role]}).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs"><Sparkles className="size-3.5 text-primary" /> Published</CardDescription>
            <CardTitle className="text-3xl">{published}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">live for learners</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs"><FileEdit className="size-3.5 text-primary" /> Drafts</CardDescription>
            <CardTitle className="text-3xl">{drafts}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">awaiting authoring</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs"><CheckCircle2 className="size-3.5 text-primary" /> In review</CardDescription>
            <CardTitle className="text-3xl">{inReview}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">needs the reviewer gate</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs"><Mic className="size-3.5 text-primary" /> Need voice</CardDescription>
            <CardTitle className="text-3xl">{needVoice}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">awaiting recording</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick actions</CardTitle>
          <CardDescription>Jump into the pipeline stages open to your role.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {canAccessPath(user.role, '/studio/content') && (
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link to="/studio/content"><Plus className="size-4" /> Author / edit lessons</Link>
            </Button>
          )}
          {canAccessPath(user.role, '/studio/voice') && (
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link to="/studio/voice"><Mic className="size-4" /> Record voice</Link>
            </Button>
          )}
          {canAccessPath(user.role, '/studio/review') && (
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link to="/studio/review"><CheckCircle2 className="size-4" /> Review &amp; publish</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pipeline health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Star className="size-3.5 text-primary" /> Published vs total</span>
            <span>{published} / {lessons.length}</span>
          </div>
          <Progress value={(published / lessons.length) * 100} className="h-2" />
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowRight className="size-3.5" />
            Lessons move draft → in review → published only after the FR-11 gate passes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}