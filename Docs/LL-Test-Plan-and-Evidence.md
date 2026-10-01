# Test Plan & Evidence — LangLeap

## Project: **LangLeap** — English Language Learning App for Hindi & Marathi Speakers

| Field              | Value                                                       |
| ------------------ | ----------------------------------------------------------- |
| Document number    | LL-Test-Plan-1.0                                            |
| Prepared by        | Anoop (sole contributor — QA)                               |
| Date               | 01 Oct 2026                                                 |
| Status             | Approved                                                    |
| Related documents | LL-SRS-1.0 (FR-06, FR-07, FR-08) · LL-UML-Package-1.0 §4–§6 |

---

## Revision History

| Version | Date | Author | Summary |
| ------- | ---- | ------ | ------- |
| 1.0     | 01 Oct 2026 | Anoop | Approved — BVA, equivalence classes, decision tables, defect log, DRE |

---

## Approvals

| Role | Name | Decision |
| ---- | ---- | -------- |
| Sole contributor, QA | Anoop | Approved |

---

## Table of Contents

1. Test Scope & Strategy
2. Boundary Value Analysis — Quiz Score Threshold
3. Equivalence Classes — Lesson Unlock
4. Decision Table — Lesson Unlock Rule (FR-07)
5. Decision Table — Streak Rule (FR-08)
6. Master Test Log (FR → TC → Result)
7. Defect Log
8. Defect Density & DRE Computation
9. Traceability Summary

---

## 1. Test Scope & Strategy

Target of testing: **lesson unlock** and **streak** rules primarily, plus a regression net that
covers every FR so the SRS traceability matrix can be completed.

- 37 test cases derived from the SRS (32 FR-linked, 5 non-functional).
- Black-box techniques: BVA, equivalence partitioning, decision tables (rule-based logic).
- Environment: Android reference device, emulator, Chrome (Studio), simulated offline.
- Exit criteria for v1: 0 open **Must/Should** defects; DRE ≥ 75%.

---

## 2. Boundary Value Analysis — Quiz Score Threshold

**Field under test:** quiz `score`, valid domain **0–100** (integer), pass threshold **70** (FR-06).

Boundary set for `score`: lower bound 0, threshold 70 (pass/fail edge), upper bound 100,
plus the invalid just-outside values.

| TC ID | Input (`score`) | Expected                | Pass/Fail |
| ----- | --------------- | ----------------------- | --------- |
| TC-QUIZ-BVA-01 | 0 | Fail, score <= 70 | Pass |
| TC-QUIZ-BVA-02 | 69 | Fail (1 below threshold) | Pass |
| TC-QUIZ-BVA-03 | 70 | **Pass** (at threshold) | Pass |
| TC-QUIZ-BVA-04 | 71 | Pass (1 above threshold) | Pass |
| TC-QUIZ-BVA-05 | 100 | Pass (upper bound) | Pass |
| TC-QUIZ-BVA-06 | −1 | Rejected (below domain) | Pass |
| TC-QUIZ-BVA-07 | 101 | Rejected (above domain) | Pass |

*Derived cases added for robustness:* decimal `70.0` accepted as 70; `70.5` rejected as non-integer; `""` / `abc` rejected with friendly error. These extend the table in evidence but do not change the seven canonical cases above.

---

## 3. Equivalence Classes — Lesson Unlock

Input space partitioned for FR-07. Each class is homogeneous: any member behaves the same.

| Input | Valid classes | Invalid classes |
| ----- | ------------- | --------------- |
| `score` | [0–69] fail · [70–100] pass | [−∞…−1] · [101…∞] · non-numeric |
| `previousLessonCompleted` | true · false | — (boolean) |
| `nextLessonPublished` | true · false | — (boolean) |
| `offlineMode` | true · false | — (boolean; unlock decision identical offline, sync deferred) |

**Representative tests (mapped to the decision table):** one case per class is enough; the
decision table (§4) covers the **interface** classes (combinations) exhaustively.

---

## 4. Decision Table — Lesson Unlock Rule (FR-07)

Conditions:
- **C1** previous lesson completed = `true`
- **C2** quiz `score ≥ 70` = `true`
- **C3** next lesson `published` = `true`

Action: **A** unlock next lesson (else keep locked).

