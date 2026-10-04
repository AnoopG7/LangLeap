# LangLeap — Software Requirements Specification (SRS)

**Version:** 1.0  
**Date:** October 2026  
**Author:** Team LangLeap  

---

## 1. Introduction

### 1.1 Purpose

This document specifies the functional and non-functional requirements for **LangLeap**, a mobile-first language-learning application that teaches English to native Hindi and Marathi speakers through short daily lessons, speaking practice, and quizzes.

### 1.2 Scope

LangLeap covers:

- A **learner-facing app** (mobile-first web) providing daily bite-sized English lessons with bilingual glosses, simulated speaking practice, multiple-choice quizzes, streak tracking, and offline support.
- A **Content Studio** (internal web portal) for content writers, voice artists, and reviewers to author, record, review, and publish lesson content through a structured pipeline.
- A **backend API** and **database** to persist user accounts, lesson content, learner progress, and sync offline results.

### 1.3 Intended Audience

| Audience | Purpose |
|---|---|
| Development team | Implementation guide |
| Product head | Requirements sign-off |
| Testers | Test-case derivation |
| Faculty / evaluators | Academic assessment |

### 1.4 Definitions & Abbreviations

| Term | Definition |
|---|---|
| Learner | End-user learning English via the app |
| Content writer | Team member who authors lesson scripts, quizzes, and bilingual glosses |
| Voice artist | Team member who records audio narration for lessons |
| Reviewer | Team member who runs the publish gate on lessons |
| Lesson | A single learning unit containing a script, bilingual glosses, quiz, and optional audio |
| Script | Ordered English sentences with Hindi and Marathi translations |
| Gloss | Native-language translation displayed alongside English text |
| Streak | Consecutive-day count of lesson completions |
| Freeze | One-per-week free pass that preserves a streak through a missed day |
| Publish gate | Automated quality checklist a lesson must pass before going live |
| BVA | Boundary Value Analysis |
| DRE | Defect Removal Efficiency |
| NFR | Non-Functional Requirement |
| FR | Functional Requirement |
| RBAC | Role-Based Access Control |

---

## 2. Overall Description

### 2.1 Product Perspective

LangLeap is a greenfield product. The frontend is a React SPA (Vite + TypeScript) with a Zustand state layer; the backend will be a RESTful API (Node.js/Express or equivalent) backed by PostgreSQL. The system currently operates in a frontend-only demo mode with localStorage persistence.

### 2.2 User Classes

| Role | Capabilities |
|---|---|
| **Learner** | Browse published lessons, study script + glosses, practise speaking, take quiz, track progress & streak, receive notifications |
| **Content Writer** | Create / edit lesson drafts (script, quiz, bilingual glosses), submit for review |
| **Voice Artist** | Record and submit audio takes for lessons, view QA feedback |
| **Reviewer** | Run publish gate, approve or reject lessons, add review notes |
| **Admin** | Full access to all Studio functions plus user management |
| **Product Head** | Read-only overview of pipeline health, approval overrides |

### 2.3 Operating Environment

- **Clients:** Modern browsers (Chrome 90+, Safari 15+, Firefox 95+); iOS/Android via PWA.
- **Server:** Linux (Ubuntu 22.04+), Node.js 20 LTS, PostgreSQL 15+.
- **Hosting:** Cloud VPS (e.g., AWS EC2 / Railway / Render) with Nginx reverse proxy.

### 2.4 Design & Implementation Constraints

| ID | Constraint |
|---|---|
| CON-01 | Budget capped at ₹35 lakh for 6 months |
| CON-02 | Content pipeline is the bottleneck: 35 lessons produced in 8 weeks; 120 needed at launch |
| CON-03 | Single voice artist available at 15 hrs/week; each lesson requires 1.5 hrs of recording |
| CON-04 | App must work in low-bandwidth / offline conditions common in tier-2/3 Indian cities |
| CON-05 | All lesson UI must support bilingual display (English + Hindi/Marathi) |
| CON-06 | Frontend demo operates without a backend; design must ensure a clean migration path |

### 2.5 Assumptions & Dependencies

- Users have a smartphone or computer with a modern browser.
- Hindi and Marathi Unicode fonts are available on user devices.
- Network connectivity may be intermittent; offline-first is critical.
- Content writers produce lesson scripts outside the app (spreadsheets) and enter them via the Studio.

---

## 3. Functional Requirements

### FR-01 — Bilingual Lesson Display

**Priority:** Must-Have  
**Description:** Each lesson screen SHALL display the English script alongside a selectable native-language gloss (Hindi or Marathi). The learner SHALL be able to toggle between Hindi and Marathi at any time during the lesson.

**Acceptance criteria:**
- Every script line shows `en` text prominently and the selected `hi` or `mr` gloss below it.
- Switching the gloss toggle re-renders all lines immediately without page reload.
- The hint field is also bilingual and renders in the selected language.

---

### FR-02 — Audio Playback

**Priority:** Must-Have  
**Description:** For each script line in a published lesson, the learner SHALL be able to tap a play button to hear the English audio narration. Playback auto-stops after the line finishes.

