import { useState } from 'react'
import { toast } from 'sonner'
import { Check, Loader2, Mic, RefreshCw } from 'lucide-react'
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
    const next = updateLesson(lesson.id, { audioUrl: null, audioDurationSec: null })
    setLessons(next)
    toast.info('Take cleared — record again')
  }

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

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recorded takes</CardTitle>
          <CardDescription>Audio already attached to lessons. Recording a take again replaces it.</CardDescription>
        </CardHeader>
        <CardContent>
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
              {done.map((lesson) => {
                const ratio = (lesson.audioDurationSec ?? 0) / lesson.scriptTargetSec
                const within = ratio >= 0.9 && ratio <= 1.1
                return (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-mono text-xs">{lesson.code}</TableCell>
                    <TableCell className="font-medium">{lesson.title}</TableCell>
                    <TableCell>{lesson.audioDurationSec}s</TableCell>
                    <TableCell>
                      <Badge variant={within ? 'default' : 'destructive'}>
                        {within ? <Check className="size-3" /> : '⨯'} {ratio.toFixed(2)}×
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {(lesson.state === 'draft' || lesson.state === 'in_review') && (
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => rerecord(lesson)}>
                          <RefreshCw className="size-3.5" /> Re-record
                        </Button>
                      )}
                    </TableCell>
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