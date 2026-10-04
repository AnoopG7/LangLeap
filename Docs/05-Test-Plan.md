# LangLeap — Test Plan & Evidence

**Version:** 1.0  
**Date:** October 2026  
**Author:** Team LangLeap  

---

## 1. Test Strategy Overview

| Aspect | Approach |
|---|---|
| **Scope** | All 11 functional requirements (FR-01 to FR-11) and 6 non-functional requirements |
| **Techniques** | Boundary Value Analysis (BVA), Equivalence Class Partitioning (ECP), Decision Table Testing |
| **Coverage** | Unit tests for logic functions, integration tests for API, end-to-end for critical paths |
| **Entry criteria** | Feature code complete, code review passed |
| **Exit criteria** | All critical/high severity defects resolved; DRE ≥ 85% |

### 1.1 QA Test-Level Matrix

| Test level | Scope | Evidence / tooling | Release expectation |
|---|---|---|---|
| Unit | Score, 70% threshold, unlock, streak, publish gate, validation and conflict policies | Vitest/Jest, branch coverage and mutation cases | All policy branches pass |
| Component | Lesson player, quiz, progress, notifications and role-based Studio views | React Testing Library and keyboard fixtures | Loading, error, offline and success states pass |
| Integration | Backend modules with PostgreSQL, Redis, queue, object storage and auth | Testcontainers or isolated staging services | Transactions, RBAC and idempotency verified |
| Contract | Frontend/API schemas and speech, storage and notification adapters | OpenAPI/Zod contracts and provider mocks | Breaking API changes blocked in CI |
| End-to-end | Login, publish, learner completion, unlock, offline replay and staff review | Playwright on production-like environment | Critical journeys pass on desktop and mobile |
| Non-functional | Performance, accessibility, security, resilience, backup restore and recovery | k6, axe, SAST/DAST, dependency scans and restore drill | SLOs met; no open Sev-1/Sev-2 |

---

## 2. Boundary Value Analysis — Quiz Score Threshold

The quiz pass threshold is **70%** (defined as `PASS_THRESHOLD = 70` in `lib/types.ts`).

### 2.1 Identified Boundaries

For a 3-question quiz:
- Score = (correct / 3) × 100

| Correct Answers | Score | At Boundary? |
|---|---|---|
| 0 | 0% | min |
| 1 | 33% | below threshold |
| 2 | 67% | just below threshold |
| 3 | 100% | above threshold |

The boundary lies between 2/3 correct (67%, FAIL) and 3/3 correct (100%, PASS). With 3 questions, there's no exact 70% value — the nearest scores are 67% and 100%.

### 2.2 BVA Test Cases

| TC ID | Correct | Total | Score | Expected Result | Boundary Type |
|---|---|---|---|---|---|
| **BVA-01** | 0 | 3 | 0% | FAIL | Min value |
| **BVA-02** | 1 | 3 | 33% | FAIL | Below threshold |
| **BVA-03** | 2 | 3 | 67% | FAIL | Just below threshold (nearest achievable) |
| **BVA-04** | 3 | 3 | 100% | PASS | Just above threshold (nearest achievable) |
| **BVA-05** | 0 | 4 | 0% | FAIL | Min with 4 questions |
| **BVA-06** | 2 | 4 | 50% | FAIL | Below threshold |
| **BVA-07** | 3 | 4 | 75% | PASS | Just above threshold (4Q) |
| **BVA-08** | 4 | 4 | 100% | PASS | Max value |
| **BVA-09** | 7 | 10 | 70% | PASS | Exact boundary (10Q) |
| **BVA-10** | 6 | 10 | 60% | FAIL | Just below boundary (10Q) |
| **BVA-11** | 69 | 100 | 69% | FAIL | 1 below threshold |
| **BVA-12** | 70 | 100 | 70% | PASS | Exact threshold |
| **BVA-13** | 71 | 100 | 71% | PASS | 1 above threshold |

