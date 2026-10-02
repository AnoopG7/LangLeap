import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Check, CheckCircle2, CircleX, Loader2, Mic, RefreshCw, Send } from 'lucide-react'
import {
  Badge,
  Button,
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
import { getLessons, updateLesson } from '@/data/lessons'
import type { Lesson } from '@/lib'

/**
 * Voice artist page (FR-04). Recording is simulated in this frontend-only
 * build: a 1.4 s “take” lands a recorded duration within ~±31% of the script
 * target so the reviewer gate can exercise its 10% tolerance rule (DF-06).
 */
export default function StudioVoicePage() {
  const user = useAuthStore((s) => s.user)
  const [lessons, setLessons] = useState<Lesson[]>(() => getLessons())
  const [recordingId, setRecordingId] = useState<string | null>(null)

  if (!user) return null

  const needsVoice = lessons.filter(
    (l) => (l.state === 'draft' || l.state === 'in_review') && !l.audioUrl,
  )
  const done = lessons.filter((l) => l.audioUrl)
  const recordedDrafts = done.filter((lesson) => getAudioStatus(lesson) === 'draft')
  const submittedTakes = done.filter((lesson) => getAudioStatus(lesson) === 'submitted')
  const acceptedTakes = done.filter((lesson) => getAudioStatus(lesson) === 'accepted')
  const rejectedTakes = done.filter((lesson) => getAudioStatus(lesson) === 'rejected')

  function record(lesson: Lesson) {
    if (recordingId) return
    setRecordingId(lesson.id)
    window.setTimeout(() => {
      const factors = [0.96, 1.02, 1.08, 1.31] // occasionally produce the +31% DF-06 case
      const factor = factors[Math.floor(Math.random() * factors.length)]
      const duration = Math.max(10, Math.round(lesson.scriptTargetSec * factor))
      const next = updateLesson(lesson.id, {
        audioUrl: `mock-audio/${lesson.id}`,
        audioDurationSec: duration,
        audioStatus: 'draft',
        audioNote: '',
      })
      setLessons(next)
      setRecordingId(null)
      if (factor > 1.1) {
        toast.warning(`Take saved — duration ${factor.toFixed(2)}× target is over the 10% review tolerance`)
      } else {
        toast.success('Take recorded and ready for review')
      }
    }, 1400)
  }

  function rerecord(lesson: Lesson) {
    const next = updateLesson(lesson.id, {
      audioUrl: null,
      audioDurationSec: null,
      audioStatus: 'draft',
      audioNote: '',
    })
    setLessons(next)
    toast.info('Take cleared — record again')
  }

  function submitAudio(lesson: Lesson) {
    setLessons(updateLesson(lesson.id, { audioStatus: 'submitted', audioNote: '' }))
    toast.success(`${lesson.title} submitted for audio QA`)
  }

  function acceptAudio(lesson: Lesson) {
    if (!isAudioAccepted(lesson)) {
      toast.error('This take is outside the ±10% duration tolerance')
      return
    }
    setLessons(updateLesson(lesson.id, { audioStatus: 'accepted', audioNote: '' }))
    toast.success(`${lesson.title} audio accepted`)
  }

  function rejectAudio(lesson: Lesson) {
    setLessons(updateLesson(lesson.id, {
      audioStatus: 'rejected',
      audioNote: 'Rejected by audio QA. Record a replacement take within the ±10% duration tolerance.',
    }))
    toast.info(`${lesson.title} audio rejected — re-record required`)
  }

  const canReviewAudio = user.role === 'reviewer' || user.role === 'admin' || user.role === 'product_head'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Voice Recording</h1>
        <p className="text-sm text-muted-foreground">
          Record each line of the script. Duration should stay within ±10% of the script target so the
          reviewer gate passes (FR-04 / FR-11).
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Mic className="size-4 text-primary" /> Needs a take
            <Badge variant="secondary">{needsVoice.length}</Badge>
          </CardTitle>
          <CardDescription>Drafts and re-reviews awaiting audio.</CardDescription>
        </CardHeader>
        <CardContent>
          {needsVoice.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nothing to record right now. Writers will add drafts for you.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lesson</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {needsVoice.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-mono text-xs">{lesson.code}</TableCell>
                    <TableCell className="font-medium">{lesson.title}</TableCell>
                    <TableCell className="text-muted-foreground">{lesson.scriptTargetSec}s target</TableCell>
                    <TableCell className="text-right">
                      {recordingId === lesson.id ? (
                        <Button size="sm" disabled><Loader2 className="animate-spin" /> Recording…</Button>
                      ) : (
                        <Button size="sm" className="gap-1.5" onClick={() => record(lesson)}>
                          <Mic className="size-3.5" /> Record
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AudioSubmissionTable
        title="Recorded drafts"
        description="New takes must be submitted before QA can accept or reject them."
        lessons={recordedDrafts}
        actionLabel="Submit for QA"
        actionIcon={<Send className="size-3.5" />}
        onAction={submitAudio}
      />
      <AudioSubmissionTable
        title="Submitted for audio QA"
        description="A reviewer, admin, or product head decides whether the take is accepted."
        lessons={submittedTakes}
        actionLabel="Accept"
        actionIcon={<CheckCircle2 className="size-3.5" />}
        onAction={acceptAudio}
        secondaryActionLabel="Reject"
        secondaryActionIcon={<CircleX className="size-3.5" />}
        onSecondaryAction={rejectAudio}
        actionsEnabled={canReviewAudio}
      />
      <AudioHistory title="Accepted takes" lessons={acceptedTakes} onRerecord={rerecord} />
      <AudioHistory title="Rejected takes" lessons={rejectedTakes} onRerecord={rerecord} />
    </div>
  )
}

function isAudioAccepted(lesson: Lesson): boolean {
  const ratio = (lesson.audioDurationSec ?? 0) / lesson.scriptTargetSec
  return ratio >= 0.9 && ratio <= 1.1
}

function getAudioStatus(lesson: Lesson): 'draft' | 'submitted' | 'accepted' | 'rejected' {
  if (lesson.audioStatus) return lesson.audioStatus
  if (lesson.state === 'published') return 'accepted'
  if (lesson.state === 'draft') return 'draft'
  return isAudioAccepted(lesson) ? 'submitted' : 'rejected'
}

function AudioSubmissionTable({
  title,
  description,
  lessons,
  actionLabel,
  actionIcon,
  onAction,
  secondaryActionLabel,
  secondaryActionIcon,
  onSecondaryAction,
  actionsEnabled = true,
}: {
  title: string
  description: string
  lessons: Lesson[]
  actionLabel: string
  actionIcon: ReactNode
  onAction: (lesson: Lesson) => void
  secondaryActionLabel?: string
  secondaryActionIcon?: ReactNode
  onSecondaryAction?: (lesson: Lesson) => void
  actionsEnabled?: boolean
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title} <Badge variant="secondary">{lessons.length}</Badge></CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {lessons.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No takes in this list.</p>
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Lesson</TableHead><TableHead>Title</TableHead><TableHead>Duration</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {lessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell className="font-mono text-xs">{lesson.code}</TableCell>
                  <TableCell className="font-medium">{lesson.title}</TableCell>
                  <TableCell>{lesson.audioDurationSec}s</TableCell>
                  <TableCell className="text-right">
                    {actionsEnabled && (
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" className="gap-1.5" onClick={() => onAction(lesson)}>{actionIcon}{actionLabel}</Button>
                        {secondaryActionLabel && onSecondaryAction && (
                          <Button size="sm" variant="outline" className="gap-1.5 text-destructive" onClick={() => onSecondaryAction(lesson)}>
                            {secondaryActionIcon}{secondaryActionLabel}
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function AudioHistory({
  title,
  lessons,
  onRerecord,
}: {
  title: string
  lessons: Lesson[]
  onRerecord: (lesson: Lesson) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title} <Badge variant="secondary">{lessons.length}</Badge></CardTitle>
        <CardDescription>
          {title === 'Accepted takes'
            ? 'Within the ±10% duration tolerance and ready for the publish gate.'
            : 'Outside the ±10% duration tolerance and needs a re-record.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {lessons.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No takes in this list.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lesson</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Tolerance</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map((lesson) => {
                const ratio = (lesson.audioDurationSec ?? 0) / lesson.scriptTargetSec
                const within = isAudioAccepted(lesson)
                return (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-mono text-xs">{lesson.code}</TableCell>
                    <TableCell className="font-medium">{lesson.title}</TableCell>
                    <TableCell>{lesson.audioDurationSec}s</TableCell>
                    <TableCell>
                      <Badge variant={within ? 'default' : 'destructive'}>
                        {within ? <Check className="size-3" /> : 'Rejected'} {ratio.toFixed(2)}×
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {(lesson.state === 'draft' || lesson.state === 'in_review') && (
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onRerecord(lesson)}>
                          <RefreshCw className="size-3.5" /> Re-record
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}