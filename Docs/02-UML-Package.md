# LangLeap — UML Package

**Version:** 1.0  
**Date:** October 2026  
**Author:** Team LangLeap  

---

## 1. Use-Case Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           LangLeap System                                 │
│                                                                           │
│  ┌─────────────────┐   ┌──────────────────┐   ┌───────────────────────┐  │
│  │ UC-01            │   │ UC-02             │   │ UC-03                 │  │
│  │ Study Lesson     │   │ Take Quiz         │   │ View Progress         │  │
│  │  - View script   │   │  - Answer MCQs    │   │  - View streak        │  │
│  │  - Toggle gloss  │   │  - Submit quiz    │   │  - View lesson path   │  │
│  │  - Play audio    │   │  - See result     │   │  - View quiz history  │  │
│  │  - Record speech │   │  - Unlock next    │   │  - See freeze status  │  │
│  └────────┬─────────┘   └────────┬──────────┘   └───────────────────────┘  │
│           │                       │                                        │
│  ┌────────┴──────────────────────┴──────────┐                              │
│  │ UC-04  View Notifications                 │                              │
│  │  - See unread count                       │                              │
│  │  - Mark as read / Mark all read           │                              │
│  └──────────────────────────────────────────┘                              │
│                                                                           │
│  ┌──────────────────┐   ┌───────────────────┐   ┌──────────────────────┐  │
│  │ UC-05             │   │ UC-06              │   │ UC-07                │  │
│  │ Author Lesson     │   │ Record Voice       │   │ Review & Publish     │  │
│  │  - Write script   │   │  - Upload audio    │   │  - Run publish gate  │  │
│  │  - Add quiz       │   │  - Submit take     │   │  - Approve/Reject    │  │
│  │  - Add glosses    │   │  - View QA status  │   │  - Add reviewer note │  │
│  │  - Submit review  │   │                    │   │                      │  │
│  └──────────────────┘   └───────────────────┘   └──────────────────────┘  │
│                                                                           │
│  ┌──────────────────┐   ┌───────────────────┐                              │
│  │ UC-08             │   │ UC-09              │                              │
│  │ Sign In / Sign Up │   │ Sign Out           │                              │
│  │  - Email/password │   │  - Clear session   │                              │
│  │  - Role selection │   │                    │                              │
│  └──────────────────┘   └───────────────────┘                              │
└───────────────────────────────────────────────────────────────────────────┘

Actors:
  ○ Learner ────── UC-01, UC-02, UC-03, UC-04, UC-08, UC-09
  ○ Content Writer ── UC-05, UC-08, UC-09
  ○ Voice Artist ──── UC-06, UC-08, UC-09
  ○ Reviewer ──────── UC-07, UC-08, UC-09
  ○ Admin ─────────── UC-05, UC-06, UC-07, UC-08, UC-09
  ○ Product Head ──── UC-07 (read-only), UC-08, UC-09

Relationships:
  UC-02 «includes» UC-01 (quiz requires lesson content to be viewed first)
  UC-02 «extends»  UC-03 (result updates progress)
  UC-07 «includes» FR-11 Publish Gate (automated quality check)
