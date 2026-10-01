# Risk Register & Closure Note — LangLeap

## Project: **LangLeap** — English Language Learning App for Hindi & Marathi Speakers

| Field              | Value                                                       |
| ------------------ | ----------------------------------------------------------- |
| Document number    | LL-Risk-Register-1.0                                        |
| Prepared by        | Anoop (sole contributor — PM)                               |
| Date               | 01 Oct 2026                                                 |
| Status             | Approved                                                    |
| Related documents | LL-Estimation-Sheet-1.0 · LL-Project-Plan-1.0 · LL-Test-Plan-1.0 |

---

## Revision History

| Version | Date | Author | Summary |
| ------- | ---- | ------ | ------- |
| 1.0     | 01 Oct 2026 | Anoop | Approved — register, P×I matrix, RMMM top 3, issue log, lessons learned |

---

## Approvals

| Role | Name | Decision |
| ---- | ---- | -------- |
| Sole contributor, PM | Anoop | Approved |

---

## Table of Contents

1. Scoring Scale
2. Risk Register (exposure-ranked)
3. Probability–Impact Matrix
4. RMMM Response — Top Three Risks
5. Issue Log (already-occurred problems)
6. Closure Note & Lessons Learned

---

## 1. Scoring Scale

| Score | Probability (P) | Impact (I) |
| ----- | --------------- | ---------- |
| 1 | Very unlikely (< 5%) | Negligible |
| 2 | Unlikely (5–25%) | Minor (≤ 1 wk delay / low quality) |
| 3 | Possible (25–50%) | Moderate (1–3 wk delay / quality gate breach) |
| 4 | Likely (50–75%) | Major (3–6 wk delay / launch slip) |
| 5 | Almost certain (> 75%) | Catastrophic (launch slip > 6 wk / product unusable) |

**Exposure = P × I** (5–25); rank by descending exposure.

---

## 2. Risk Register (exposure-ranked)

| Rank | ID | Risk | P | I | Exposure | Response | Owner |
| ---- | -- | ---- | - | - | -------- | -------- | ----- |
| 1 | R-01 | Content stream (27.43 wk) exceeds the 6-month budget (~26 wk); launch slips ~1.4 wk | 4 | 4 | **16** | See §4.1 (second-writer trigger) | Anoop / head of content |
| 2 | R-02 | Content quality misses the QA gate (script/quiz/audio mismatch) → rework on the critical path | 3 | 4 | **12** | See §4.2 (gate + audit) | Anoop (QA) |
| 3 | R-03 | Voice artist unavailable at 15 h/wk (leave/illness) → voice slips into the content window | 3 | 4 | **12** | See §4.3 (pool + TTS fallback + buffer) | Anoop |
| 4 | R-04 | Scope creep (leaderboards, live classes) pulls effort off the critical path | 2 | 5 | **10** | Freeze backlog vs FR MoSCoW; change control | Anoop |
| 5 | R-05 | Single-contributor bus factor (dev/docs/QA all one person) | 2 | 5 | **10** | Documentation, weekly backups, handoff notes (this package is the mitigation) | Anoop |
| 6 | R-06 | Late lesson re-versioning invalidates recorded audio (re-record churn) | 3 | 3 | **9** | Version-pinned audio (UML §7); freeze scripts at recording | Anoop |
| 7 | R-07 | Offline sync drops/grades a quiz attempt (data corruption) | 2 | 4 | **8** | Queue + idempotency keys; re-test DF-04 pattern | Anoop |
| 8 | R-08 | Performance on mid-range Android misses NFR-02 → poor speaking UX | 2 | 3 | **6** | Reference-device lab; audio-stack budget | Anoop |

*Owner note:* for every risk the owner is the sole contributor; content-writer and voice-artist
availability are operational inputs the product head provides — listed in the register so the
product head owns the *input*, Anoop owns the *response*.

---

## 3. Probability–Impact Matrix

| P ↓ \ I → | 1 | 2 | 3 | 4 | 5 |
| --------- | - | - | - | - | - |
| **5** | | | | | |
| **4** | | | | **R-01** | |
| **3** | | | R-06 | **R-02** · **R-03** | |
| **2** | | R-08 | | R-07 | R-04 · R-05 |
| **1** | | | | | |

