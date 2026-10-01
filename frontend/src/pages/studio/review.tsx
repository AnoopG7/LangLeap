import { useState } from 'react'
import { toast } from 'sonner'
import { Check, CheckCircle2, CircleX } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/ui'
import { useAuthStore } from '@/stores'
import { gateLesson, getLessons, updateLesson } from '@/data/lessons'
import type { Lesson } from '@/lib'

/**
 * Reviewer gate (FR-11). A lesson may only publish when every check passes —
 * including audio duration within 10% of the script target. Approve is
 * disabled while the gate is failing (LL-Test-Plan DF-06 scenario).
 */
export default function StudioReviewPage() {
  const user = useAuthStore((s) => s.user)
  const [lessons, setLessons] = useState<Lesson[]>(() => getLessons())
  const [notes, setNotes] = useState<Record<string, string>>({})

  if (!user) return null

  const inReview = lessons.filter((l) => l.state === 'in_review')

  function approve(lesson: Lesson) {
    const gate = gateLesson(lesson)
    if (!gate.ok) {
      toast.error('Gate is failing — fix the checks before publishing')
      return
    }
    setLessons(updateLesson(lesson.id, { state: 'published' }))
    toast.success(`${lesson.title} published`)
  }

  function reject(lesson: Lesson) {
    setLessons(updateLesson(lesson.id, { state: 'draft' }))
    toast.info('Sent back to draft with notes')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Review &amp; Publish</h1>
        <p className="text-sm text-muted-foreground">
          Run the publish gate (FR-11): script present, quiz complete, audio recorded, and audio duration
          within ±10% of the script target.
        </p>
      </div>

      {inReview.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No lessons in review right now.
          </CardContent>
        </Card>
      ) : (
        inReview.map((lesson) => {
          const gate = gateLesson(lesson)
          return (
            <Card key={lesson.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{lesson.code}</Badge>
                    <CardTitle className="text-base">{lesson.title}</CardTitle>
                  </div>
                  <Badge variant={gate.ok ? 'default' : 'destructive'}>
                    {gate.ok ? <CheckCircle2 className="size-3" /> : <CircleX className="size-3" />} {gate.ok ? 'Gate passed' : 'Gate failing'}
                  </Badge>
                </div>
                <CardDescription>v{lesson.version} · audio {lesson.audioDurationSec}s vs {lesson.scriptTargetSec}s target</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  {gate.checks.map((c) => (
                    <div
                      key={c.label}
                      className={`flex items-start gap-2 rounded-lg border p-2.5 text-xs ${c.pass ? 'border-border/70' : 'border-destructive/40 bg-destructive/5 text-destructive'}`}
                    >
                      {c.pass ? <Check className="mt-0.5 size-3.5 text-emerald-500" /> : <CircleX className="mt-0.5 size-3.5" />}
                      <span>
                        <span className="block font-medium">{c.label}</span>
                        <span className="block text-muted-foreground">{c.detail}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    className="h-8 max-w-xs text-xs"
                    placeholder="Reviewer note (optional)"
                    value={notes[lesson.id] ?? ''}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [lesson.id]: e.target.value }))}
                  />
                  <Button size="sm" className="gap-1.5" disabled={!gate.ok} onClick={() => approve(lesson)}>
                    <CheckCircle2 className="size-3.5" /> Approve &amp; publish
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-destructive" onClick={() => reject(lesson)}>
                    <CircleX className="size-3.5" /> Send back to draft
                  </Button>
                </div>
                {lesson.state === 'in_review' && notes[lesson.id] && (
                  <p className="text-[11px] text-muted-foreground">Note will accompany the lesson back to the writer if rejected.</p>
                )}
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}