```

---

## 2. Use-Case Descriptions

### UC-01: Study Lesson

| Field | Detail |
|---|---|
| **Actor** | Learner |
| **Precondition** | Learner is authenticated; lesson is published; lesson is unlocked (FR-07) |
| **Main Flow** | 1. Learner opens a lesson from the path. 2. System displays script lines with bilingual glosses. 3. Learner selects Hindi or Marathi gloss. 4. Learner taps play on each line to hear audio. 5. Learner proceeds to speaking practice (FR-04) or skips to quiz. |
| **Postcondition** | Learner has studied the content and is ready for the quiz. |
| **Alternate Flow** | If lesson is locked → system shows "Lesson locked" screen with prerequisite name. |

### UC-02: Take Quiz

| Field | Detail |
|---|---|
| **Actor** | Learner |
| **Precondition** | Learner has viewed the lesson content (UC-01) |
| **Main Flow** | 1. System displays quiz questions (≥ 3 MCQs). 2. Learner selects answers. 3. Learner taps "Submit quiz". 4. System calculates score = (correct/total) × 100. 5. If score ≥ 70: passed → unlock next (FR-07), update streak (FR-08), create notification. 6. If score < 70: show "retry allowed". |
| **Postcondition** | Progress record is saved; streak updated if passed. |
| **Alternate Flow** | Offline → result queued for sync (NFR-01). |

### UC-05: Author Lesson

| Field | Detail |
|---|---|
| **Actor** | Content Writer, Admin |
| **Precondition** | Authenticated with writer/admin role |
| **Main Flow** | 1. Writer creates a new lesson draft. 2. Enters English script lines. 3. Adds Hindi and Marathi glosses for each line and the hint. 4. Creates ≥ 3 quiz questions with correct answer index. 5. Submits lesson for review (state → `in_review`). |
| **Postcondition** | Lesson is in `in_review` state, visible to Reviewers. |

### UC-07: Review & Publish

| Field | Detail |
|---|---|
| **Actor** | Reviewer, Admin, Product Head |
| **Precondition** | Lesson is in `in_review` state |
| **Main Flow** | 1. Reviewer opens the review page. 2. System runs publish gate (FR-11) and displays checklist. 3a. If gate passes → Reviewer clicks "Approve & publish" → lesson state → `published`. 3b. If gate fails → Approve is disabled; Reviewer clicks "Send back to draft" with notes → state → `draft`. |
| **Postcondition** | Lesson is either published (live for learners) or returned to draft with feedback. |

---

## 3. Class Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Domain Model                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐         ┌──────────────────────────────────┐   │
│  │     User         │         │           Lesson                  │   │
│  ├──────────────────┤         ├──────────────────────────────────┤   │
│  │ - id: string     │         │ - id: string                     │   │
│  │ - email: string  │         │ - code: string                   │   │
│  │ - fullName: str  │         │ - title: string                  │   │
│  │ - role: Role     │         │ - level: A1 | A2                 │   │
│  │ - firstLang: FL  │         │ - position: number               │   │
│  │ - level: Level   │         │ - state: LessonState             │   │
│  ├──────────────────┤         │ - version: number                │   │
│  │ + signIn()       │         │ - script: ScriptLine[]           │   │
│  │ + signUp()       │         │ - hint: BilingualText            │   │
│  │ + signOut()      │         │ - quiz: QuizItem[]               │   │
│  └──────────────────┘         │ - audioUrl: string?              │   │
│          │ 1                  │ - audioDurationSec: number?      │   │
│          │                    │ - scriptTargetSec: number         │   │
│          ▼ *                  │ - reviewDecision: ReviewDecision? │   │
│  ┌──────────────────┐         │ - audioStatus: AudioStatus?      │   │
│  │ ProgressRecord   │         ├──────────────────────────────────┤   │
│  ├──────────────────┤         │ + gateLesson(): GateResult       │   │
│  │ - lessonId: str  │◄────── │ + updateLesson(): Lesson[]       │   │
│  │ - score: number  │  1..*  └──────────────────────────────────┘   │
│  │ - speakingScore  │                    │ 1                         │
│  │ - passed: bool   │                    │                           │
│  │ - attempts: num  │                    ▼ *                         │
│  │ - completedAt    │         ┌──────────────────────────────────┐   │
│  └──────────────────┘         │        ScriptLine                 │   │
│          │ *                  ├──────────────────────────────────┤   │
│          │                    │ - en: string                      │   │
│          ▼ 1                  │ - hi: string                      │   │
│  ┌──────────────────┐         │ - mr: string                      │   │
│  │     Streak       │         └──────────────────────────────────┘   │
│  ├──────────────────┤                    │                           │
│  │ - current: num   │                    ▼ *                         │
│  │ - best: number   │         ┌──────────────────────────────────┐   │
│  │ - lastDay: str   │         │        QuizItem                   │   │
│  │ - freezesUsed    │         ├──────────────────────────────────┤   │
│  │ - freezeWeek     │         │ - id: string                      │   │
│  ├──────────────────┤         │ - prompt: string                  │   │
│  │ + applyStreak()  │         │ - options: string[]               │   │
│  │ + evaluateStreak │         │ - correctIndex: number            │   │
│  └──────────────────┘         └──────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────┐         ┌──────────────────────────────────┐   │
│  │ Notification     │         │        GateResult                 │   │
│  ├──────────────────┤         ├──────────────────────────────────┤   │
│  │ - id: string     │         │ - ok: boolean                     │   │
│  │ - title: string  │         │ - checks: GateCheck[]             │   │
│  │ - message: str   │         └──────────────────────────────────┘   │
│  │ - createdAt: str │                                                │
│  │ - read: boolean  │         ┌──────────────────────────────────┐   │
│  └──────────────────┘         │      PendingSyncItem              │   │
│                               ├──────────────────────────────────┤   │
│  Enumerations:                │ - id: string                      │   │
│  «enum» LangLeapRole:        │ - userId: string                  │   │
│    learner | content_writer   │ - kind: 'quiz_result'             │   │
│    voice_artist | reviewer    │ - record: ProgressRecord          │   │
│    admin | product_head       │ - queuedAt: string                │   │
│                               └──────────────────────────────────┘   │
│  «enum» LessonState:                                                 │
│    draft | in_review |                                               │
│    published | deprecated                                            │
│                                                                      │
│  «enum» AudioStatus:                                                 │
│    draft | submitted |                                               │
│    accepted | rejected                                               │
└──────────────────────────────────────────────────────────────────────┘
```

