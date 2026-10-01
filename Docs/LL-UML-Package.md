# UML Package — LangLeap

## Project: **LangLeap** — English Language Learning App for Hindi & Marathi Speakers

| Field              | Value                                                       |
| ------------------ | ----------------------------------------------------------- |
| Document number    | LL-UML-Package-1.0                                          |
| Prepared by        | Anoop (sole contributor — Design)                           |
| Date               | 01 Oct 2026                                                 |
| Status             | Approved                                                    |
| Related documents | LL-SRS-1.0 (FR-02…FR-11) · LL-Test-Plan-1.0 · LL-Project-Plan-1.0 |

---

## Revision History

| Version | Date | Author | Summary                          |
| ------- | ---- | ------ | ---------------------------------- |
| 1.0     | 01 Oct 2026 | Anoop | Approved — five diagrams + coupling justification |

---

## Approvals

| Role | Name | Decision |
| ---- | ---- | -------- |
| Sole contributor, Designer | Anoop | Approved |

---

## Table of Contents

1. Consistency Statement
2. Use Case Diagram
3. Class Diagram
4. Sequence Diagram — Complete a Lesson and Unlock the Next
5. Activity Diagram — Lesson Completion with Unlock Decision
6. State Diagram — Lesson Progress & Streak
7. Cohesion & Coupling Justification

---

## 1. Consistency Statement

All five diagrams model the **same** system and the **same** named elements:

- **Actors/classes:** `Learner`, `Content Writer`, `Voice Artist`, `Reviewer`, `Admin/Product Head`.
- **Boundaries/modules:** `Learner App` and `Content Studio`, plus a shared `Rules/Progression` service.
- **The lockstep case:** FR-06 (quiz pass `score ≥ 70`) → FR-07 (unlock next) → FR-08 (streak), offline flow FR-09.
- The names in the sequence, activity and state diagrams correspond 1:1 to classes in the class diagram and to the actors/use cases.

---

## 2. Use Case Diagram

```mermaid
flowchart LR
  subgraph System["LangLeap System"]
    subgraph App["Learner App"]
      UC1["Take Daily Lesson (FR-02)"]
      UC2["Speaking Practice (FR-05)"]
      UC3["Take Quiz (FR-06)"]
      UC4["Complete & Unlock Next (FR-07)"]
      UC5["Maintain Streak (FR-08)"]
      UC6["Use Offline & Sync (FR-09)"]
    end
    subgraph Studio["Content Studio"]
      UC7["Author Lesson (FR-03)"]
      UC8["Record Voice (FR-04)"]
      UC9["Review & Publish (FR-11)"]
      UC10["Admin Analytics"]
    end
    Rules["Rules/Progression\nService"]
  end

  Learner --> UC1
  Learner --> UC2
  Learner --> UC3
  Learner --> UC4
  Learner --> UC5
  Learner --> UC6

  Writer["Content Writer"] --> UC7
  Artist["Voice Artist"] --> UC8
  Reviewer["Reviewer"] --> UC9
  Admin["Admin / Product Head"] --> UC9
  Admin --> UC10

  UC3 --> Rules
  UC4 --> Rules
  UC5 --> Rules
```

**Actors (external):** Learner, Content Writer, Voice Artist, Reviewer, Admin/Product Head.
The `Rules/Progression` service is a **system actor** shared by Related use cases to keep unlock & streak uniform (single decision tables).

---

## 3. Class Diagram

