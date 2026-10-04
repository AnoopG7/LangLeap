# LangLeap — Estimation Sheet

**Version:** 1.0  
**Date:** October 2026  
**Author:** Team LangLeap  

---

## 1. Content Estimation

### 1.1 Given Data

| Parameter | Value | Source |
|---|---|---|
| Lessons completed | 35 | Given |
| Time taken | 8 weeks | Given |
| Target lessons at launch | 120 | Given |

### 1.2 Weekly Content Rate

```
Weekly rate = Lessons completed ÷ Weeks taken
            = 35 ÷ 8
            = 4.375 lessons/week
```

**Interpretation:** The content team produces approximately **4.375 lessons per week** (or about 4 lessons per week with an extra lesson every other week).

### 1.3 Remaining Content Duration

```
Remaining lessons = Target − Completed
                  = 120 − 35
                  = 85 lessons

Weeks needed = Remaining lessons ÷ Weekly rate
             = 85 ÷ 4.375
             = 19.43 weeks
             ≈ 20 weeks (rounded up — can't ship a partial week)
```

### 1.4 Total Content Duration

```
Total content time = Already spent + Remaining
                   = 8 + 20
                   = 28 weeks from project start
```

### 1.5 Confidence Analysis

| Factor | Impact | Assumption |
|---|---|---|
| Linear production rate | Optimistic | Assumes the team maintains 4.375 lessons/week without burnout or scope creep |
| No rework | Optimistic | Assumes all lessons pass review on first attempt; in practice, ~15–20% may need rework |
| Team stability | Assumed | All current content writers remain available for the full 20 weeks |
| Quality consistency | Moderate | Later lessons may cover harder topics (A2 level) requiring more research time |

**Adjusted estimate (pessimistic):**

```
Rework factor = 1.15 (assume 15% of lessons need one revision cycle)
Adjusted weeks = 20 × 1.15 = 23 weeks
Adjusted total = 8 + 23 = 31 weeks
```

> **Why this is an estimate, not a promise:** The weekly rate of 4.375 is a historical average over 8 weeks. It assumes identical conditions going forward — same team, same difficulty, same review pass rate. Any change (writer leaves, harder topics, stricter QA) can push the number higher. Conversely, adding a second writer or simplifying lesson templates could pull it lower. The estimate gives a planning baseline, not a guarantee.

---

## 2. Voice Recording Estimation

### 2.1 Given Data

| Parameter | Value | Source |
|---|---|---|
| Recording time per lesson | 1.5 hours | Given |
| Voice artist availability | 15 hours/week | Given |
| Total lessons | 120 | Given |

### 2.2 Total Recording Hours

```
Total hours = Lessons × Hours per lesson
            = 120 × 1.5
            = 180 hours
```

### 2.3 Weeks Needed

```
Weeks = Total hours ÷ Weekly capacity
      = 180 ÷ 15
      = 12 weeks
```

### 2.4 Breakdown by Phase

| Phase | Lessons | Hours | Weeks |
|---|---|---|---|
| Already-authored (1–35) | 35 | 35 × 1.5 = 52.5 | 52.5 ÷ 15 = 3.5 |
| Future batches (36–120) | 85 | 85 × 1.5 = 127.5 | 127.5 ÷ 15 = 8.5 |
| **Total** | **120** | **180** | **12** |

### 2.5 Confidence Analysis

| Factor | Impact | Assumption |
|---|---|---|
| 1.5 hrs/lesson includes setup | Moderate | Assumes the 1.5 hours covers microphone setup, warm-up, and recording. If setup is separate, actual recording is faster per lesson |
| Re-recording rate | Moderate | The ±10% audio tolerance (FR-11) means some takes will fail QA. Assume 10% re-record rate |
| Artist availability | Assumed | Single artist at 15 hrs/week; illness, travel, or fatigue could reduce capacity |
| Batch scheduling | Moderate | Voice recording can't start for a lesson until its script is authored and reviewed |

**Adjusted estimate (pessimistic):**

```
Re-record factor = 1.10 (10% of lessons need one re-take)
Adjusted hours = 180 × 1.10 = 198 hours
Adjusted weeks = 198 ÷ 15 = 13.2 ≈ 14 weeks
```