### Cohesion & Coupling Justification

**Cohesion (High — functional cohesion within each module):**

| Module | Responsibility | Cohesion Type |
|---|---|---|
| `auth-store.ts` | Sign-in, sign-up, session management, role resolution | Functional |
| `learner.ts` | Progress CRUD, streak logic, notification management | Functional |
| `lessons.ts` | Lesson CRUD, seed data, publish gate | Functional |
| `progression.ts` | Lesson unlock state derivation, formatting utilities | Functional |
| `sync.ts` | Offline queue management (queue, flush, count) | Functional |

Each module groups operations that work on a single cohesive abstraction (user auth, learner state, lesson content, progression logic, sync queue).

**Coupling (Low — data coupling between modules):**

| From → To | Coupling Type | Justification |
|---|---|---|
| `lesson-study.tsx` → `learner.ts` | Data coupling | Passes primitive values (userId, score) to functions; no shared mutable state |
| `lesson-study.tsx` → `lessons.ts` | Data coupling | Reads lesson objects; writes via `setProgress()` not direct mutation |
| `dashboard.tsx` → `progression.ts` | Data coupling | Calls `lessonLaunchState()` with lesson + progress record |
| `auth-store.ts` → `bootstrap.ts` | Data coupling | Passes userId to seed initial learner data |
| `lesson-study.tsx` → `sync.ts` | Data coupling | Queues a `ProgressRecord` when offline |

The content pipeline (`lessons.ts`, Studio pages) and app logic (`learner.ts`, lesson-study) are **loosely coupled**: the pipeline produces `Lesson` objects with a `state` field, and the app consumes only `published` lessons. Changing the review workflow doesn't affect learner-facing logic, and vice versa.

---

## 4. Sequence Diagram — "Complete a Lesson and Unlock the Next"