Red (≥ 12): R-01, R-02, R-03  ·  Amber (8–11): R-04, R-05, R-06, R-07  ·  Green (≤ 7): R-08

---

## 4. RMMM Response — Top Three Risks

### 4.1 R-01 — Content overrun (Monitor → Mitigate → Manage)

- **Monitor:** track weekly lesson run-rate; a drop > 10% below 4.375 lessons/wk triggers review.
- **Mitigate:** recruit/adopt a **second writer** → 8.75 lessons/wk → content finishes in 13.7 wk;
  launch then lands inside the app stream (20 wk) with the app stream **controlling** the launch.
- **Manage:** if second writer is unavailable, re-base the launch to 100 lessons (planned cut = 20)
  and ship the remainder as a track update in week 6 — visibility, not silent slip.

### 4.2 R-02 — Content quality gate breach (Mitigate)

- Automated gate (FR-11) blocks publish when: script length outside limits, quiz has < 3 items,
  or audio-duration mismatch > 10% of script target. Gate results feed NF-QUAL-01.
- Random audit of 10% of published lessons each sprint; flagged-error rate target < 1%/month (NFR-04).
- Defect precedent: DF-06 (audio +31% accepted) already fixed the tolerance rule — regression-lock it.

### 4.3 R-03 — Voice artist availability (Mitigate + Contingency)

- Buffer: voice stream has 7.43 wk float (Project Plan §5) — absorb ≤ 7 wk of artist downtime.
- Contingency in order: (1) second artist for overflow, (2) TTS fallback for low-risk glossary items
  with live-artist classes kept for core lessons, (3) reduce from full-18 lines to 12 per lesson (script-level cut, QA-gated).

---

## 5. Issue Log (already-occurred problems)

Separate from risks: these are facts, already happened, each with a resolution.

| ID | Date | Issue | Resolution / Status |
| -- | ---- | ----- | ------------------- |
| IS-01 | wk 1–8 | Content team averaged 4.375 lessons/wk (35 in 8 wks) — the estimate driver | Accepted as baseline; no further action (this is the given figure used in LL-Estimation-Sheet) |
| IS-02 | pre-release | DF-01…DF-06 found in internal testing (quiz pass edge, unlock edge, streak freeze, sync residue, locale loss, audio tolerance) | All fixed & regression-verified (LL-Test-Plan §7) |
| IS-03 | post-release | DF-07 duplicate reminder; DF-08 offline audio cache miss on 2nd launch | Slated for v1.1 patched release; DRE target raised to 85% |

---

## 6. Closure Note & Lessons Learned

### 6.1 Closure note

The plan closes with: content = **27.43 wk** (controlling stream), voice = **12 wk**, app = **20 wk**,
launch milestone **M0 at 27.43 wk**. With R-01's second-writer response implemented, launch re-bases
inside 20 wk. Budget ₹35 lakh is a ceiling, not a duration lever. All FR/NFR gates met per
LL-Test-Plan-1.0 (§9); exit criteria met.

### 6.2 Lessons learned (solo project)

1. **The critical path is a measurement, not a promise.** The single content figure (35/8) drove
   the whole plan — the first lesson learned is to re-measure content throughput every 2 weeks.
2. **Isolate the variable logic early.** Putting unlock and streak decisions in one `RuleSet`
   service meant the density hotspots (LL-Test-Plan §8.1) were testable as decision tables before
   any UI existed — and miscounting a decision table row caught DF-02/DF-03 in minutes, not days.
3. **Version the content, freeze the scripts** before recording. Audio re-recording because of late
   script edits was the top cost driver after content itself (R-06).
4. **Float is a warning, not a gift.** The voice/app streams carry ≈ 7.4 wk float; the discipline is
   to report against it weekly so Should-features (streaks, reminders, speaking) are trimmed before
   they threaten M0.
5. **As a single contributor, write the evidence as you go.** Metrics (DRE 75%, defect density
   0.44/KLOC) and this closure note are only possible because the test log was maintained live.
6. **Estimate ≠ promise.** We published the number, the formula, the assumption and the confidence
   level (LL-Estimation-Sheet §8–§9) — and explicitly promised only the review trigger, so a slip
   is a *decision point* (R-01 §4.1), not a failure.