| Rule | C1 | C2 | C3 | Action | TC |
| ---- | -- | -- | -- | ------ | -- |
| 1 | T | T | T | **Unlock** | TC-UNLOCK-DT-01 |
| 2 | T | T | F | Do not unlock (not published) | TC-UNLOCK-DT-02 |
| 3 | T | F | T | Do not unlock (quiz fail) | TC-UNLOCK-DT-03 |
| 4 | T | F | F | Do not unlock | TC-UNLOCK-DT-04 |
| 5 | F | T | T | Do not unlock (prev incomplete) | TC-UNLOCK-DT-05 |
| 6 | F | T | F | Do not unlock | TC-UNLOCK-DT-06 |
| 7 | F | F | T | Do not unlock | TC-UNLOCK-DT-07 |
| 8 | F | F | F | Do not unlock | TC-UNLOCK-DT-08 |

**Collapsed decision (C3 only relevant when C1 ∧ C2):** unlock ⇔ `C1 ∧ C2 ∧ C3`. The full
8-row form is kept so each combination is explicitly evidenced.

---

## 5. Decision Table — Streak Rule (FR-08)

Conditions:
- **C1** lesson completed today
- **C2** a streak was active (completed or frozen yesterday)
- **C3** a weekly freeze is still available (≤ 1/week)

Actions: increment · freeze · reset · no-op.

| Rule | C1 | C2 | C3 | Action | TC |
| ---- | -- | -- | -- | ------ | -- |
| 1 | T | T | — | Increment streak | TC-STREAK-DT-01 |
| 2 | T | F | — | Start streak at 1 | TC-STREAK-DT-02 |
| 3 | F | T | T | Freeze (consume weekly freeze) | TC-STREAK-DT-03 |
| 4 | F | T | F | **Reset streak to 0** (miss, no freeze) | TC-STREAK-DT-04 |
| 5 | F | F | — | No-op (already broken) | TC-STREAK-DT-05 |
| 6 | T | T | T | Increment (max 1 freeze/week respected) | TC-STREAK-DT-06 |
| 7 | T | T | F | Increment | TC-STREAK-DT-07 |
| 8 | F | T | T | Freeze (second miss same week → Reset) | TC-STREAK-DT-08 |

**Rule 8 note:** after a freeze is consumed (Rule 3), a second consecutive miss has `C3 = false`
→ Rule 4 resets. Rule 8 simply re-states the boundary: freeze exists exactly once per week.

*These same conditions mirror the streak state diagram in LL-UML-Package-1.0 §6.2.*

---

## 6. Master Test Log (FR → TC → Result)

Executed against the approved SRS. 37 cases, 37 executed, 35 pass on first run, 2 fail then
fix-verify (all pass in the final regression run).

| TC range | Linked | Executed | Result |
| -------- | ------ | -------- | ------ |
| TC-AUTH-01…02 | FR-01 | 2 | Pass |
| TC-LESSON-01…02 | FR-02 | 2 | Pass |
| TC-CONTENT-01…02 | FR-03 | 2 | Pass |
| TC-VOICE-01…02 | FR-04 | 2 | Pass |
| TC-SPEAK-01 | FR-05 | 1 | Pass |
| TC-QUIZ-BVA-01…07 | FR-06 | 7 | Pass (TC-04 failed first run → DF-01) |
| TC-UNLOCK-DT-01…08 | FR-07 | 8 | Pass (TC-01 failed first run → DF-02) |
| TC-STREAK-DT-01…08 | FR-08 | 8 | Pass (TC-08 failed first run → DF-03) |
| TC-OFFLINE-01, TC-SYNC-01 | FR-09 | 2 | Pass (DF-04, DF-08 linked) |
| TC-NOTIFY-01 | FR-10 | 1 | Pass (DF-07 linked) |
| TC-GATE-01…02 | FR-11 | 2 | Pass (DF-06 linked) |
| **Subtotal FR** | | **37** | 37 pass |
| NF-OFF/PREF/USAB/QUAL/REL/SEC (execution samples) | NFR-01…06 | 5 samples | Pass |

---

## 6.1 Bilingual-content & Access-control evidence (frontend mock)

Verified in the frontend mock against the demo accounts (`learner / writer / artist / reviewer / admin / product head`) on `NewProj/frontend`:

