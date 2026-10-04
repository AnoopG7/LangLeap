# LangLeap — Project Plan

**Version:** 1.0  
**Date:** October 2026  
**Author:** Team LangLeap  

---

## 1. Work Breakdown Structure (WBS)

```
1.0 LangLeap
├── 1.1 Project Management
│   ├── 1.1.1 Requirements gathering & SRS
│   ├── 1.1.2 Sprint planning & tracking
│   └── 1.1.3 Project closure & lessons learned
│
├── 1.2 Content Pipeline (CRITICAL — CONTROLLING STREAM)
│   ├── 1.2.1 Lesson authoring (script + quiz + glosses)
│   │   ├── 1.2.1.1 Lessons 1–35  (already done, weeks 1–8)
│   │   ├── 1.2.1.2 Lessons 36–70 (weeks 9–16)
│   │   ├── 1.2.1.3 Lessons 71–105 (weeks 17–24)
│   │   └── 1.2.1.4 Lessons 106–120 (weeks 25–28)
│   ├── 1.2.2 Content review & quality assurance
│   └── 1.2.3 Bilingual gloss verification (Hindi + Marathi)
│
├── 1.3 Voice Recording
│   ├── 1.3.1 Recording sessions (1.5 hrs × 120 lessons)
│   ├── 1.3.2 Audio QA & tolerance check (±10%)
│   └── 1.3.3 Re-recording failed takes
│
├── 1.4 App Development (20 weeks)
│   ├── 1.4.1 Frontend — Learner app
│   │   ├── 1.4.1.1 Lesson study (FR-01, FR-02, FR-04)
│   │   ├── 1.4.1.2 Quiz engine (FR-03, FR-07)
│   │   ├── 1.4.1.3 Dashboard & progress (FR-09)
│   │   ├── 1.4.1.4 Streak system (FR-08)
│   │   ├── 1.4.1.5 Notifications (FR-10)
│   │   └── 1.4.1.6 Offline support & sync (NFR-01)
│   ├── 1.4.2 Frontend — Content Studio
│   │   ├── 1.4.2.1 Lesson authoring page
│   │   ├── 1.4.2.2 Voice recording page
│   │   └── 1.4.2.3 Review & publish gate (FR-11)
│   ├── 1.4.3 Backend API
│   │   ├── 1.4.3.1 Auth (sign-in, sign-up, JWT, RBAC)
│   │   ├── 1.4.3.2 Lessons CRUD API
│   │   ├── 1.4.3.3 Progress & streak API
│   │   ├── 1.4.3.4 Offline sync endpoint
│   │   └── 1.4.3.5 Notifications API
│   ├── 1.4.4 Database
│   │   ├── 1.4.4.1 Schema design & migration
│   │   └── 1.4.4.2 Seed data
│   └── 1.4.5 DevOps & Deployment
│       ├── 1.4.5.1 CI/CD pipeline
│       ├── 1.4.5.2 Staging environment
│       └── 1.4.5.3 Production deployment
│
├── 1.5 Testing
│   ├── 1.5.1 Unit tests (logic functions)
│   ├── 1.5.2 Integration tests (API)
│   ├── 1.5.3 BVA & decision table tests
│   ├── 1.5.4 UAT (pilot learners)
│   └── 1.5.5 Performance testing
│
└── 1.6 Launch
    ├── 1.6.1 Beta release (internal)
    ├── 1.6.2 Pilot release (50 learners)
    └── 1.6.3 Public launch
```

---

## 2. Stream Analysis — Identifying the Controlling Stream

### 2.1 Content Pipeline

| Metric | Calculation |
|---|---|
| **Lessons produced** | 35 in 8 weeks |
| **Weekly rate** | 35 ÷ 8 = **4.375 lessons/week** |
| **Remaining lessons** | 120 − 35 = **85 lessons** |
| **Weeks needed** | 85 ÷ 4.375 = **19.43 weeks** ≈ **20 weeks** |
| **Total from start** | 8 + 20 = **28 weeks** |

### 2.2 Voice Recording

| Metric | Calculation |
|---|---|
| **Hours per lesson** | 1.5 hours |
| **Total hours** | 120 × 1.5 = **180 hours** |
| **Artist capacity** | 15 hours/week |
| **Weeks needed** | 180 ÷ 15 = **12 weeks** |

### 2.3 App Development

| Metric | Value |
|---|---|
| **Total duration** | **20 weeks** (given) |

### 2.4 Controlling Stream

```
Content:   ████████████████████████████  28 weeks  ◄── LONGEST (CRITICAL)
Voice:     ████████████                  12 weeks
Dev:       ████████████████████          20 weeks
Budget:    ██████████████████████████    26 weeks (6 months)
```

> **Unmitigated baseline:** the content pipeline requires 27.43 weeks, or 28 calendar weeks, and misses the 26-week window. This is the primary project risk. The selected launch plan below uses a documented capacity uplift rather than treating the baseline miss as the final schedule.

### 2.5 Selected 26-Week Launch Plan