**Acceptance criteria:**
- Play icon is visible for every line; tapping it plays the audio for that line.
- While playing, the icon animates (pulse) to indicate active playback.
- Only one line plays at a time; tapping another line stops the current one.

---

### FR-03 — Quiz Assessment

**Priority:** Must-Have  
**Description:** Each lesson SHALL include at least 3 multiple-choice quiz questions. After answering all questions, the learner submits the quiz and receives a percentage score.

**Acceptance criteria:**
- All questions must be answered before the Submit button becomes active.
- Score = (correct / total) × 100, rounded to the nearest integer.
- Score ≥ 70% is a pass; score < 70% is a fail.

---

### FR-04 — Speaking Practice (Simulated)

**Priority:** Should-Have  
**Description:** Before the quiz, the learner SHALL be offered a speaking practice step. The system presents each script line and allows the learner to record their pronunciation. A simulated pronunciation score (0–100) is generated per line.

**Acceptance criteria:**
- Each line has a Record button; tapping it shows a recording indicator for ~1.4 s.
- After recording, a score badge (72–100 range in demo) appears next to the line.
- A "Redo" button allows re-recording any line.
- The learner can skip speaking practice entirely and proceed directly to the quiz.

---

### FR-05 — Pronunciation Scoring

**Priority:** Could-Have  
**Description:** When a real backend is present, the system SHALL call a speech-to-text API to compare the learner's recorded audio against the expected script line and return a phonetic similarity score (0–100).

**Acceptance criteria:**
- API latency ≤ 3 seconds per line.
- Score ≥ 60 is acceptable; ≤ 59 flags the line for re-recording.
- In demo mode, scores are randomised in [72, 100).

---

### FR-06 — Lesson Path & Sequential Ordering

**Priority:** Must-Have  
**Description:** Published lessons SHALL be presented to learners in a fixed sequential order (by `position`). Each lesson is assigned a position number, and the UI renders them in ascending order.

**Acceptance criteria:**
- Lesson list is sorted by `position` ascending.
- Only published lessons appear in the learner path.
- Deprecated or draft lessons are not visible to learners.

---

### FR-07 — Lesson Unlock (Decision Table)

**Priority:** Must-Have  
**Description:** A lesson is unlocked (available) if and only if:
1. The previous lesson in the path has been passed (score ≥ 70%), AND
2. The current lesson is in `published` state.

The first published lesson is always available.

**Decision table:**

| # | Previous Passed | Current Published | Score ≥ 70 | → Outcome |
|---|---|---|---|---|
| 1 | Yes | Yes | Yes | **Unlock next** |
| 2 | Yes | Yes | No | Remain locked |
| 3 | Yes | No | — | Locked (not published) |
| 4 | No | Yes | — | Locked (prev not passed) |
| 5 | No | No | — | Locked |
| 6 | First lesson | Yes | — | **Available** |

**Acceptance criteria:**
- `evaluateUnlock(prevPassed, score, nextPublished)` returns `true` only for row 1.
- Locked lessons display a lock icon and a message naming the prerequisite lesson.

---

### FR-08 — Daily Streak with Weekly Freeze (Decision Table)

**Priority:** Must-Have  
**Description:** The system tracks consecutive days of lesson completion. One "freeze" per calendar week preserves the streak through a single missed day.

**Decision table:**

| # | Completed Today | Active Yesterday | Freeze Available | → Action |
|---|---|---|---|---|
| 1 | Yes | Yes | — | **Increment** streak |
| 2 | Yes | No | — | **Start** streak at 1 |
| 3 | No | Yes | Yes | **Freeze** (streak preserved, freeze consumed) |
| 4 | No | Yes | No | **Reset** streak to 0 |
| 5 | No | No | — | **No-op** |

**Acceptance criteria:**
- `evaluateStreak(completedToday, activeYesterday, freezeAvailable)` matches every row.
- Only 1 freeze per Sunday–Saturday week; `freezeAvailableThisWeek()` enforces this.
- Best streak is updated whenever current exceeds it.

---

### FR-09 — Learner Progress Dashboard

**Priority:** Must-Have  
**Description:** The learner dashboard SHALL display:
- Current streak and best streak
- Freeze availability
- Lessons passed out of total published
- A visual path showing passed / available / locked lessons
- Recent quiz results (up to 5)

**Acceptance criteria:**
- All stats update in real-time after a quiz submission.
- Passed lessons show a checkmark; available show a book icon; locked are disabled.

---

### FR-10 — In-App Notifications

**Priority:** Should-Have  
**Description:** The system SHALL generate notifications for events: lesson completion, unlock, streak changes, offline sync queuing. Notifications are displayed on a dedicated page with unread count.

**Acceptance criteria:**
- Notifications are capped at 30 per user (FIFO eviction).
- Mark-as-read and mark-all-read actions are available.
- Unread count badge appears in the navigation sidebar.

---

### FR-11 — Publish Gate (Reviewer Quality Checklist)

**Priority:** Must-Have  
**Description:** Before a lesson can be published, it must pass ALL of the following automated checks:

