# Software Requirements Specification (SRS)

## Project: **LangLeap** — English Language Learning App for Hindi & Marathi Speakers

| Field              | Value |
| ------------------ | ------------------------------------------------------------------ |
| Document number    | LL-SRS-1.0                                                            |
| Prepared by        | Anoop (sole contributor — Requirements, Design, QA)                |
| Date               | 01 Oct 2026                                                          |
| Status             | Approved                                                             |
| Related documents | LL-UML-Package-1.0 · LL-Project-Plan-1.0 · LL-Estimation-Sheet-1.0 · LL-Test-Plan-1.0 · LL-Risk-Register-1.0 |

---

## Revision History

| Version | Date       | Author | Summary of Changes                              |
| ------- | ---------- | ------ | ----------------------------------------------- |
| 0.1     | 25 Sep 2026 | Anoop  | Draft scope, FR list, NFR list                   |
| 1.0     | 01 Oct 2026 | Anoop  | Approved — measurable NFR targets, MoSCoW, traceability matrix |

All revisions authored and reviewed by the single project contributor.

---

## Approvals

| Role      | Name  | Signature / Decision |
| --------- | ----- | --------------------- |
| Sole contributor, Product Owner, QA   | Anoop | Approved for planning, build and test |

---

## Table of Contents

1. Introduction
2. Overall Description & Context
3. Scope & References
4. Functional Requirements — Detailed Specifications
5. Non-Functional Requirements — Measurable Targets
6. Constraints & Assumptions
7. Priorities (MoSCoW)
8. Traceability Matrix (FR → Test Case)

---

## 1. Introduction

### 1.1 Purpose

This SRS specifies **LangLeap**, an English-learning mobile app for adult learners whose
first language is **Hindi** or **Marathi**. The app teaches English through short daily
lessons, speaking practice and quizzes, and depends on a **content pipeline** (writers,
voice artists, reviewers, developers) that is deliberately decoupled from the learner app.

The product head requires **120 lessons at launch**. The content team has produced
**35 lessons in 8 weeks**, so the launch must respect the measured content rate, the
measured voice-recording rate and the 20-week app build (see LL-Estimation-Sheet-1.0).

### 1.2 Product Scope Summary

- Learner-facing: daily lesson, speaking practice, quiz, progression, streaks, offline mode, reminders.
- Content-facing: lesson authoring, voice asset management, automated QA gate, review & publish workflow.
- Exactly **11 functional requirements** and **6 non-functional requirements**, each NFR carrying a measurable target.
- Budget: ₹35 lakh. Timeline: 6 months (~26 weeks).

### 1.3 Intended Audience

Learners (Hindi/Marathi speakers), content writers, voice artists, the product head, developers,
and reviewers of this document (the single contributor).

### 1.4 Implementation Status

Planning phase — v1.0 approved; build to be tracked against LL-Project-Plan-1.0.

---

## 2. Overall Description & Context

### 2.1 Product Perspective

LangLeap is a new product (greenfield). It consists of two coupled-but-separate systems:

1. **Learner App** (mobile) — daily lessons, speaking practice, quizzes, streaks, offline sync.
2. **Content Studio** (web) — writers author lessons, voice artists attach narration, reviewers
   approve; automated gates validate quality before anything is published to the app.

**Loose coupling (high-level):** the content pipeline produces *versioned, published* lesson
packages; the app consumes only those packages. No lesson is reached through app code, and
no pipeline change requires an app release (see LL-UML-Package-1.0 §6).

### 2.2 User Classes & Characteristics

| Class                 | Description                                                              | Skill/effort                     |
| --------------------- | ------------------------------------------------------------------------ | -------------------------------- |
| Learner              | Hindi- or Marathi-speaking adult, low-to-mid English level (A1–A2)        | Uses app each day, 5–15 min       |
| Content writer       | Writes daily-lesson scripts, vocabulary and quiz items                    | Trained on the Content Studio     |
| Voice artist         | Records English narration per lesson; one artist, ≤ 15 h/week (given)     | Uploads audio via Studio          |
| Reviewer / QA        | Reviews lesson content & audio against the quality gate                   | Approves or rejects for rework    |
| Product head / Admin | Manages catalog, publishes, reviews analytics                             | Admin workspace                   |

### 2.3 Operating Environment

- Mobile app: Android (primary, mid-range), iOS as secondary (variable).
- Content Studio: modern web browsers.
- Backend: cloud-hosted API + object storage for audio; content delivered via versioned packages.
- Offline: lessons download locally; quiz attempts queue and sync on reconnect.

### 2.4 Design & Implementation Constraints

