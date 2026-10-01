import { Link } from 'react-router-dom'
import { BookOpen, Check, Lock, Play, RotateCcw } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui'
import { useAuthStore } from '@/stores'
import { getLessons } from '@/data/lessons'
import { getProgress } from '@/data/learner'
import { formatScore, lessonLaunchState } from '@/data/progression'
import { localizedText } from '@/lib'
import { ensureLearnerData } from '@/data/bootstrap'

export default function LessonsPage() {
  const user = useAuthStore((s) => s.user)
  if (!user) return null

  ensureLearnerData(user.id)

  const lessons = getLessons()
  const progress = getProgress(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lessons</h1>
        <p className="text-sm text-muted-foreground">
          Pass each quiz with ≥ 70 to unlock the next lesson. A lesson also unlocks only once it is published.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson, i) => {
          const prevPassed = i === 0 ? true : Boolean(progress[lessons[i - 1].id]?.passed)
          const state = lessonLaunchState(lesson, progress, prevPassed)
          const rec = progress[lesson.id]
          return (
            <Card key={lesson.id} className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant={lesson.state === 'published' ? 'default' : 'secondary'}>
                    {lesson.code} · {lesson.state === 'published' ? 'live' : lesson.state.replace('_', ' ')}
                  </Badge>
                  {state === 'passed' ? (
                    <Badge variant="outline" className="gap-1 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                      <Check className="size-3" /> {formatScore(rec?.score ?? 0)}
                    </Badge>
                  ) : state === 'locked' ? (
                    <Lock className="size-4 text-muted-foreground" />
                  ) : (
                    <BookOpen className="size-4 text-primary" />
                  )}
                </div>
                <CardTitle className="text-base">{lesson.title}</CardTitle>
                <CardDescription className="text-xs">
                  {localizedText(lesson.hint, user.firstLanguage)} <span className="text-muted-foreground/70">· {user.firstLanguage === 'hindi' ? 'हिंदी' : 'मराठी'}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  {lesson.quiz.length} questions · {lesson.script.length} lines
                </span>
                {state === 'passed' ? (
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/lesson/${lesson.id}`}><RotateCcw className="size-3.5 mr-1.5" /> Retake</Link>
                  </Button>
                ) : state === 'available' ? (
                  <Button size="sm" className="gap-1.5" asChild>
                    <Link to={`/lesson/${lesson.id}`}><Play className="size-3.5" /> {rec ? 'Continue' : 'Start'}</Link>
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" disabled>
                    {lesson.state !== 'published' ? 'Coming soon' : 'Locked'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}