| Check | Condition |
|---|---|
| Script present | Word count ≥ 6 |
| Native-language glosses | Every script line has non-empty `hi` AND `mr`; hint has `en`, `hi`, `mr` |
| Quiz complete | ≥ 3 quiz questions |
| Audio recorded | `audioUrl` non-null AND `audioDurationSec` non-null |
| Audio accepted | Audio status is `accepted` (or already published) |
| Audio duration tolerance | `audioDurationSec / scriptTargetSec` within [0.90, 1.10] |

**Acceptance criteria:**
- The "Approve & publish" button is disabled when any check fails.
- A rejected lesson returns to `draft` state with reviewer notes.
- The gate result is displayed as a checklist with pass/fail per item.

---

## 4. Non-Functional Requirements

### NFR-01 — Offline Behaviour

**Measurable target:** The learner SHALL be able to complete any previously loaded lesson (study script, speaking practice, take quiz) without any network connectivity. Quiz results recorded offline SHALL be queued locally and synced automatically within 30 seconds of network restoration.

**Metric:** 100% of lesson interactions function offline after initial load. Sync queue drains within 30 s of `navigator.onLine` becoming `true`.

---

### NFR-02 — Usability

**Measurable target:**
- A first-time learner with no technical training SHALL complete one full lesson (study → speaking → quiz) in ≤ 10 minutes.
- The SUS (System Usability Scale) score from a panel of 5 pilot users SHALL average ≥ 72 (above-average).
- All interactive elements SHALL have a minimum touch target of 44 × 44 px.

---

### NFR-03 — Content Quality

**Measurable target:**
- Every published lesson SHALL have ≥ 3 script lines, ≥ 3 quiz questions, and complete Hindi + Marathi glosses (0 missing translations).
- Audio duration SHALL be within ±10% of the script target duration.
- The publish gate (FR-11) enforces this automatically; 0 lessons may go live without passing all 6 checks.

---

### NFR-04 — Performance

**Measurable target:**
- Initial page load (Largest Contentful Paint) ≤ 2.5 seconds on a 4G connection (1.6 Mbps).
- Time-to-Interactive ≤ 3.5 seconds.
- API response time for quiz submission ≤ 500 ms (p95).
- Client-side route transitions ≤ 300 ms.

---

### NFR-05 — Security

**Measurable target:**
- All API traffic SHALL use HTTPS (TLS 1.2+).
- Passwords SHALL be hashed with bcrypt (cost factor ≥ 10) before storage.
- JWT tokens SHALL expire after 24 hours; refresh tokens after 7 days.
- Role-based access control SHALL be enforced server-side: a learner request to a Studio endpoint SHALL return HTTP 403 within 50 ms.
- 0 XSS vulnerabilities as measured by OWASP ZAP scan.

---

### NFR-06 — Scalability & Availability

**Measurable target:**
- The system SHALL support ≥ 500 concurrent users with ≤ 1% error rate.
- Monthly uptime ≥ 99.5% (≤ 3.6 hours downtime/month).
- Database query time for lesson retrieval ≤ 100 ms (p99) for up to 500 lessons.

---

## 5. MoSCoW Prioritisation

| Priority | Requirements |
|---|---|
| **Must-Have** | FR-01, FR-02, FR-03, FR-06, FR-07, FR-08, FR-09, FR-11, NFR-01, NFR-03 |
| **Should-Have** | FR-04, FR-10, NFR-02, NFR-04, NFR-05 |
| **Could-Have** | FR-05, NFR-06 |
| **Won't-Have (this release)** | Gamification leaderboards, social features, AI-generated lessons, paid subscription tier |

---

## 6. Traceability Matrix

| FR | Test Case(s) | UML Diagram(s) | Design Component |
|---|---|---|---|
| FR-01 | TC-01a,b,c | UC-01, SD-01 | `lesson-study.tsx` gloss toggle, `BilingualText` |
| FR-02 | TC-02a,b,c | UC-01, SD-01 | `lesson-study.tsx` `togglePlay()` |
| FR-03 | TC-03a,b,c | UC-02, SD-02 | `lesson-study.tsx` `submitQuiz()` |
| FR-04 | TC-04a,b,c | UC-01 | `lesson-study.tsx` `recordLine()` |
| FR-05 | TC-05a,b,c | SD-01 | Future pronunciation API |
| FR-06 | TC-06a,b,c | UC-01, Class | `getLessons()`, `progression.ts` |
| FR-07 | TC-07a–f | UC-02, State, SD-02 | `evaluateUnlock()`, `lessonLaunchState()` |
| FR-08 | TC-08a–e | State | `evaluateStreak()`, `applyStreak()` |
| FR-09 | TC-09a,b,c | UC-03, Activity | `dashboard.tsx`, `progress.tsx` |
| FR-10 | TC-10a,b,c | UC-04 | `learner.ts` notifications |
| FR-11 | TC-11a–h | UC-05, SD-03, State | `gateLesson()`, `review.tsx` |

---

*End of SRS Document*