```mermaid
classDiagram
  class User {
    <<abstract>>
    +id: UUID
    +email: string
    +role: string
  }
  class Learner {
    +firstLanguage: 'hindi'|'marathi'
    +englishLevel: 'A1'|'A2'
    +currentLessonId: UUID
    +dailyStreak: int
    +bestStreak: int
    +completeLesson(): bool
  }
  class ContentWriter {
    +authorLesson(): void
  }
  class VoiceArtist {
    +uploadAudio(): void
  }
  class Reviewer {
    +approveLesson(): bool
  }

  class Lesson {
    +id: UUID
    +code: string
    +title: string
    +level: string
    +position: int
    +state: 'draft'|'in_review'|'published'|'deprecated'
    +version: int
    +scriptJson: jsonb
  }
  class AudioAsset {
    +id: UUID
    +lessonVersion: int
    +url: string
    +durationSec: int
    +accepted: bool
  }
  class QuizItem {
    +id: UUID
    +prompt: string
    +options: string[]
    +correctIndex: int
  }
  class ProgressRecord {
    +score: int
    +passed: bool
    +completedAt: timestamptz
  }
  class StreakLog {
    +day: date
    +action: 'increment'|'freeze'|'reset'
  }
  class RuleSet {
    +passThreshold: int = 70
    +maxFreezesPerWeek: int = 1
    +evaluateUnlock(prev, score, published): bool
    +evaluateStreak(...): action
  }

  User <|-- Learner
  User <|-- ContentWriter
  User <|-- VoiceArtist
  User <|-- Reviewer

  Learner "1" --> "1" ProgressRecord : owns
  ProgressRecord "1" --> "1" Lesson : for
  Learner "1" --> "0..*" StreakLog : has
  Lesson "1" --> "1..*" QuizItem : contains
  Lesson "1" --> "0..*" AudioAsset : narrated by
  Lesson "1" --> "0..1" RuleSet : governed by

  Learner ..> RuleSet : consults (unlock/streak)
  ContentWriter --> Lesson : creates
  VoiceArtist --> AudioAsset : records
  Reviewer --> Lesson : approves
```

**Key multiplicities:** one `Learner` has one `ProgressRecord` **per** lesson (ternary via `ProgressRecord(id, learner_id, lesson_id)`); one `Lesson` has many `QuizItem`s and may have an `AudioAsset` per **lesson version** (audio is version-pinned so a re-versioned script never attaches to stale audio).

---

## 4. Sequence Diagram — Complete a Lesson and Unlock the Next

Participant names map to the class diagram (`LessonApp`, `ProgressRecord`, `QuizEngine`, `RuleSet`, `UnlockService`).

```mermaid
sequenceDiagram
  autonumber
  actor L as Learner
  participant A as LessonApp
  participant Q as QuizEngine
  participant P as ProgressService
  participant R as RuleSet
  participant U as UnlockService
  participant S as StreakService

  L->>A: finish lesson content
  L->>A: submit quiz answers
  A->>Q: scoreQuiz(answers)
  Q-->>A: score (0-100)
  A->>P: recordScore(lessonId, score)
  P->>P: validate 0..100
  P->>R: evaluateUnlock(prev=completed, score, nextPublished)
  R-->>P: allowed = (score >= 70) and published
  opt allowed
    P->>U: unlockNext(lessonId)
    U-->>P: unlocked lesson = n+1
    P->>S: registerCompletion(day)
    S-->>P: streak = increment | freeze
  end
  P-->>A: result {unlocked, streak}
  A-->>L: "Lesson n+1 unlocked" + streak status
```

FR-06 → FR-07 → FR-08 in one deterministic call chain; the `RuleSet` is the **single** place both unlock and streak decisions are made (used identically by the decision tables in LL-Test-Plan §4).

---

## 5. Activity Diagram — Lesson Completion with Unlock Decision

```mermaid
flowchart TD
  START([Start: learner opens lesson]) --> ONLINE{Network?}
  ONLINE -- No --> OFF1[Load cached lesson package]
  ONLINE -- Yes --> OFF2[Load published lesson]
  OFF1 --> STUDY[Complete lesson content + speaking practice]
  OFF2 --> STUDY
  STUDY --> QUIZ[Take quiz]
  QUIZ --> SCORE{Score >= 70?}
  SCORE -- No --> RETRY[View feedback, retry allowed]
  RETRY --> QUIZ
  SCORE -- Yes --> NEXT{Next lesson published?}
  NEXT -- No --> END1([Lesson bank complete - streak still updated])
  NEXT -- Yes --> UNLOCK[Unlock next lesson]
  UNLOCK --> STREAK[Update streak: increment / freeze]
  STREAK --> QUEUE{Was offline?}
  QUEUE -- Yes --> SYNC[Queue result for sync on reconnect]
  QUEUE -- No --> END2([Done - next lesson ready])
  SYNC --> END2
```