<Bilingual content (FR-01, FR-03)>
- Sign-up lets the learner pick their first language (**हिंदी / मराठी**); the preference is stored and drives which gloss every page shows.
- Every seed lesson (LL-01…LL-10) carries `en / hi / mr` for **each script line** and for the lesson hint — nothing is English-only.
- The lesson study screen renders each line's English + a one-tap **हिंदी / मराठी** gloss toggle (defaults to the learner's chosen language); the speaking step shows the gloss as a caption.
- Meaning questions in quizzes use Hindi and Marathi options (e.g. LL-03 "Mother → आई (Aai)", LL-04 "Tasty (चविष्ट)").
- Content Studio authoring requires an equal count of English / Hindi / Marathi lines and a hint in all three languages before a draft can be saved, so every created draft is fully glossed.
- The FR-11 review gate includes a check "Native-language glosses (हिंदी / मराठी)" that fails when any line/hint lacks a translation.

<Access control & 403 prevention>
- Routes are role-scoped (`RequireRoles` in `src/router.tsx`) and the sidebar hides every nav item the signed-in role cannot open — no dead-end links.
- Rollout matrix exercised per role: learner → Learn pages only; content_writer → Content Authoring; voice_artist → Voice Recording; reviewer → Review & Publish; admin → all; product_head → Content Authoring + Review & Publish.
- Post-login redirect is role-aware: the user always lands on a page their role may open (never a 403 straight after sign-in).
- The `/403` page remains reachable only for a deliberate role mismatch (e.g. a learner visiting `/studio/voice` directly), which is the intended behaviour, not a defect.

---

## 7. Defect Log

| ID | Module | Found in | Severity | Status | Linked TC |
| -- | ------ | -------- | -------- | ------ | --------- |
| DF-01 | Quiz | Pre-release | High | Fixed & verified | TC-QUIZ-BVA-04 |
| DF-02 | Unlock | Pre-release | High | Fixed & verified | TC-UNLOCK-DT-01 |
| DF-03 | Streak | Pre-release | Medium | Fixed & verified | TC-STREAK-DT-08 |
| DF-04 | Sync | Pre-release | Medium | Fixed & verified | TC-SYNC-01 |
| DF-05 | Auth | Pre-release | Low | Fixed & verified | TC-AUTH-02 |
| DF-06 | Voice QA gate | Pre-release | High | Fixed & verified | TC-GATE-01 |
| DF-07 | Notifications | **Post-release** | Low | Patched (next release) | TC-NOTIFY-01 |
| DF-08 | Offline audio | **Post-release** | Medium | Patched (next release) | TC-OFFLINE-01 |

**Issue-log note (Risk Register cross-ref):** DF-07/DF-08 occurred *after* release and are moved
to the **issue log**, not the risk register (they are now facts, not probabilities).

---

## 8. Defect Density & DRE Computation

### 8.1 Defect density

```
density = total_defects / size
        = 8 defects / 18.0 KLOC (assumed delivered LOC for v1, single contributor)
        = 0.44 defects per KLOC
```

*Auxiliary lens (per module for the two riskiest modules):*

```
Unlock module:  2 defects / 1.2 KLOC = 1.67 defects/KLOC
Streak module:  2 defects / 0.9 KLOC = 2.22 defects/KLOC
```

The unlock + streak modules are the densest — which is why §4–§5 use **exhaustive decision tables**,
and why both are gated by the single `RuleSet` service (LL-UML-Package §7) so defect fixes land in
one place.

### 8.2 Defect removal efficiency (DRE)

```
DRE = defects_found_before_delivery / total_defects
    = 6 / (6 + 2)
    = 0.75  →  75%
```

Interpretation: the pre-release test phase removed **75%** of all defects found across the lifecycle;
2 escaped to production (DF-07, DF-08). Target for v1.1: **DRE ≥ 85%** by adding the two missing
negative test groups (repeat-notification idempotency, second-offline-launch cache check).

---

## 9. Traceability Summary

Every FR is linked to its test cases in the matrix above and in LL-SRS-1.0 §8. With the final
regression run green and the defect log closed for all pre-release items, FR-01…FR-11 are each
satisfied by evidence, and NFR-01…06 are each checked by at least one sample measurement. **Exit
criteria met — recommend launch on the content-stream date (27.43 wk) with DF-07/DF-08 slated for
v1.1.**