- Content is **data, not code**; lesson packages are schema-versioned and versioned.
- Launch content target is **120 lessons** (given).
- Voice recording **1.5 h per lesson**, one voice artist, **15 h/week** (given).
- App development **20 weeks** (given).
- Budget **₹35 lakh**; schedule ≤ **6 months** (given).

### 2.5 Assumptions & Dependencies

- Content throughput stays constant at the measured 4.375 lessons/week.
- A single voice artist sustains 15 h/week throughput.
- No requirement for in-app payments in v1 (out of scope).
- Autogenerated audio (TTS) is a possible contingency, not a v1 dependency.

---

## 3. Scope & References

### 3.1 In Scope

Daily lessons, speaking practice, quiz engine, lesson unlock & progression, streaks,
offline mode & sync, notifications, content authoring, voice asset management, review/publish QA gate, admin analytics.

### 3.2 Out of Scope

- Payment/subscription billing.
- Full gamified social network (markets, leaderboards vs. friends).
- Video lessons.
- Classrooms / tutor scheduling.

### 3.3 References

LL-ProblemStatement (given figures), LL-Estimation-Sheet-1.0, LL-Project-Plan-1.0,
LL-UML-Package-1.0, LL-Test-Plan-and-Evidence-1.0.

---

## 4. Functional Requirements — Detailed Specifications

Each FR has an ID, a MODULE, a description and its priority. IDs are referenced by the
Project Plan and the Traceability Matrix (§8) and traced to test cases in
LL-Test-Plan-and-Evidence-1.0.

### MODULE 1: Onboarding & Profile

#### FR-01 — Learner Sign-up & Language Preference

- Shall allow a learner to register with email/mobile, choose their first language (**Hindi** or **Marathi**) and a starting English level.
- Preference is stored with the profile and used to localise UI hints.

#### FR-02 — Daily Lesson Delivery

- Shall offer **one short daily lesson** (target 5–10 min) per learner from the published catalog, sequenced by level and lesson position.
- A learner completes exactly one "lesson of the day" per calendar day.

### MODULE 2: Lesson Content & Voice Assets (Content Studio)

#### FR-03 — Lesson Authoring

- Shall let a content writer create a lesson with: title, level, script, vocabulary lists, playback script for voice artist, and quiz items.
- Lessons exist in states: `draft → in_review → published → deprecated` (never edited in place; new version created instead).

#### FR-04 — Voice Asset Management

- Shall let a voice artist upload narration audio for a lesson, tagged with lesson version, duration and language.
- An audio asset is accepted only if its duration is within the lesson script's tolerance (see NFR-04 quality gate).

### MODULE 3: Speaking Practice & Quiz

#### FR-05 — Speaking Practice

- Shall play the lesson audio and allow the learner to record a repeat attempt (chunked per sentence).
- Practice attempts are stored on-device until sync; audio auto-expires (see NFR-06).

#### FR-06 — Quiz Engine

- Shall present the lesson quiz (multiple-choice), score responses on a **0–100 integer scale** and return the score immediately.
- A quiz is **passed** when `score ≥ 70` (threshold configurable, stored with the quiz rules).

#### FR-07 — Lesson Unlock & Progression

- Shall unlock the next lesson only when the current lesson is **completed** and its quiz is **passed** (`score ≥ 70`) and the next lesson is **published**.
- The unlock rule is a **decision table** evaluated by a single rule service (see LL-Test-Plan §4).

### MODULE 4: Engagement & Offline

#### FR-08 — Streaks & Gamification

- Shall increment the learner's daily streak on every day a lesson is completed; freeze on one missed day (max 1 freeze/week) and reset after an unfrozen miss.
- Streak state transitions are governed by the streak decision table.

#### FR-09 — Offline Access & Sync

- Shall make today's lesson (content, audio, quiz) available **offline**, and queue quiz results and speaking attempts for sync.
- On reconnect, the sync queue shall flush automatically (targets in NFR-01).

#### FR-10 — Notifications & Reminders

- Shall send a daily lesson reminder and a streak-warning notification before streak loss; delivery is best-effort and off-boardable by the learner.

### MODULE 5: Admin & Quality

#### FR-11 — Content Review, QA Gate & Publish

- Shall route each lesson through an automated QA gate (structure, quiz validity, audio match)
  then a human review; publish only lessons that pass both.
- Publishing creates an immutable, versioned lesson package consumed by the app.

---

## 5. Non-Functional Requirements — Measurable Targets

Every NFR has an explicit, measurable target. "Fast"/"secure" without a number is unacceptable.

