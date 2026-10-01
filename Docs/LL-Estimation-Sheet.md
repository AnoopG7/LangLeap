# Estimation Sheet — LangLeap

## Project: **LangLeap** — English Language Learning App for Hindi & Marathi Speakers

| Field              | Value                                                       |
| ------------------ | ----------------------------------------------------------- |
| Document number    | LL-Estimation-Sheet-1.0                                     |
| Prepared by        | Anoop (sole contributor)                                    |
| Date               | 01 Oct 2026                                                 |
| Status             | Approved                                                    |
| Related documents | LL-Project-Plan-1.0 · LL-Risk-Register-1.0                  |

---

## Revision History

| Version | Date | Author | Summary |
| ------- | ---- | ------ | ------- |
| 1.0     | 01 Oct 2026 | Anoop | Approved — content & voice durations from given rates |

---

## Approvals

| Role | Name | Decision |
| ---- | ---- | -------- |
| Sole contributor | Anoop | Approved |

---

## Table of Contents

1. Given Figures
2. Content Duration — Step by Step
3. Voice Duration — Step by Step
4. App Development Duration
5. Controlling Stream & Total Project Estimate
6. Budget-Crosscheck (₹ & months)
7. Assumptions
8. Confidence Level & Sensitivity
9. Estimate vs Promise

---

## 1. Given Figures

| # | Given figure | Value |
| - | ------------ | ----- |
| G1 | Lessons written in first 8 weeks | 35 |
| G2 | Target lessons at launch | 120 |
| G3 | Voice recording effort per lesson | 1.5 h |
| G4 | Voice artist availability | 15 h / week |
| G5 | App development duration | 20 weeks |
| G6 | Budget | ₹35 lakh |
| G7 | Timeline | 6 months |

No other figures are used.

---

## 2. Content Duration — Step by Step

**Step 1 — measured weekly rate**

```
weekly_rate = lessons_written / weeks_taken
            = 35 / 8
            = 4.375  lessons per week
```

**Step 2 — weeks for the full catalog**

```
weeks_needed = target_lessons / weekly_rate
             = 120 / 4.375
             = 27.428…
             = 27.43 wk  (≈ 27 wk + 3 days)
```

**Step 3 — remaining after the first 8 weeks**

```
remaining_lessons = 120 − 35 = 85
remaining_weeks   = 85 / 4.375 = 19.43 wk
```
*(matches CONT-2 in LL-Project-Plan-1.0; 8 + 19.43 = 27.43 ✔)*

---

## 3. Voice Duration — Step by Step

**Step 1 — lessons voiced per week**

```
lessons_per_week = artist_weekly_hours / hours_per_lesson
                 = 15 / 1.5
                 = 10  lessons per week
```

**Step 2 — weeks for the full catalog**

```
weeks_needed = 120 / 10
             = 12 wk
```

**Step 3 — phasing against content**

```
VO-1 (lessons 1–40) = 40 / 10 = 4 wk   (starts when 35 scripts exist)
VO-2 (lessons 41–120) = 80 / 10 = 8 wk (finishes at wk 20)
```

---

## 4. App Development Duration

Given directly: **G5 = 20 weeks**. No computation is performed; the figure is assumed constant.

---

## 5. Controlling Stream & Total Project Estimate

Streams run in parallel:

```
content finishes at  27.43 wk   (Section 2)
voice   finishes at  20.00 wk   (12 wk starting after first scripts)
app     finishes at  20.00 wk   (G5)
```

**Controlling stream** — the chain with the *longest* finish:

```
T_project = max(27.43, 20, 20) = 27.43 wk  →  CONTENT stream controls the launch
```

Integration (INT-1) finishes at wk 21.00, inside the content window; the launch milestone is pinned
at **27.43 wk** (see LL-Project-Plan-1.0 §5).

---

## 6. Budget Crosscheck (₹ & months)

```
budget_months = 27.43 wk ÷ 4.33 wk/month
              = 6.33 months
approved       = 6.00 months
overrun        = 0.33 month ≈ 1.43 wk ≈ 10 working days
```

> At the given content rate the project **exceeds the 6-month board approval by ~1.4 weeks**.
> This is not a promise-breaker; it is a named risk (R-01 in LL-Risk-Register-1.0) with a
> response: add a second writer (→ 8.75 lessons/wk → content finishes in 13.7 wk → entire launch
> fits comfortably inside 20 wk and the app stream then **controls** the launch).

**Money:** ₹35 lakh is a cost ceiling, not a duration driver in this sheet; it constrains the
"second writer" response (R-01) and is tracked in the Risk Register.

---

## 7. Assumptions

| # | Assumption | Why it matters |
| - | ---------- | -------------- |
| A1 | Content throughput is constant at 4.375 lessons/wk (no ramp-up/learning curve) | Overstates/understates a realistic S-curve |
| A2 | The 8-week figure is net of QA & edits | If QA is extra, content weeks grow |
| A3 | One voice artist at a steady 15 h/wk, no sick leave | Availability is already risk R-03 |
| A4 | Voice effort is flat at 1.5 h/lesson (hard lessons cost the same) | Averaging effect |
| A5 | All three streams can truly run in parallel with no cross-stream contention | Content QA does not need app build; edits reuse same writer |
| A6 | A lesson = its text, quiz and audio; no re-record churn counted (versioning absorbs it) | Audio re-records would add to VO-2 |

If any assumption breaks, the totals move — see sensitivity below.

---

## 8. Confidence Level & Sensitivity

| Stream | Base | Low (−20%) | High (+20%) | Confidence |
| ------ | ---- | ---------- | ----------- | ---------- |
| Content | 27.43 wk | 34.29 wk | 22.86 wk | **Medium** — rate is measured from 8 wks only (small sample, G1) |
| Voice   | 12.00 wk | 15.00 wk | 10.00 wk | Medium — entirely assumption-based (no live artist data) |
| App     | 20.00 wk | 25.00 wk | 16.67 wk | High — stated directly in the brief (G5) |

- The **content** and **voice** figures are **estimates**: derived from two observed data points and
  one assumed productivity. The **app** figure is a **given**.
- Overall schedule confidence is pinned by **content** (the least evidence-backed driver).

---

## 9. Estimate vs Promise

> Every number above is an **estimate, not a promise**. An estimate is the most-likely value of a
> calculation over uncertain rates (measurement + assumption). A promise would fix that value
> against schedule risk. The measured content rate (35/8) is a real observation, but the voice rate
> (15 h/wk) and the constant-throughput assumption are planning inputs. We therefore quote
> 27.43 wk as an estimate with Medium confidence, and we *promise* only what the plan can hold:
> a review of content throughput every 2 weeks, with the second-writer trigger (R-01) if the
> weekly run-rate ever drops more than 10% below 4.375.