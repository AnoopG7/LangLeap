import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, FileEdit, Loader2, Mic, Pencil, Plus, Send, Trash2 } from 'lucide-react'
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@/components/ui'
import { useAuthStore } from '@/stores'
import { getLessons, saveLessons, targetFor } from '@/data/lessons'
import type { BilingualText, Lesson, LessonState, QuizItem, ScriptLine } from '@/lib'

interface DraftQuizItem {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
}

interface DraftForm {
  id: string | null
  title: string
  level: 'A1' | 'A2'
  hintEn: string
  hintHi: string
  hintMr: string
  scriptEn: string
  scriptHi: string
  scriptMr: string
  quiz: DraftQuizItem[]
}

const emptyQuestion = (): DraftQuizItem => ({
  id: `draft-q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  prompt: '',
  options: ['', '', '', ''],
  correctIndex: 0,
})

function splitLines(raw: string): string[] {
  return raw.split('\n').map((s) => s.trim()).filter(Boolean)
}

export default function StudioContentPage() {
  const user = useAuthStore((s) => s.user)
  const [lessons, setLessons] = useState<Lesson[]>(() => getLessons())
  const [form, setForm] = useState<DraftForm | null>(null)
  const [saving, setSaving] = useState(false)

  if (!user) return null
  const isAdmin = user.role === 'admin'

  function newDraft() {
    setForm({
      id: null,
      title: '',
      level: 'A1',
      hintEn: '',
      hintHi: '',
      hintMr: '',
      scriptEn: '',
      scriptHi: '',
      scriptMr: '',
      quiz: [emptyQuestion()],
    })
  }

  function editDraft(lesson: Lesson) {
    setForm({
      id: lesson.id,
      title: lesson.title,
      level: lesson.level,
      hintEn: lesson.hint.en,
      hintHi: lesson.hint.hi,
      hintMr: lesson.hint.mr,
      scriptEn: lesson.script.map((l) => l.en).join('\n'),
      scriptHi: lesson.script.map((l) => l.hi).join('\n'),
      scriptMr: lesson.script.map((l) => l.mr).join('\n'),
      quiz: lesson.quiz.map((q) => ({ id: q.id, prompt: q.prompt, options: [...q.options], correctIndex: q.correctIndex })),
    })
  }

  function saveDraft() {
    if (!form) return
    setSaving(true)
    window.setTimeout(() => {
      const quiz: QuizItem[] = form.quiz
        .filter((q) => q.prompt.trim() && q.options.some((o) => o.trim()))
        .map((q) => ({
          id: q.id,
          prompt: q.prompt.trim(),
          options: q.options.map((o) => o.trim()),
          correctIndex: q.correctIndex,
        }))
      const scriptEn = splitLines(form.scriptEn)
      const scriptHi = splitLines(form.scriptHi)
      const scriptMr = splitLines(form.scriptMr)

      if (!form.title.trim()) {
        setSaving(false)
        toast.error('Title is required')
        return
      }
      if (scriptEn.length < 2) {
        setSaving(false)
        toast.error('Add at least 2 English script lines')
        return
      }
      if (!(scriptHi.length === scriptEn.length && scriptMr.length === scriptEn.length)) {
        setSaving(false)
        toast.error('Hindi and Marathi translations must have one line per English line')
        return
      }
      if (scriptHi.some((s) => !s) || scriptMr.some((s) => !s)) {
        setSaving(false)
        toast.error('Gloss every line in both Hindi (हिंदी) and Marathi (मराठी)')
        return
      }
      if (quiz.length < 3) {
        setSaving(false)
        toast.error('Add at least 3 quiz questions (FR-11 gate)')
        return
      }
      if (!form.hintEn.trim() || !form.hintHi.trim() || !form.hintMr.trim()) {
        setSaving(false)
        toast.error('Add the lesson hint in English, Hindi and Marathi')
        return
      }

      const script: ScriptLine[] = scriptEn.map((en, i) => ({ en, hi: scriptHi[i], mr: scriptMr[i] }))
      const hint: BilingualText = { en: form.hintEn.trim(), hi: form.hintHi.trim(), mr: form.hintMr.trim() }

      const all = getLessons()
      let next: Lesson[]
      if (form.id) {
        next = all.map((l) =>
          l.id === form.id
            ? { ...l, title: form.title.trim(), level: form.level, hint, script, quiz, version: l.version + 1 }
            : l,
        )
      } else {
        const nextLesson: Lesson = {
          id: `l-${Date.now()}`,
          code: `LL-${String(all.length + 1).padStart(2, '0')}`,
          title: form.title.trim(),
          level: form.level,
          position: all.length + 1,
          state: 'draft',
          version: 1,
          script,
          hint,
          quiz,
          audioUrl: null,
          audioDurationSec: null,
          scriptTargetSec: targetFor(script),
        }
        next = [...all, nextLesson]
      }
      saveLessons(next)
      setLessons(next)
      setForm(null)
      setSaving(false)
      toast.success(form.id ? 'Draft updated' : 'Draft created')
    }, 350)
  }

  function submitForReview(id: string) {
    setLessons(updateLessonBilingual(id, { state: 'in_review' }))
    toast.success('Submitted for review')
  }

  function deprecate(id: string) {
    setLessons(updateLessonBilingual(id, { state: 'deprecated' }))
    toast.success('Lesson deprecated')
  }

  function deleteDraft(id: string) {
    const next = getLessons().filter((l) => l.id !== id)
    saveLessons(next)
    setLessons(next)
    toast.info('Draft deleted')
  }

  const stateBadge = (s: LessonState) => (
    <Badge variant={s === 'published' ? 'default' : s === 'in_review' ? 'outline' : 'secondary'}>
      {s === 'in_review' ? 'in review' : s}
    </Badge>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Content Authoring</h1>
          <p className="text-sm text-muted-foreground">
            Script each line in English and gloss it in Hindi (हिंदी) &amp; Marathi (मराठी). Drafts go to
            review, then to voice recording (FR-03, FR-11 gate).
          </p>
        </div>
        <Button className="gap-2" onClick={newDraft}><Plus className="size-4" /> New lesson</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lesson</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Gloss</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Audio</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lessons.map((lesson) => (
            <TableRow key={lesson.id}>
              <TableCell className="font-mono text-xs">{lesson.code}</TableCell>
              <TableCell className="font-medium">{lesson.title}</TableCell>
              <TableCell>
                {lesson.script.every((l) => l.hi && l.mr) ? (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-3.5 text-emerald-500" /> हिंदी + मराठी
                  </span>
                ) : (
                  <span className="text-xs text-amber-600 dark:text-amber-400">incomplete</span>
                )}
              </TableCell>
              <TableCell>{stateBadge(lesson.state)}</TableCell>
              <TableCell>v{lesson.version}</TableCell>
              <TableCell>
                {lesson.audioUrl ? (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Mic className="size-3.5" /> {lesson.audioDurationSec}s
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">none</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1.5">
                  {lesson.state === 'draft' && (
                    <>
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => editDraft(lesson)}>
                        <Pencil className="size-3.5" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => submitForReview(lesson.id)}>
                        <Send className="size-3.5" /> Submit
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-1.5 text-destructive" onClick={() => deleteDraft(lesson.id)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </>
                  )}
                  {lesson.state === 'published' && isAdmin && (
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deprecate(lesson.id)}>
                      Deprecate
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={form !== null} onOpenChange={(open) => !open && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileEdit className="size-4" /> {form?.id ? 'Edit draft' : 'New lesson draft'}
            </DialogTitle>
            <DialogDescription>
              Writers script the lesson and gloss every line in Hindi (हिंदी) &amp; Marathi (मराठी). Minimum
              3 questions and a fully-glossed script pass the FR-11 gate.
            </DialogDescription>
          </DialogHeader>
          {form && (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <div className="grid gap-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Lesson title" />
                </div>
                <div className="grid gap-2">
                  <Label>Level</Label>
                  <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v as 'A1' | 'A2' })}>
                    <SelectTrigger className="w-24"><SelectValue placeholder="A1" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A1">A1</SelectItem>
                      <SelectItem value="A2">A2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Lesson hint — English / हिंदी / मराठी</Label>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input value={form.hintEn} onChange={(e) => setForm({ ...form, hintEn: e.target.value })} placeholder="English hint" />
                  <Input value={form.hintHi} onChange={(e) => setForm({ ...form, hintHi: e.target.value })} placeholder="हिंदी संकेत" />
                  <Input value={form.hintMr} onChange={(e) => setForm({ ...form, hintMr: e.target.value })} placeholder="मराठी संकेत" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Script — English / हिंदी / मराठी (same number of lines)</Label>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="grid gap-1.5">
                    <span className="text-xs text-muted-foreground">English</span>
                    <Textarea rows={4} value={form.scriptEn} onChange={(e) => setForm({ ...form, scriptEn: e.target.value })} placeholder={'Hello!\nHow are you today?'} />
                  </div>
                  <div className="grid gap-1.5">
                    <span className="text-xs text-muted-foreground">हिंदी</span>
                    <Textarea rows={4} value={form.scriptHi} onChange={(e) => setForm({ ...form, scriptHi: e.target.value })} placeholder={'नमस्ते!\nआप कैसे हैं?'} />
                  </div>
                  <div className="grid gap-1.5">
                    <span className="text-xs text-muted-foreground">मराठी</span>
                    <Textarea rows={4} value={form.scriptMr} onChange={(e) => setForm({ ...form, scriptMr: e.target.value })} placeholder={'नमस्कार!\nतुम्ही कसे आहात?'} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Quiz questions</Label>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setForm({ ...form, quiz: [...form.quiz, emptyQuestion()] })}>
                    <Plus className="size-3.5" /> Add question
                  </Button>
                </div>
                {form.quiz.map((q, qi) => (
                  <div key={q.id} className="space-y-2 rounded-lg border border-border/70 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        value={q.prompt}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            quiz: form.quiz.map((x) => (x.id === q.id ? { ...x, prompt: e.target.value } : x)),
                          })
                        }
                        placeholder={`Question ${qi + 1}`}
                      />
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setForm({ ...form, quiz: form.quiz.filter((x) => x.id !== q.id) })}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={q.correctIndex === oi}
                          onChange={() =>
                            setForm({
                              ...form,
                              quiz: form.quiz.map((x) => (x.id === q.id ? { ...x, correctIndex: oi } : x)),
                            })
                          }
                        />
                        <Input
                          value={opt}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              quiz: form.quiz.map((x) => (x.id === q.id ? { ...x, options: x.options.map((o, k) => (k === oi ? e.target.value : o)) } : x)),
                            })
                          }
                          placeholder={`Option ${oi + 1}${q.correctIndex === oi ? ' (correct)' : ''}`}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
            <Button onClick={saveDraft} disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              <CheckCircle2 className="size-4" /> Save draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Submit/review/deprecate act on the full lesson (script/hint stay intact).
function updateLessonBilingual(id: string, patch: Partial<Lesson>): Lesson[] {
  const lessons = getLessons()
  const next = lessons.map((l) => (l.id === id ? { ...l, ...patch, version: l.version + 1 } : l))
  saveLessons(next)
  return next
}