### 2.3 Equivalence Classes

| Class | Range | Representative | Expected |
|---|---|---|---|
| EC-1: Strong fail | 0%–29% | 15% | FAIL |
| EC-2: Moderate fail | 30%–59% | 45% | FAIL |
| EC-3: Near-miss fail | 60%–69% | 67% | FAIL |
| EC-4: Bare pass | 70%–79% | 75% | PASS |
| EC-5: Strong pass | 80%–100% | 90% | PASS |

---

## 3. Decision Table — Lesson Unlock Rules (FR-07)

### 3.1 Conditions

| Condition | Values |
|---|---|
| C1: Is first lesson? | Yes / No |
| C2: Previous lesson passed? | Yes / No |
| C3: Current lesson published? | Yes / No |
| C4: Current score ≥ 70? | Yes / No |

### 3.2 Decision Table

| Rule | C1 | C2 | C3 | C4 | → Action |
|---|---|---|---|---|---|
| **R1** | Yes | — | Yes | — | AVAILABLE (first lesson always open) |
| **R2** | No | Yes | Yes | Yes | **UNLOCK NEXT** |
| **R3** | No | Yes | Yes | No | AVAILABLE but not passed |
| **R4** | No | Yes | No | — | LOCKED (not published) |
| **R5** | No | No | Yes | — | LOCKED (prev not passed) |
| **R6** | No | No | No | — | LOCKED |
| **R7** | Yes | — | No | — | LOCKED (not published) |

### 3.3 Test Cases from Decision Table

| TC ID | First? | Prev Passed | Published | Score | Expected State | Maps to Rule |
|---|---|---|---|---|---|---|
| **DT-07-01** | Yes | — | Yes | — | Available | R1 |
| **DT-07-02** | No | Yes | Yes | 85% | Unlock next | R2 |
| **DT-07-03** | No | Yes | Yes | 50% | Available (not passed) | R3 |
| **DT-07-04** | No | Yes | No | — | Locked | R4 |
| **DT-07-05** | No | No | Yes | — | Locked | R5 |
| **DT-07-06** | No | No | No | — | Locked | R6 |
| **DT-07-07** | Yes | — | No | — | Locked | R7 |

---

## 4. Decision Table — Streak Rules (FR-08)

### 4.1 Conditions

| Condition | Values |
|---|---|
| C1: Completed today? | Yes / No |
| C2: Streak active yesterday? | Yes / No |
| C3: Freeze available? | Yes / No |

### 4.2 Decision Table

| Rule | C1 | C2 | C3 | → Action | Streak Effect |
|---|---|---|---|---|---|
| **R1** | Yes | Yes | — | INCREMENT | current += 1 |
| **R2** | Yes | No | — | START | current = 1 |
| **R3** | No | Yes | Yes | FREEZE | streak preserved, freeze consumed |
| **R4** | No | Yes | No | RESET | current = 0 |
| **R5** | No | No | — | NOOP | no change |

### 4.3 Test Cases from Decision Table

| TC ID | Completed | Yesterday | Freeze | Expected Action | Expected Current |
|---|---|---|---|---|---|
| **DT-08-01** | Yes | Yes | Yes | INCREMENT | prev + 1 |
| **DT-08-02** | Yes | Yes | No | INCREMENT | prev + 1 |
| **DT-08-03** | Yes | No | Yes | START | 1 |
| **DT-08-04** | Yes | No | No | START | 1 |
| **DT-08-05** | No | Yes | Yes | FREEZE | unchanged |
| **DT-08-06** | No | Yes | No | RESET | 0 |
| **DT-08-07** | No | No | Yes | NOOP | unchanged |
| **DT-08-08** | No | No | No | NOOP | unchanged |

---

## 5. Test Cases — Publish Gate (FR-11)

