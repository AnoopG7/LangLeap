// ---------------------------------------------------------------------------
// Shared TypeScript types — LangLeap Frontend
// ---------------------------------------------------------------------------
// Domain types mirror LL-SRS-1.0 (lessons, quiz, progression, studio roles).
// ---------------------------------------------------------------------------

export type LangLeapRole =
  | 'learner'
  | 'content_writer'
  | 'voice_artist'
  | 'reviewer'
  | 'admin'
  | 'product_head'

export type FirstLanguage = 'hindi' | 'marathi'

export type EnglishLevel = 'A1' | 'A2'

export type LessonState = 'draft' | 'in_review' | 'published' | 'deprecated'
export type ReviewDecision = 'accepted' | 'rejected'
export type AudioStatus = 'draft' | 'submitted' | 'accepted' | 'rejected'

/** A short string rendered in the learner's first language (FR-01 localisation). */
export interface BilingualText {
  en: string
  hi: string
  mr: string
}

/** English + the selected first-language gloss (हिंदी / मराठी). */
export function localizedText(text: BilingualText, lang: FirstLanguage): string {
  return lang === 'hindi' ? text.hi : text.mr
}

/** One script line: English to speak + native-language gloss (हिंदी / मराठी). */
export type ScriptLine = BilingualText

export interface QuizItem {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
}

export interface Lesson {
  id: string
  code: string
  title: string
  level: EnglishLevel
  position: number
  state: LessonState
  version: number
  script: ScriptLine[]
  hint: BilingualText
  quiz: QuizItem[]
  audioUrl: string | null
  audioDurationSec: number | null
  scriptTargetSec: number
  reviewDecision?: ReviewDecision
  reviewNote?: string
  audioStatus?: AudioStatus
  audioNote?: string
}

export interface User {
  id: string
  email: string
  fullName: string
  role: LangLeapRole
  firstLanguage: FirstLanguage
  level: EnglishLevel
}

export interface ProgressRecord {
  lessonId: string
  score: number
  speakingScore: number | null
  passed: boolean
  attempts: number
  completedAt: string
}

export interface Streak {
  current: number
  best: number
  lastDay: string
  freezesUsed: number
  freezeWeek: string
}

export interface LangLeapNotification {
  id: string
  title: string
  message: string
  createdAt: string
  read: boolean
}

export const PASS_THRESHOLD = 70