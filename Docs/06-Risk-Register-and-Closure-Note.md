# LangLeap — Risk Register & Project Closure Note

**Version:** 1.0  
**Date:** October 2026  
**Author:** Team LangLeap  

---

## 1. Risk Management Framework

### 1.1 Methodology

LangLeap applies standard Risk Management principles (SEI Continuous Risk Management model) to identify, analyze, plan, track, and control project risks across all three project streams: **Content Pipeline**, **Voice Production**, and **App Development**.

Risks are quantified using the **Exposure formula**:

$$\text{Risk Exposure (RE)} = \text{Probability } (P) \times \text{Impact } (I)$$

Where:
- **Probability ($P$):** 1 (Very Low / Rare, $< 10\%$) to 5 (Very High / Almost Certain, $> 70\%$)
- **Impact ($I$):** 1 (Negligible) to 5 (Catastrophic / Project Failure)
- **Risk Exposure Score ($RE$):** 1 to 25

### 1.2 Probability & Impact Rating Scales

| Score | Probability ($P$) Definition | Impact ($I$) Definition |
|---|---|---|
| **1 (Very Low)** | Rare ($<10\%$ likelihood); unlikely under standard conditions | Schedule shift $< 3$ days; budget impact $< 1\%$; trivial defect |
| **2 (Low)** | Unlikely ($10\% - 30\%$); minor volatility | Schedule shift $0.5 - 1$ week; budget impact $1\% - 3\%$; minor feature degraded |
| **3 (Moderate)** | Possible ($30\% - 50\%$); moderate historical occurrence | Schedule shift $1 - 2$ weeks; budget impact $3\% - 7\%$; major feature delayed |
| **4 (High)** | Likely ($50\% - 70\%$); substantial chance of occurrence | Schedule shift $2 - 4$ weeks; budget impact $7\% - 15\%$; launch date at risk |
| **5 (Very High)** | Near Certain ($> 70\%$); already trending toward reality | Schedule shift $> 4$ weeks; budget overrun $> 15\%$; board deadline breach |

### 1.3 5×5 Probability-Impact Matrix & Heat Map

```
  5 │  [Low-5]     [Med-10]    [High-15]   [Crit-20]   [Crit-25]
    │                          (R-04)      (R-02)      (R-01)
  4 │  [Low-4]     [Med-8]     [Med-12]    [High-16]   [Crit-20]
P   │                          (R-06)      (R-03)      
R 3 │  [Low-3]     [Low-6]     [Med-9]     [Med-12]    [High-15]
O   │                          (R-05)      (R-07)      (R-08)
B 2 │  [Low-2]     [Low-4]     [Low-6]     [Med-8]     [Med-10]
    │  (R-09)                              (R-10)      
  1 │  [Low-1]     [Low-2]     [Low-3]     [Low-4]     [Med-5]
    └───────────────────────────────────────────────────────────
          1           2           3           4           5
                             IMPACT
```

#### Heat Map Classification
- **Critical (Red, Score 17–25):** Immediate executive attention, daily tracking, active contingency implementation.
- **High (Orange, Score 13–16):** Weekly review, dedicated mitigation strategies, strict trigger thresholds.
- **Medium (Yellow, Score 7–12):** Bi-weekly monitoring, standard operational controls.
- **Low (Green, Score 1–6):** Periodic review, accept with baseline tracking.

---

## 2. Exposure-Ranked Risk Register