| Workstream | Planned window | Completion target | Schedule treatment |
|---|---:|---:|---|
| Requirements and architecture | Weeks 1-4 | Approved baseline | Runs in parallel with initial content backlog |
| Content production | Weeks 1-24 | 120 lessons at 5/week | Requires 14.29% uplift over the observed 4.375/week |
| Voice recording and audio QA | Weeks 5-16 | 180 hours at 15 hours/week | Consumes approved content batches |
| Application development | Weeks 5-24 | Given 20-week build | Backend, frontend, offline sync and DevOps |
| Integration, UAT and release rehearsal | Weeks 25-26 | Launch-ready evidence | Two-week schedule buffer |

This is the authoritative launch schedule. The 28/29-week network below is retained as the unmitigated risk baseline for comparison; it must not be used as the committed release date.

---

## 3. Network Diagram & Critical Path

### 3.1 Task Dependencies

| ID | Task | Duration (wks) | Predecessors | Float |
|---|---|---|---|---|
| A | Requirements & SRS | 2 | — | 6 |
| B | DB schema design | 1 | A | 5 |
| C | Backend API development | 10 | B | 6 |
| D | Frontend — Learner app | 12 | A | 6 |
| E | Frontend — Studio | 6 | D | 10 |
| F | Content authoring (L36–120) | 20 | — | **0** ★ |
| G | Voice recording | 12 | F (staggered; starts when first batch of new lessons ready) | 8 |
| H | Content review & gloss QA | 4 | F, G | **0** ★ |
| I | Integration testing | 3 | C, D, E, H | **0** ★ |
| J | UAT & pilot | 2 | I | **0** ★ |
| K | Performance & security testing | 2 | C, D | 3 |
| L | DevOps / CI-CD setup | 2 | C | 11 |
| M | Beta release | 0 (milestone) | I | **0** ★ |
| N | Public launch | 0 (milestone) | J, K | **0** ★ |

### 3.2 Critical Path

```
F (Content 20w) ──► H (Review 4w) ──► I (Integration 3w) ──► J (UAT 2w) ──► N (Launch)

Total critical path = 20 + 4 + 3 + 2 = 29 weeks
```

**Critical path:** `F → H → I → J → N`

All tasks on this path have **zero float**; any delay here delays the launch.

### 3.3 Float Summary

| Task | Total Float (weeks) |
|---|---|
| A (Requirements) | 6 |
| B (DB schema) | 5 |
| C (Backend API) | 6 |
| D (Frontend learner) | 6 |
| E (Frontend studio) | 10 |
| **F (Content authoring)** | **0 (critical)** |
| G (Voice recording) | 8 |
| **H (Content review)** | **0 (critical)** |
| **I (Integration testing)** | **0 (critical)** |
| **J (UAT)** | **0 (critical)** |
| K (Perf/security test) | 3 |
| L (DevOps) | 11 |

---

## 4. Gantt Chart with Milestones

```
Week:  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29
       │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │

A Req  ██
B DB      █
C API        ██████████
D FE-L   ████████████████████████
E FE-S                           ████████████
F Cont ████████████████████████████████████████                              ← CRITICAL
G Voice                  ████████████████████████
H Rev                                            ████████                   ← CRITICAL
I Int                                                    ██████             ← CRITICAL
J UAT                                                          ████        ← CRITICAL
K Perf                                     ████
L DevOps         ████
                                                                    │
Milestones:                                                         │
  ◆ M1  Week 2  — SRS sign-off                                     │
  ◆ M2  Week 3  — DB schema complete                               │
  ◆ M3  Week 14 — Frontend demo ready                              │
  ◆ M4  Week 13 — Backend API v1 complete                          │
  ◆ M5  Week 20 — All 120 lessons authored                         │
  ◆ M6  Week 24 — All voice recordings done                        │
  ◆ M7  Week 24 — Content review complete                          │
  ◆ M8  Week 27 — Integration testing complete (Beta) ◆            │
  ◆ M9  Week 29 — Public launch ◆                                  │
```

---

## 5. Resource Allocation

| Resource | Stream | Weeks Active | Load |
|---|---|---|---|
| **Content Writer(s)** | Content authoring (F) | Weeks 1–20 (ongoing since project start) | 100% |
| **Hindi Translator** | Gloss verification (part of H) | Weeks 20–24 | 50% |
| **Marathi Translator** | Gloss verification (part of H) | Weeks 20–24 | 50% |
| **Voice Artist** | Voice recording (G) | Weeks 9–20 | 100% (15 hrs/wk) |
| **Developer 1 (You)** | Backend + DB + DevOps (B, C, L) | Weeks 1–29 | 100% |
| **Developer 2 (AI pair)** | Frontend learner + studio (D, E) | Weeks 1–20 | 100% |
| **Reviewer** | Content review (H) | Weeks 20–24 | 75% |
| **Tester** | Testing (I, J, K) | Weeks 24–29 | 100% |

---

## 6. Risk to Schedule

The content pipeline at 28 weeks already **exceeds the 26-week budget window**. Mitigation strategies:

1. **Hire a second content writer** (reduce content authoring to ~11 weeks).
2. **Reduce launch scope** to 80 lessons (16 weeks of content → fits in 26 weeks).
3. **Overlap review with authoring** (rolling reviews every 10 lessons instead of a single gate).
4. **Parallelize voice recording** with content (stagger: record each batch as soon as authoring completes).

---

*End of Project Plan*