| ID      | Category           | Requirement & measurable target                                                                  | Verification method |
| ------- | ------------------ | ------------------------------------------------------------------------------------------------ | ------------------- |
| NFR-01  | Offline behaviour  | 100% of daily lessons (content+audio+quiz) usable with zero network; ≥ 99% of queued sync flushes within **30 s** of reconnect | Test harness + sync trials (n ≥ 50) |
| NFR-02  | Performance        | `p95` quiz-submit response ≤ **1.0 s**; `p95` audio playback start ≤ **2.0 s** on a €-mid Android reference device | Load test + device lab |
| NFR-03  | Usability          | First-time learner completes lesson **and** unlocks the next in ≤ **5 minutes** with ≤ 2 assists (usability test n ≥ 8) | Usability sessions |
| NFR-04  | Content quality    | **100%** published lessons pass the automated QA gate before publish; flagged content-error rate < **1%** per month | QA gate logs + audits |
| NFR-05  | Reliability        | Service availability ≥ **99%**; crash-free sessions ≥ **99.5%** (rolling 30 days)                 | Uptime monitor + crash reporting |
| NFR-06  | Security & privacy | Data encrypted at rest and in transit (TLS ≥ 1.2); learner speech recordings auto-deleted within **24 h** of sync (100% purge audited) | Pen tests + audit logs |

---

## 6. Constraints & Assumptions

- **C1** Budget: ₹35 lakh (fixed).
- **C2** Schedule: ≤ 6 months (~26.1 weeks at 4.33 wks/month).
- **C3** Voice: one artist, 1.5 h/lesson, 15 h/week (fixed).
- **C4** Content: 35 lessons in the first 8 weeks (measured — see Estimation Sheet).
- **C5** Content is data, never code; no lesson lives in the app binary.
- **A1** Constant content throughput; **A2** constant artist throughput;
  **A3** mid-range Android is the reference device.

---

## 7. Priorities (MoSCoW)

| ID    | Must | Should | Could | Rationale (1 line)                                                          |
| ----- | ---- | ------ | ----- | --------------------------------------------------------------------------- |
| FR-01 | ✔    |        |       | Foundation: language routing and onboarding.                                 |
| FR-02 | ✔    |        |       | Core daily-learning promise.                                                 |
| FR-03 | ✔    |        |       | Content is the constraint — authoring must exist.                            |
| FR-04 | ✔    |        |       | Voice is the second pipeline.                                                |
| FR-05 |      | ✔      |       | Value-add; can ship first without full auto-grading.                         |
| FR-06 | ✔    |        |       | Gate for progression.                                                        |
| FR-07 | ✔    |        |       | Core progression requirement.                                                |
| FR-08 |      | ✔      |       | Engagement; nice-to-have for launch.                                         |
| FR-09 | ✔    |        |       | Explicit in NFR-01; required behaviour.                                      |
| FR-10 |      | ✔      |       | Retention aid; optional at launch.                                           |
| FR-11 | ✔    |        |       | QA gate protects content quality (NFR-04).                                   |

**Resulting plan:** FR-01/02/03/04/06/07/09/11 are **Must**; FR-05/08/10 are **Should**
(tracked as stretch in LL-Project-Plan-1.0).

---

## 8. Traceability Matrix (FR → Test Case)

Test case IDs (TC-…) are defined in LL-Test-Plan-and-Evidence-1.0. NFR checks are itemised
against the non-functional tests in the same document.

| Requirement | Linked test case(s)                                     |
| ----------- | -------------------------------------------------------- |
| FR-01       | TC-AUTH-01, TC-AUTH-02                                   |
| FR-02       | TC-LESSON-01, TC-LESSON-02                               |
| FR-03       | TC-CONTENT-01, TC-CONTENT-02                             |
| FR-04       | TC-VOICE-01, TC-VOICE-02                                 |
| FR-05       | TC-SPEAK-01                                              |
| FR-06       | TC-QUIZ-BVA-01…TC-QUIZ-BVA-07 (BVA on threshold)         |
| FR-07       | TC-UNLOCK-DT-01…TC-UNLOCK-DT-08 (decision table)         |
| FR-08       | TC-STREAK-DT-01…TC-STREAK-DT-08 (decision table)         |
| FR-09       | TC-OFFLINE-01, TC-SYNC-01                                |
| FR-10       | TC-NOTIFY-01                                             |
| FR-11       | TC-GATE-01, TC-GATE-02                                   |
| NFR-01      | NF-OFF-01…NF-OFF-03                                      |
| NFR-02      | NF-PERF-01…NF-PERF-02                                    |
| NFR-03      | NF-USAB-01                                               |
| NFR-04      | NF-QUAL-01…NF-QUAL-02                                    |
| NFR-05      | NF-REL-01                                                |
| NFR-06      | NF-SEC-01…NF-SEC-02                                      |

*Each FR is satisfied only when all linked test cases pass with zero open Must/Should defects
(DRE computed in LL-Test-Plan-and-Evidence-1.0 §7).*