```
Learner          LessonStudyPage         lessons.ts        learner.ts        sync.ts
  │                     │                     │                 │               │
  │  opens /lesson/:id  │                     │                 │               │
  │────────────────────>│                     │                 │               │
  │                     │  getLessons()       │                 │               │
  │                     │────────────────────>│                 │               │
  │                     │  <── lessons[]      │                 │               │
  │                     │                     │                 │               │
  │                     │  getProgress(userId)│                 │               │
  │                     │────────────────────────────────────-->│               │
  │                     │  <── progress{}     │                 │               │
  │                     │                     │                 │               │
  │                     │  lessonLaunchState()│                 │               │
  │                     │──── check unlock ──>│                 │               │
  │                     │  <── 'available'    │                 │               │
  │                     │                     │                 │               │
  │  [Study script, toggle gloss, play audio, record speech]   │               │
  │<───────────────────>│                     │                 │               │
  │                     │                     │                 │               │
  │  answers all quiz   │                     │                 │               │
  │  questions          │                     │                 │               │
  │────────────────────>│                     │                 │               │
  │                     │                     │                 │               │
  │                     │  submitQuiz()       │                 │               │
  │                     │───┐                 │                 │               │
  │                     │   │ score = (correct/total) × 100     │               │
  │                     │   │ passed = score ≥ 70               │               │
  │                     │<──┘                 │                 │               │
  │                     │                     │                 │               │
  │                     │  evaluateUnlock(prevPassed, score, nextPublished)     │
  │                     │────────────────────────────────────-->│               │
  │                     │  <── true (unlocked)│                 │               │
  │                     │                     │                 │               │
  │                     │  applyStreak(userId)│                 │               │
  │                     │────────────────────────────────────-->│               │
  │                     │  <── {streak, action: 'increment'}   │               │
  │                     │                     │                 │               │
  │                     │  setProgress(userId, lessonId, record)│              │
  │                     │────────────────────────────────────-->│               │
  │                     │                     │                 │               │
  │                     │  [if offline]       │                 │               │
  │                     │  queueQuizResult(userId, record)      │               │
  │                     │──────────────────────────────────────────────────────>│
  │                     │                     │                 │               │
  │                     │  addNotification()  │                 │               │
  │                     │────────────────────────────────────-->│               │
  │                     │                     │                 │               │
  │  <── ResultView     │                     │                 │               │
  │  (score, passed,    │                     │                 │               │
  │   unlocked next,    │                     │                 │               │
  │   streak info)      │                     │                 │               │
  │                     │                     │                 │               │
  │  clicks "Next       │                     │                 │               │
  │  lesson: [title]"   │                     │                 │               │
  │────────────────────>│ navigate(/lesson/next-id)             │               │
  │                     │                     │                 │               │
```

---

## 5. Activity Diagram — Learner Lesson Flow

```
                            ┌─────────┐
                            │  Start  │
                            └────┬────┘
                                 │
                                 ▼
                       ┌─────────────────┐
                       │ Select lesson   │
                       │ from path       │
                       └────────┬────────┘
                                │
                          ┌─────▼──────┐
                     ┌────┤ Published?  ├────┐
                     │ No └────────────┘ Yes │
                     ▼                       ▼
              ┌──────────┐          ┌──────────────┐
              │ Show     │     ┌────┤ Unlocked?    ├────┐
              │ "Coming  │     │ No └──────────────┘ Yes│
              │  soon"   │     ▼                        ▼
              └──────────┘  ┌──────────┐     ┌────────────────┐
                            │ Show     │     │ Study Content  │
                            │ "Locked" │     │  - View script │
                            │  screen  │     │  - Toggle gloss│
                            └──────────┘     │  - Play audio  │
                                             └───────┬────────┘
                                                     │
                                               ┌─────▼──────┐
                                          ┌────┤ Practice    ├────┐
                                          │Yes │ speaking?   │ No │
                                          ▼    └─────────────┘    │
                                   ┌──────────────┐               │
                                   │ Record lines  │               │
                                   │ (get scores)  │               │
                                   └──────┬───────┘               │
                                          │                        │
                                          ▼                        │
                                   ┌──────────────┐◄──────────────┘
                                   │  Take Quiz   │
                                   │  (answer MCQs)│
                                   └──────┬───────┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │ Submit Quiz  │
                                   │ score=(c/t)% │
                                   └──────┬───────┘
                                          │
                                    ┌─────▼──────┐
                               ┌────┤ Score ≥ 70?├────┐
                               │ No └────────────┘ Yes│
                               ▼                      ▼
                        ┌──────────┐          ┌────────────────┐
                        │ Show     │          │ Mark passed    │
                        │ "Retry"  │          │ Update streak  │
                        │ option   │          │ Unlock next    │
                        └────┬─────┘          │ Notify learner │
                             │                └───────┬────────┘
                             │                        │
                             │      ┌─────────────────┤
                             │      ▼                  ▼
                             │  ┌─────────┐    ┌──────────┐
                             │  │ Navigate │    │ Show     │
                             │  │ to next  │    │ result + │
                             │  │ lesson   │    │ path     │
                             │  └─────────┘    └──────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │ Retry quiz   │
                      │ (reset       │
                      │  answers)    │
                      └──────┬───────┘
                             │
                             └────────────► (back to Take Quiz)
```