**Note:** the `NEXT` decision (published?) is why FR-07's decision table has a third condition —
a lesson can pass but the *next* lesson may not exist in `published` yet (launch-day edge).

---

## 6. State Diagram — Lesson Progress & Streak

### 6.1 Lesson progress (per learner)

```mermaid
stateDiagram-v2
  [*] --> Locked
  Locked --> Unlocked: previous completed & passed & next published
  Unlocked --> InProgress: learner starts
  InProgress --> QuizPending: content done
  QuizPending --> InProgress: score < 70 (retry)
  QuizPending --> Completed: score >= 70
  Completed --> [*]
```

### 6.2 Streak state (per learner, calendar day)

```mermaid
stateDiagram-v2
  [*] --> Alive
  Alive --> Advanced: completed today (day n+1)
  Alive --> OnFreeze: missed day, freeze available
  OnFreeze --> Alive: completes next day
  OnFreeze --> Broken: missed again (no freeze left)
  Broken --> Alive: revives with a new lesson
  Broken --> [*]
```

Streak rules in 6.2 are exactly the rows of the **Streak decision table** (LL-Test-Plan §4.2).

---

## 7. Cohesion & Coupling Justification

### 7.1 Loose coupling between the content pipeline and the app

| Mechanism | How it decouples |
| --------- | ---------------- |
| **Content = versioned data** (FR-03, FR-11) | Lessons/quizzes/audio are stored rows + JSON, never app code. A lesson change is a **new version**, never an edit in place. |
| **QA-gated publish** (FR-11) | The app reads only `state = 'published'` packages. Draft/review churn is invisible to learners. |
| **Schema-versioned package** | App handles `schema_version`; future content shapes are additive — no forced app release. |
| **Dedicated Rules/Progression service** | Unlock & streak logic is defined in one service (decision tables), so content writers changing a lesson can never re-break progression rules. |
| **Async hand-off** | Content Studio writes; the app consumes on its own schedule (incl. offline). No shared transaction. |

**App-side effects of a content change:** none beyond the package version number. This is why the
critical path in LL-Project-Plan is dominated by **content production**, not integration.

### 7.2 Module cohesion

| Module | Responsibility (single purpose) | Cohesion strength |
| ------ | ------------------------------- | ----------------- |
| Learner App (lessons/quiz/streak) | One learner's daily loop | Functional (High) |
| Speaking & Offline sync | Capture attempts, queue, flush | Sequential (Med-High) |
| Rules/Progression service | All unlock & streak decisions in one decision-table-driven place | Functional (High) |
| Content Studio (author → review → publish) | One content lifecycle | Communicational (High) |
| Voice asset pipeline | One audio lifecycle, version-pinned to lesson | Communicational (High) |

### 7.3 Coupling assessment

- `LessonApp → RuleSet` : **control coupling kept minimal** — the app passes plain values (`score`, `previousCompleted`, `published`) and receives a decision; it cannot modify the rule base.
- `Lesson ↔ QuizItem ↔ AudioAsset` : **data coupling** via foreign keys only; no shared mutable state.
- `ContentWriter/VoiceArtist/Reviewer → Lesson` : **association coupling** through the Studio's domain object; they never touch the app codebase.

All coupling is data- or association-level; there is no content, common or stamp coupling between
the pipeline and the app. This directly answers the problem statement's requirement to show the
pipeline and app **loosely coupled** and each module **cohesive**.