| Risk ID | Risk Description | Category | Prob ($P$) | Impact ($I$) | Exposure ($P \times I$) | Severity Tier | Response Strategy | Owner | Trigger / Indicator |
|---|---|---|:---:|:---:|:---:|:---:|---|---|---|
| **R-01** | **Content rate slippage:** Content team writes at 4.375 lessons/wk, needing 19.43 weeks remaining, leaving zero float against launch | Content / Schedule | 5 | 5 | **25** | **Critical** | Mitigate & Augment | Lead Content Strategist | Weekly output falls below 5 lessons/week for 2 consecutive weeks |
| **R-02** | **Voice artist single-point-of-failure:** Single voice artist capped at 15 hrs/wk; illness or unavailability halts audio pipeline | Resource / Voice | 5 | 4 | **20** | **Critical** | Mitigate & Redundancy | Audio Production Head | Artist logs $< 10$ hrs in any week or illness notification |
| **R-03** | **Bilingual translation inaccuracies:** Nuanced errors in Hindi/Marathi colloquial glosses degrade pedagogical trust | Quality / Content | 4 | 4 | **16** | **High** | Mitigate & Automated Gates | Senior Linguistic Reviewer | Publish gate rejects $> 20\%$ of submitted lessons |
| **R-04** | **Offline sync data conflicts:** Multiple devices or clock-skew tampering corrupt streak status or progress state | Technical / Architecture | 5 | 3 | **15** | **High** | Mitigate & Architecture | Lead Backend Engineer | Sync errors in test log $> 3\%$; clock-skew anomalies detected |
| **R-05** | **Audio payload latency on 3G/low 4G:** High-resolution audio files cause slow streaming/playback in Tier 2/3 cities | Technical / UX | 3 | 3 | **9** | **Medium** | Mitigate & Compression | Mobile/Frontend Lead | Audio buffer stall $> 800\text{ ms}$ on throttled 3G profile |
| **R-06** | **Reviewer bottleneck at publish gate:** Single linguistic reviewer creates a backlog between writing and audio recording | Content / Workflow | 4 | 3 | **12** | **Medium** | Mitigate & Delegation | Project Manager | $> 6$ drafted lessons waiting in "Review" state $> 48\text{ hours}$ |
| **R-07** | **A2 curriculum scope creep:** Advanced lessons take $50\%$ longer to author due to complex grammar and speaking drills | Content / Scope | 3 | 4 | **12** | **Medium** | Transfer / Descope | Product Head | Writing time per lesson exceeds 14 hours during Milestone M2 |
| **R-08** | **Budget overrun from parallel vendor hiring:** Onboarding second voice artist and freelance writers exhausts ₹35 lakh ceiling | Cost / Financial | 3 | 5 | **15** | **High** | Control & Cap | Project Manager | Cumulative burn rate exceeds ₹6.5 lakh/month before Month 4 |
| **R-09** | **Cloud infrastructure downtime:** PaaS/DB outage blocks learner syncing and Content Studio operations | Technical / Ops | 2 | 1 | **2** | **Low** | Accept & Redundancy | DevOps Engineer | Monthly availability drops below $99.9\%$ SLA |
| **R-10** | **App Store / Play Store review delay:** Rejection or delayed approval by Google Play on audio permissions or privacy policies | External / Compliance | 2 | 4 | **8** | **Medium** | Mitigate & Pre-flight | Lead Mobile Engineer | Store submission pending $> 5$ business days |

---

## 3. RMMM Plans for Top 3 Risks

### 3.1 R-01: Content Rate Slippage & Pipeline Bottleneck ($RE = 25$)

#### Risk Context
The board has fixed a 6-month (26-week) deadline and ₹35 lakh budget. The content team has written 35 lessons in 8 weeks (4.375 lessons/week). 85 lessons remain. At the current rate, content requires $85 \div 4.375 = 19.43$ weeks (rounded to 20 weeks). Because voice recording requires finalized text, any slip in writing directly cascades to voice recording, breaching the 26-week deadline.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        RMMM: CONTENT RATE SLIPPAGE                     │
├────────────────────────────────────────────────────────────────────────┤
│ 1. MITIGATION (Proactive Avoidance):                                   │
│    • Standardize lesson template: Script (6-8 turns), 4 glosses,       │
│      5 quiz questions (MCQ + Audio match).                             │
│    • Provide a verified Hindi-Marathi terminology dictionary.          │
│    • Hire 1 additional freelance content writer from contingency fund   │
│      (₹1,50,000 for 12 weeks) to raise team capacity from 4.375        │
│      to 7.0 lessons/week.                                              │
│                                                                        │
│ 2. MONITORING (Early Detection):                                       │
│    • Track weekly burn-up charts in Content Studio.                    │
│    • Daily stand-up check: Lessons in Draft, In-Review, Approved.      │
│    • Weekly Milestone Target: Minimum 6 lessons approved per week.     │
│                                                                        │
│ 3. MANAGEMENT (Contingency Action if Trigger Fires):                   │
│    • Trigger: Approved content rate $< 5$ lessons/week over 2 weeks.   │
│    • Action A: Authorize 15% overtime for in-house content writers.    │
│    • Action B: Split launch scope into tiered milestones: 80 core      │
│      lessons at initial public beta (Week 22), remaining 40 lessons     │
│      delivered via weekly OTA content updates during Week 23-26.       │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 3.2 R-02: Voice Artist Single-Point-of-Failure & Availability Limit ($RE = 20$)

#### Risk Context
Each lesson requires 1.5 hours of studio recording and audio post-processing. Total recording for 120 lessons is 180 hours (127.5 hours remaining for 85 lessons). The sole voice artist is contracted for only 15 hours/week ($15 \text{ hrs/wk} \div 1.5 \text{ hrs/lesson} = 10 \text{ lessons/week}$). If the artist falls ill, resigns, or faces schedule conflicts, voice recording stops completely.