---

## 6. State Diagram — Lesson Lifecycle

```
                      ┌───────────────────────────────────────┐
                      │           Lesson States                │
                      └───────────────────────────────────────┘

    ┌────────┐    submit for     ┌───────────┐    approve &     ┌───────────┐
    │ DRAFT  │──── review ─────>│ IN_REVIEW │───── publish ──>│ PUBLISHED │
    │        │                   │           │                  │           │
    └────┬───┘                   └─────┬─────┘                  └─────┬─────┘
         ▲                             │                              │
         │         reject with         │                              │
         └──────── notes ──────────────┘                              │
                                                                      │
                                                               deprecate
                                                                      │
                                                                      ▼
                                                              ┌──────────────┐
                                                              │  DEPRECATED  │
                                                              │  (archived)  │
                                                              └──────────────┘

    Transitions:
    1. DRAFT → IN_REVIEW:   Content writer submits lesson for review
    2. IN_REVIEW → PUBLISHED: Reviewer approves & all 6 gate checks pass (FR-11)
    3. IN_REVIEW → DRAFT:    Reviewer rejects with notes → returned for rework
    4. PUBLISHED → DEPRECATED: Admin archives a lesson (version superseded)
```

---

## 7. State Diagram — Learner Lesson Progress

```
                      ┌───────────────────────────────────────┐
                      │      Learner Progress per Lesson       │
                      └───────────────────────────────────────┘

    ┌──────────┐   prev lesson     ┌───────────┐    score ≥ 70    ┌────────┐
    │  LOCKED  │──── passed ─────>│ AVAILABLE │───────────────-->│ PASSED │
    │          │                   │           │                   │        │
    └──────────┘                   └─────┬─────┘                   └────────┘
                                         │
                                         │ score < 70
                                         │
                                         ▼
                                   ┌───────────┐
                                   │ ATTEMPTED  │──── retry ──── (back to AVAILABLE)
                                   │ (not passed)│
                                   └────────────┘

    Special case: Position 1 lesson starts as AVAILABLE (no prerequisite).
```

---

## 8. State Diagram — Audio Take Lifecycle

```
    ┌────────┐   record take    ┌───────────┐    reviewer QA     ┌──────────┐
    │ DRAFT  │────────────────>│ SUBMITTED │──── accepts ──────>│ ACCEPTED │
    │ (no    │                  │           │                     │          │
    │ audio) │                  └─────┬─────┘                     └──────────┘
    └────────┘                        │
                                      │ reviewer
                                      │ rejects
                                      ▼
                               ┌───────────┐
                               │ REJECTED  │──── re-record ──── (back to SUBMITTED)
                               └───────────┘
```

---

## 9. Consistency Check

| Diagram | Verified Against | Status |
|---|---|---|
| Use-Case (§1) | SRS FR-01 to FR-11 | ✅ Every FR maps to at least one use case |
| Class (§3) | TypeScript types in `lib/types.ts` | ✅ All domain types represented |
| Sequence (§4) | `lesson-study.tsx` `submitQuiz()` implementation | ✅ Every function call in sequence matches source |
| Activity (§5) | Learner page flow: lessons → lesson-study → progress | ✅ All paths covered |
| State — Lesson (§6) | `LessonState` enum and review.tsx transitions | ✅ All 4 states and 4 transitions present |
| State — Progress (§7) | `lessonLaunchState()` in progression.ts | ✅ 3 states match function return type |
| State — Audio (§8) | `AudioStatus` enum in types.ts | ✅ 4 states match enum values |

All diagrams are **internally consistent**: no state in the state diagram lacks a transition that the sequence or activity diagram assumes, and every use case maps to at least one functional requirement in the SRS.

---

*End of UML Package*