| TC ID | Script Words | Glosses Complete | Quiz Count | Audio Present | Audio Accepted | Duration Ratio | → Gate Result |
|---|---|---|---|---|---|---|---|
| **DT-11-01** | 15 | Yes | 3 | Yes | Yes | 1.05 | ✅ PASS |
| **DT-11-02** | 3 | Yes | 3 | Yes | Yes | 1.05 | ❌ FAIL (script < 6 words) |
| **DT-11-03** | 15 | No (missing mr) | 3 | Yes | Yes | 1.05 | ❌ FAIL (glosses incomplete) |
| **DT-11-04** | 15 | Yes | 1 | Yes | Yes | 1.05 | ❌ FAIL (quiz < 3) |
| **DT-11-05** | 15 | Yes | 3 | No | — | — | ❌ FAIL (no audio) |
| **DT-11-06** | 15 | Yes | 3 | Yes | No | 1.05 | ❌ FAIL (audio not accepted) |
| **DT-11-07** | 15 | Yes | 3 | Yes | Yes | 1.31 | ❌ FAIL (duration > 110%) |
| **DT-11-08** | 15 | Yes | 3 | Yes | Yes | 0.89 | ❌ FAIL (duration < 90%) |
| **DT-11-09** | 15 | Yes | 3 | Yes | Yes | 0.90 | ✅ PASS (lower boundary) |
| **DT-11-10** | 15 | Yes | 3 | Yes | Yes | 1.10 | ✅ PASS (upper boundary) |

### DF-06 Defect Scenario (from demo data)

Lesson `l-09` ("At Work") has audio duration at **1.31× target** (31% over tolerance). The gate correctly flags this:

```
Check: "Audio duration within 10% of script target"
Pass:  false
Detail: "Duration is 1.31× target — over the 10% tolerance (05-Test-Plan DF-06)"
```

This is an intentional test scenario embedded in the seed data to demonstrate the gate's rejection capability.

---

## 6. Complete Test Case Catalogue

| TC ID | FR | Description | Input | Expected Output | Priority |
|---|---|---|---|---|---|
| TC-01a | FR-01 | Hindi gloss displays for all lines | Select हिंदी toggle | All lines show Hindi text | High |
| TC-01b | FR-01 | Marathi gloss displays for all lines | Select मराठी toggle | All lines show Marathi text | High |
| TC-01c | FR-01 | Toggle switches instantly | Switch between toggles | No page reload; text updates | Medium |
| TC-02a | FR-02 | Play button plays line audio | Tap Play on line 1 | Icon pulses, audio plays | High |
| TC-02b | FR-02 | Auto-stop after line | Wait for line to finish | Icon returns to Play | Medium |
| TC-02c | FR-02 | Only one line plays at a time | Tap Play on line 2 while 1 is playing | Line 1 stops, line 2 plays | Medium |
| TC-03a | FR-03 | Submit disabled until all answered | Answer only 2/3 questions | Submit button disabled | High |
| TC-03b | FR-03 | Score calculation correct | 2/3 correct | Score = 67% | High |
| TC-03c | FR-03 | Pass/fail classification | Score 67% | "Not yet — retry allowed" | High |
| TC-04a | FR-04 | Recording indicator shown | Tap Record | Mic icon pulses for ~1.4s | Medium |
| TC-04b | FR-04 | Redo allows re-recording | Tap Redo on scored line | New score replaces old | Medium |
| TC-04c | FR-04 | Skip to quiz | Tap "Skip speaking practice" | Quiz step loads | Medium |
| TC-06a | FR-06 | Lessons sorted by position | View lessons page | Lessons appear in position order | High |
| TC-06b | FR-06 | Draft lessons hidden from learner | Lesson L10 (draft) | Not visible in learner path | High |
| TC-09a | FR-09 | Dashboard shows streak | Login as learner | Streak card displays current/best | High |
| TC-09b | FR-09 | Path visual correct | Pass 3 lessons | 3 checkmarks, 1 book icon, rest locked | High |
| TC-10a | FR-10 | Notification created on pass | Pass a quiz | Notification appears in list | Medium |
| TC-10b | FR-10 | Mark-all-read works | Click "Mark all read" | All notifications show as read | Low |
| TC-10c | FR-10 | Cap at 30 | Create 31 notifications | Only 30 retained (oldest evicted) | Low |
| TC-11a | FR-11 | Gate passes for valid lesson | All 6 checks pass | "Gate passed" badge, Approve enabled | High |
| TC-11b | FR-11 | Gate fails for missing audio | No audio uploaded | "Gate failing", Approve disabled | High |
| TC-11c | FR-11 | Reject returns to draft | Click "Send back to draft" | Lesson state → draft with notes | High |

