import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleX,
  Flame,
  Lock,
  Mic,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  RadioGroup,
  RadioGroupItem,
  Label,
  Separator,
} from '@/components/ui'
import { useAuthStore } from '@/stores'
import { getLessons } from '@/data/lessons'
import {
  addNotification,
  applyStreak,
  getProgress,
  getStreak,
  setProgress,
  evaluateUnlock,
  todayKey,
} from '@/data/learner'
import { lessonLaunchState } from '@/data/progression'
import { localizedText, PASS_THRESHOLD } from '@/lib'
import type { FirstLanguage } from '@/lib'
import { ensureLearnerData } from '@/data/bootstrap'

type Step = 'content' | 'speaking' | 'quiz' | 'result'

interface QuizOutcome {
  score: number
  passed: boolean
  unlockedNext: boolean
  streakAction: string
}

export default function LessonStudyPage() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)

  const lessons = getLessons()
  const lesson = lessons.find((l) => l.id === id)

  const [step, setStep] = useState<Step>('content')
  const [playingLine, setPlayingLine] = useState<number | null>(null)
  const [recordingLine, setRecordingLine] = useState<number | null>(null)
  const [lineScores, setLineScores] = useState<number[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null)
  const [gloss, setGloss] = useState<FirstLanguage>(user?.firstLanguage ?? 'hindi')

  if (!user) return null

  ensureLearnerData(user.id)

  if (!lesson) {
    return (
      <LockedScreen title="Lesson not found" message="This lesson doesn't exist." />
    )
  }

  // Narrowed immutable views used inside callbacks (TS keeps these types).
  const userId = user.id
  const activeLesson = lesson

  const progress = getProgress(userId)
  const index = lessons.findIndex((l) => l.id === lesson.id)
  const prevPassed = index <= 0 ? true : Boolean(progress[lessons[index - 1].id]?.passed)
  const launch = lessonLaunchState(lesson, progress, prevPassed)
  const publishedNext = lessons.filter((l) => l.state === 'published' && l.position > lesson.position)
    .sort((a, b) => a.position - b.position)[0]

  if (lesson.state !== 'published') {
    return (
      <LockedScreen
        title="Coming soon"
        message="This lesson is not published yet — it moves through the Content Studio pipeline first."
      />
    )
  }
  if (launch === 'locked') {
    return (
      <LockedScreen
        title="Lesson locked"
        message={`Pass "${lessons[index - 1]?.title}" first — scoring ${PASS_THRESHOLD} or more on its quiz unlocks this lesson.`}
      />
    )
  }

  const rec = progress[lesson.id]
  const speakingScore = lineScores.length === lesson.script.length
    ? Math.round(lineScores.reduce((a, b) => a + b, 0) / lineScores.length)
    : null

  function togglePlay(lineIndex: number) {
    if (playingLine === lineIndex) {
      setPlayingLine(null)
      return
    }
    setPlayingLine(lineIndex)
    window.setTimeout(() => setPlayingLine(null), 1500)
  }

  function recordLine(lineIndex: number) {
    if (recordingLine !== null) return
    setRecordingLine(lineIndex)
    window.setTimeout(() => {
      const score = 72 + Math.floor(Math.random() * 28)
      setLineScores((prev) => {
        const next = [...prev]
        next[lineIndex] = score
        return next
      })
      setRecordingLine(null)
    }, 1400)
  }

  const submitQuiz = () => {
    const total = activeLesson.quiz.length
    const correct = activeLesson.quiz.reduce(
      (acc, item) => acc + (answers[item.id] === item.correctIndex ? 1 : 0),
      0,
    )
    const score = Math.round((correct / total) * 100)
    const passed = score >= PASS_THRESHOLD

    // FR-07 decision table row: unlock ⇔ prev passed ∧ score ≥ 70 ∧ next published.
    const unlockedNext = evaluateUnlock(prevPassed, score, Boolean(publishedNext))

    let streakAction = 'none'
    if (passed) {
      const { action } = applyStreak(userId)
      streakAction = action
    }

    setProgress(userId, activeLesson.id, {
      lessonId: activeLesson.id,
      score,
      speakingScore,
      passed,
      attempts: (rec?.attempts ?? 0) + 1,
      completedAt: new Date().toISOString(),
    })

    if (passed) {
      addNotification(
        userId,
        unlockedNext ? 'Lesson complete — next unlocked' : 'Lesson complete',
        `${activeLesson.title}: ${score}%. ${unlockedNext ? `${publishedNext?.title} is now available.` : 'Great work!'}`,
      )
    } else {
      addNotification(
        userId,
        'Keep going',
        `${activeLesson.title}: you scored ${score}%. You need at least ${PASS_THRESHOLD} — review the feedback and retry.`,
      )
    }

    setOutcome({ score, passed, unlockedNext, streakAction })
    setStep('result')
  }

  const retry = () => {
    setAnswers({})
    setOutcome(null)
    setStep('quiz')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5" asChild>
          <Link to="/lessons"><ArrowLeft className="size-4" /> Lessons</Link>
        </Button>
        <Badge variant="outline">{lesson.code} · {lesson.level} · v{lesson.version}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{step === 'result' ? 'Your result' : lesson.title}</CardTitle>
          <CardDescription className="flex items-center gap-1.5 text-xs">
            <Sparkles className="size-3.5" /> {localizedText(lesson.hint, gloss)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'content' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Native-language gloss:</span>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant={gloss === 'hindi' ? 'default' : 'outline'}
                    className="h-7 text-xs"
                    onClick={() => setGloss('hindi')}
                  >
                    हिंदी
                  </Button>
                  <Button
                    size="sm"
                    variant={gloss === 'marathi' ? 'default' : 'outline'}
                    className="h-7 text-xs"
                    onClick={() => setGloss('marathi')}
                  >
                    मराठी
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {lesson.script.map((line, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2.5">
                    <Button variant="ghost" size="sm" className="size-8 shrink-0" onClick={() => togglePlay(i)} aria-label="Play line">
                      {playingLine === i ? <Volume2 className="size-4 animate-pulse" /> : <Play className="size-4" />}
                    </Button>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{line.en}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {localizedText(line, gloss)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="gap-2" onClick={() => setStep('speaking')}>
                Speaking practice <ArrowRight className="size-4" />
              </Button>
            </div>
          )}

          {step === 'speaking' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Record yourself saying each line, then play it back. This demo simulates the recording and
                pronunciation scoring (FR-05).
              </p>
              <div className="space-y-2">
                {lesson.script.map((line, i) => {
                  const done = lineScores[i] !== undefined
                  return (
                    <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-border/70 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm">{line.en}</p>
                        <p className="truncate text-xs text-muted-foreground">{localizedText(line, gloss)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {done && (
                          <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                            <Check className="size-3" /> {lineScores[i]}
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant={done ? 'outline' : 'default'}
                          className="gap-1.5"
                          disabled={recordingLine !== null}
                          onClick={() => recordLine(i)}
                        >
                          {recordingLine === i ? <Mic className="size-3.5 animate-pulse" /> : <Mic className="size-3.5" />}
                          {done ? 'Redo' : 'Record'}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Button
                  className="gap-2"
                  disabled={speakingScore === null}
                  onClick={() => setStep('quiz')}
                >
                  Continue to quiz <ArrowRight className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setStep('quiz')} disabled={recordingLine !== null}>
                  Skip speaking practice — take the quiz →
                </Button>
              </div>
            </div>
          )}

          {step === 'quiz' && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Answer all {lesson.quiz.length} questions. You need {PASS_THRESHOLD}% or more to pass and
                unlock the next lesson.
              </p>
              {lesson.quiz.map((item, i) => (
                <div key={item.id} className="space-y-3">
                  <p className="text-sm font-medium">
                    {i + 1}. {item.prompt}
                  </p>
                  <RadioGroup
                    value={answers[item.id] !== undefined ? String(answers[item.id]) : undefined}
                    onValueChange={(v) => setAnswers((prev) => ({ ...prev, [item.id]: Number(v) }))}
                    className="grid gap-2"
                  >
                    {item.options.map((opt, oi) => (
                      <div key={oi}>
                        <RadioGroupItem value={String(oi)} id={`${item.id}-${oi}`} className="peer sr-only" />
                        <Label
                          htmlFor={`${item.id}-${oi}`}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm transition-colors peer-checked:border-primary peer-checked:bg-primary/5"
                        >
                          {opt}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
              <Button
                className="gap-2"
                disabled={Object.keys(answers).length !== lesson.quiz.length}
                onClick={submitQuiz}
              >
                Submit quiz <ArrowRight className="size-4" />
              </Button>
            </div>
          )}

          {step === 'result' && outcome && (
            <ResultView outcome={outcome} nextLesson={publishedNext} onRetry={retry} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ResultView({
  outcome,
  nextLesson,
  onRetry,
}: {
  outcome: QuizOutcome
  nextLesson?: { id: string; title: string } | undefined
  onRetry: () => void
}) {
  const navigate = useNavigate()
  const streak = getStreak(useAuthStore.getState().user?.id ?? '')
  const streakedToday = streak.lastDay === todayKey()

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className={`flex size-14 items-center justify-center rounded-xl ${outcome.passed ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
          {outcome.passed ? <CheckCircle2 className="size-8" /> : <CircleX className="size-8" />}
        </div>
        <div>
          <p className="text-4xl font-bold">{outcome.score}%</p>
          <p className="text-sm text-muted-foreground">pass threshold ≥ {PASS_THRESHOLD}</p>
        </div>
        <Badge variant={outcome.passed ? 'default' : 'secondary'}>
          {outcome.passed ? 'Passed' : 'Not yet — retry allowed'}
        </Badge>
      </div>

      <Separator />

      <div className="space-y-2 text-sm">
        {outcome.unlockedNext && nextLesson ? (
          <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-emerald-700 dark:text-emerald-300">
            <Sparkles className="mt-0.5 size-4 shrink-0" />
            You unlocked <strong>{nextLesson.title}</strong> — it's now available in your path.
          </p>
        ) : outcome.passed ? (
          <p className="rounded-lg bg-muted/50 p-3">Lesson passed. {nextLesson ? 'There is another lesson waiting next.' : 'You have reached the end of the published path.'}</p>
        ) : (
          <p className="rounded-lg bg-muted/50 p-3">Review the lines, retry the quiz, and aim for {PASS_THRESHOLD}+.</p>
        )}
        {streakedToday && outcome.passed && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Flame className="size-3.5 text-primary" /> Streak: {streak.current} day{streak.current === 1 ? '' : 's'} (best {streak.best})
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {outcome.passed ? (
          nextLesson && outcome.unlockedNext ? (
            <Button className="gap-2" onClick={() => navigate(`/lesson/${nextLesson.id}`)}>
              Next lesson: {nextLesson.title} <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button asChild><Link to="/lessons">Back to lessons</Link></Button>
          )
        ) : (
          <Button className="gap-2" onClick={onRetry}><RotateCcw className="size-4" /> Try again</Button>
        )}
        <Button variant="outline" asChild><Link to="/progress">View progress</Link></Button>
      </div>
    </div>
  )
}

function LockedScreen({ title, message }: { title: string; message: string }) {
  return (
    <div className="mx-auto max-w-md text-center space-y-4 py-16">
      <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Lock className="size-7" />
      </div>
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" asChild>
        <Link to="/lessons"><ArrowLeft className="size-4 mr-2" /> Back to lessons</Link>
      </Button>
    </div>
  )
}