```
┌────────────────────────────────────────────────────────────────────────┐
│                      RMMM: VOICE ARTIST BOTTLENECK                     │
├────────────────────────────────────────────────────────────────────────┤
│ 1. MITIGATION (Proactive Avoidance):                                   │
│    • Contract a qualified secondary voice artist (freelance retainer:  │
│      ₹35,000/month for standby + per-lesson fee).                      │
│    • Standardize audio mastering presets (EQ curve, loudness at -16     │
│      LUFS, sample rate 44.1 kHz, AAC 64 kbps mono) so recordings from  │
│      different studio booths match acoustic profiles identically.      │
│    • Separate male/female tracks: Assign Hindi narration to Artist A    │
│      and Marathi narration to Artist B to double parallel throughput.  │
│                                                                        │
│ 2. MONITORING (Early Detection):                                       │
│    • Weekly tracking of recording hours booked vs. completed.          │
│    • Monitor audio turnaround latency: Target $\le 48\text{ hrs}$ from │
│      content approval to audio delivery.                               │
│                                                                        │
│ 3. MANAGEMENT (Contingency Action if Trigger Fires):                   │
│    • Trigger: Voice artist completes $< 8$ lessons in a scheduled week │
│      or gives notice of unavailability.                                │
│    • Action A: Immediately route queued approved scripts to the        │
│      backup studio/artist.                                             │
│    • Action B: Utilize high-fidelity neural TTS (Text-to-Speech) as an │
│      interim fallback for beta testing, replacing with natural human    │
│      voice prior to final production release.                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 3.3 R-03: Bilingual Translation Inaccuracies & Cultural Nuance Errors ($RE = 16$)

#### Risk Context
Hindi and Marathi speakers have distinct grammatical structures, idioms, and regional variations (e.g., formal vs. colloquial pronouns). Literal or flawed translations in glosses undermine educational value, cause learner confusion, and generate negative early reviews.

```
┌────────────────────────────────────────────────────────────────────────┐
│                  RMMM: CONTENT QUALITY & ACCURACY                      │
├────────────────────────────────────────────────────────────────────────┤
│ 1. MITIGATION (Proactive Avoidance):                                   │
│    • Automated Publish Gate: Pre-validation script checks that:        │
│      - Every English sentence has both non-empty Hindi and Marathi     │
│        glosses.                                                        │
│      - Word length and character sets are valid UTF-8 Devanagari.      │
│      - Exactly 1 correct option is flagged per quiz question.          │
│    • Two-pass human review: Native Hindi reviewer and Native Marathi   │
│      reviewer must both electronically sign off before "Approved" state│
│    • Pilot testing: Conduct weekly comprehension runs with 10 native    │
│      target learners (5 Hindi, 5 Marathi).                             │
│                                                                        │
│ 2. MONITORING (Early Detection):                                       │
│    • Measure Defect Detection Rate at Publish Gate (target: catch      │
│      $100\%$ of translation defects prior to voice recording).         │
│    • Log learner feedback during beta testing for flagged inaccuracies.│
│                                                                        │
│ 3. MANAGEMENT (Contingency Action if Trigger Fires):                   │
│    • Trigger: Publish gate rejects $> 20\%$ of lessons or pilot        │
│      learners report $> 2$ comprehension bugs per lesson.              │
│    • Action A: Freeze authoring of new lessons for 3 days; conduct     │
│      alignment workshop between writers and linguistic reviewers.      │
│    • Action B: Roll back affected lesson via Content Studio CMS        │
│      versioning and publish hotfix within 2 hours.                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Problem & Issue Log (Issues Already Encountered)

*Note: In accordance with software engineering governance standards, risks (future uncertainties) and issues (past or ongoing realities) are strictly segregated.*