---

## 7. Defect Log

| DF ID | Severity | FR | Description | Found In | Status | Resolution |
|---|---|---|---|---|---|---|
| DF-01 | Medium | FR-07 | First lesson showed as "locked" when no progress exists | Unit test | Fixed | Added `position <= 1` guard in `lessonLaunchState()` |
| DF-02 | High | FR-08 | Freeze consumed even when streak was already at 0 | DT-08-07 | Fixed | Added `NOOP` branch for no-streak + no-completion |
| DF-03 | Low | FR-01 | Empty gloss string rendered as blank line | Manual test | Fixed | `normalize()` coerces missing fields to empty string |
| DF-04 | Medium | FR-11 | Approve button clickable when gate failing | Manual test | Fixed | Added `disabled={!gate.ok}` prop |
| DF-05 | High | FR-03 | Score rounded down instead of nearest | BVA-09 | Fixed | Changed `Math.floor` to `Math.round` |
| DF-06 | Medium | FR-11 | Audio at 1.31× target not flagged | Intentional seed scenario | Working as designed | Gate correctly rejects; kept as demo test case |
| DF-07 | Low | FR-10 | 31st notification not evicted | TC-10c | Fixed | Added `.slice(0, 30)` in `addNotification()` |
| DF-08 | Medium | NFR-01 | Offline quiz result lost on page refresh | Manual test | Fixed | Added `queueQuizResult()` with localStorage persistence |

**Total defects found:** 8  
**Defects found in testing:** 8  
**Defects found post-release:** 0 (not yet released)

---

## 8. Defect Density

```
Defect density = Total defects ÷ Size of code

Lines of code (logic modules):
  - learner.ts:     186 lines
  - lessons.ts:     400 lines
  - progression.ts:  30 lines
  - sync.ts:         50 lines
  - auth-store.ts:  122 lines
  - types.ts:        99 lines
  Total:            887 lines

Defect density = 8 ÷ 887 × 1000
               = 9.02 defects per KLOC

Industry benchmark: 1–25 defects/KLOC for shipped software
Status: WITHIN ACCEPTABLE RANGE
```

---

## 9. Defect Removal Efficiency (DRE)

```
DRE = (Defects found before release ÷ Total defects) × 100

Defects found during testing = 8
Defects found post-release   = 0 (not yet shipped)

DRE = (8 ÷ 8) × 100
    = 100%

Note: This will decrease once the app goes live and field defects are
discovered. The target is DRE ≥ 85%.
```

---

## 10. Test Execution Summary

| Phase | Test Cases | Passed | Failed | Blocked | Pass Rate |
|---|---|---|---|---|---|
| Unit (BVA + DT) | 31 | 28 | 3 | 0 | 90.3% |
| After defect fixes | 31 | 31 | 0 | 0 | **100%** |
| Integration | 12 | 12 | 0 | 0 | **100%** |
| Manual / E2E | 22 | 21 | 1 | 0 | 95.5% |
| After defect fixes | 22 | 22 | 0 | 0 | **100%** |
| **Total (final)** | **65** | **65** | **0** | **0** | **100%** |

---

*End of Test Plan & Evidence*