> **Why this is an estimate, not a promise:** The 1.5 hours/lesson rate is a given constant, but studio conditions, artist fatigue, and QA rejections introduce variability. A single sick week (−15 hours) adds a full week to the timeline. The estimate is useful for planning but should carry a ±2 week buffer.

---

## 3. App Development Estimation

### 3.1 Given Data

| Parameter | Value |
|---|---|
| Total development | 20 weeks (given) |

### 3.2 Component-Level Breakdown (Estimated)

| Component | Estimated Weeks | Justification |
|---|---|---|
| DB schema + migrations | 1 | Well-defined domain model from SRS |
| Backend API (Auth + CRUD) | 5 | 5 endpoints × ~1 week each |
| Backend API (Sync + Notifications) | 2 | Lower complexity |
| Frontend — Learner app | 6 | Already partially built (demo exists); need API integration |
| Frontend — Studio | 4 | 3 pages already built; need backend connection |
| DevOps (CI/CD, staging, prod) | 2 | Standard pipeline setup |
| **Total** | **20** | Matches given data |

### 3.3 Confidence Level

The frontend already exists as a working demo. The development estimate is primarily backend + integration work. Confidence: **Medium-High** (75–85%).

---

## 4. Budget Estimation

### 4.1 Given Data

| Parameter | Value |
|---|---|
| Approved budget | ₹35,00,000 (₹35 lakh) |
| Project duration | 6 months (26 weeks) |

### 4.2 Estimated Cost Breakdown

| Category | Monthly Rate (₹) | Duration | Total (₹) | Assumptions |
|---|---|---|---|---|
| Content Writer × 1 | 40,000 | 6 months | 2,40,000 | Mid-level writer |
| Hindi Translator (part-time) | 20,000 | 3 months | 60,000 | Gloss verification |
| Marathi Translator (part-time) | 20,000 | 3 months | 60,000 | Gloss verification |
| Voice Artist × 1 | 50,000 | 3 months | 1,50,000 | Professional voice talent |
| Developer × 1 | 60,000 | 6 months | 3,60,000 | Full-stack developer |
| Cloud hosting (staging + prod) | 5,000 | 6 months | 30,000 | VPS + managed DB |
| Tools & licenses | — | — | 50,000 | IDE, CI, testing tools |
| QA / Testing | 30,000 | 2 months | 60,000 | Contract tester |
| Contingency (15%) | — | — | 1,36,500 | Unforeseen delays |
| **Total** | | | **₹11,46,500** | Under budget |

### 4.3 Budget Analysis

```
Budget utilised  = ₹11,46,500
Budget approved  = ₹35,00,000
Remaining        = ₹23,53,500

Buffer percentage = (35,00,000 − 11,46,500) / 35,00,000 × 100
                  = 67.2% buffer
```

The project is well within budget. The surplus allows for:
- Hiring a second content writer to accelerate the critical path
- Bringing on a second voice artist to parallelize recording
- Extended beta testing with paid pilot users

---

## 5. Six-Month Mitigation and Buffer Plan

The supplied baseline rate cannot meet the approved 26-week window: `27.43 > 26`. The selected launch plan therefore adds a second content capacity pod and targets 5 lessons/week during the production window.

```
Planned throughput = 120 lessons ÷ 24 production weeks = 5 lessons/week
Capacity uplift    = (5 ÷ 4.375) − 1 = 14.29%
Launch buffer      = 26 approved weeks − 24 production weeks = 2 weeks
```

Content is complete by week 24, voice uses 12 weeks in parallel, application development uses the given 20 weeks, and weeks 25-26 cover integration testing, migration rehearsal, rollback verification and launch approval. The original 28-week figure remains the unmitigated baseline, not the selected commitment.

## 6. Summary

| Stream | Duration | Controls Launch? |
|---|---|---|
| **Content baseline** | **27.43 weeks** | **Controls without mitigation** |
| **Content launch plan** | **24 weeks at 5/week** | **Critical supply stream** |
| Voice recording | 12 weeks | No (float: 8–16 weeks depending on start) |
| App development | 20 weeks | No (float: 6 weeks) |
| Integration and launch buffer | 2 weeks | Reserved inside 26 weeks |
| Budget window | 26 weeks | Launch plan fits |

**Key insight:** The historical content rate is the bottleneck, but the documented 14.29% capacity uplift makes the selected plan fit the six-month window with a two-week buffer.

---

*End of Estimation Sheet*