| Issue ID | Date Logged | Problem Description | Root Cause | Impact on Project | Resolution / Corrective Action | Status | Owner |
|---|---|---|---|---|---|---|---|
| **ISS-01** | Week 8 | **Content delivery lagging:** Only 35 lessons written in first 8 weeks (target was 50) | Writers lacked clear lesson structure templates; excessive time spent debating quiz formats | 15-lesson deficit; created project critical path dependency | Designed standardized JSON/Markdown schema and authoring guidelines; boosted productivity from 3.5 to 4.375 lessons/wk | **Resolved** | Lead Writer |
| **ISS-02** | Week 6 | **Voice artist availability capped at 15 hrs/wk:** Primary artist took on external commitments | Initial contract did not specify minimum weekly commitment or exclusivity | Voice recording could not be batched in high-volume bursts | Shifted to incremental pipeline model: record 8–10 lessons weekly as scripts are approved rather than batching at the end | **Resolved** | Audio Lead |
| **ISS-03** | Week 7 | **Inconsistent Marathi font rendering:** Devanagari conjuncts rendered broken on older Android Chrome browsers | Missing web-font fallback for specific Marathi Devanagari ligatures (e.g., 'ज्ञ', 'त्र') | Learner UI displayed broken character glyphs ('tofu' boxes) | Integrated Google Fonts *Noto Sans Devanagari* with full unicode subsetting into Vite CSS bundle | **Resolved** | Frontend Lead |
| **ISS-04** | Week 8 | **LocalStorage quota limits in browser demo:** Cached audio base64 payloads exceeded 5MB browser quota | Storing voice preview snippets as Base64 strings in localStorage during early prototyping | Browser threw `QuotaExceededError`, resetting learner state | Architected IndexedDB storage layer with Blob caching for offline audio and lesson data | **Resolved** | Lead Architect |
| **ISS-05** | Week 9 | **Quiz threshold ambiguity:** Writers assumed 75% score passed, while app logic enforced strict $\ge 80\%$ | Lack of centralized configuration in requirements specification | 4 lessons in review rejected due to conflicting passing criteria | Codified `PASSING_THRESHOLD = 80` in central configuration and updated SRS FR-06 | **Resolved** | QA Lead |

---

## 5. Project Closure Note & Lessons Learned

### 5.1 Project Performance Summary

| Metric | Target / Approved | Actual / Forecast at Launch | Variance | Evaluation |
|---|---|---|:---:|---|
| **Delivered Lessons** | 120 lessons (A1/A2 English) | 120 lessons fully authored, voiced, and tested | 0 | Met target |
| **Project Duration** | 26 weeks (6 months) | 26.0 weeks (Week 1 to Week 26) | 0 weeks | On schedule |
| **Total Expenditure** | ₹35,00,000 | ₹33,85,000 | -₹1,15,000 (3.3% surplus) | Under budget |
| **Critical Defect Leakage** | 0 critical bugs in Prod | 0 critical, 2 minor UI defects (DRE = 97.4%) | Exceeded target | High reliability |
| **Voice Audio Quality** | 100% human studio narration | 120 lessons with dual Hindi/Marathi prompts | 100% | High fidelity |

### 5.2 Key Lessons Learned

#### 1. The Power of Loose Coupling between Content & Software
- **Insight:** Embedding lesson data inside frontend code or hardcoded databases created release gridlock.
- **Action Taken:** Decoupling the content pipeline via a headless REST API and versioned JSON schemas enabled writers and voice artists to operate asynchronously without waiting on app deployments.
- **Future Practice:** Treat educational content as dynamic assets served via CDN rather than static bundled code.

#### 2. Realistic Velocity Modeling vs. "Best-Case" Planning
- **Insight:** Assuming writers would write 6+ lessons/week without standardized templates led directly to the Week 8 deficit (ISS-01).
- **Action Taken:** Empirical velocity measurement ($35 \div 8 = 4.375\text{ lessons/wk}$) provided an honest baseline that allowed data-driven mitigation (hiring 1 freelance writer) rather than wishing for miracle speed-ups.
- **Future Practice:** Always base critical-path schedules on demonstrated historical velocity, not idealized estimations.

#### 3. Shift-Left Quality Assurance via Automated Publish Gates
- **Insight:** Manual linguistic review was the largest human bottleneck in the content cycle.
- **Action Taken:** Introducing an automated pre-flight gate that caught empty glosses, malformed JSON, missing audio timestamps, and invalid quiz schemas reduced reviewer cycle time by $65\%$.
- **Future Practice:** Implement linter-style automated verification for all educational content authoring.

#### 4. Offline-First Architecture from Day One
- **Insight:** Over $60\%$ of our target learners in semi-urban and rural areas experience intermittent mobile data. Designing online-first and retrofitting offline sync causes edge-case data corruption.
- **Action Taken:** Transitioned to an IndexedDB-backed offline queue with idempotent UUID-based server synchronization.
- **Future Practice:** Mobile education products in emerging markets must be architected offline-first from the initial prototype.

### 5.3 Sign-Off & Approvals

| Stakeholder Role | Name | Signature / Status | Date |
|---|---|---|---|
| **Product Head** | Rajiv Sharma | **APPROVED** | 2026-10-04 |
| **Lead Software Architect** | Anoop G. | **APPROVED** | 2026-10-04 |
| **Content Strategy Lead** | Sunita Patil | **APPROVED** | 2026-10-04 |
| **Lead Voice Director** | Amit Deshmukh | **APPROVED** | 2026-10-04 |
| **Quality Assurance Lead** | Priya Nair | **APPROVED** | 2026-10-04 |
