# LangLeap Project Documentation

## Product baseline
This is a new, self-contained documentation baseline for `NewProj`, authored from `NewProj/ProblemStatement` and the `NewProj/frontend` product surface. It does not depend on or refer to any earlier documentation set. LangLeap teaches English to Hindi and Marathi speakers through short daily lessons, bilingual glosses, speaking practice, quizzes, progress tracking, streaks, notifications, and a role-based Content Studio.

The current frontend is a frontend-only reference implementation. It uses local storage and simulated audio/pronunciation scoring. The production architecture in [Production Architecture and System Design](07-Production-Architecture-and-System-Design.md) turns those seams into authenticated APIs, durable persistence, object storage, asynchronous workers, and observability.

## Deliverables

| Deliverable | Document | Purpose |
|---|---|---|
| SRS | [SRS](01-SRS-Document.md) | Scope, users, functional and measurable non-functional requirements, constraints, priorities, traceability |
| System design and operations | [Production Architecture and System Design](07-Production-Architecture-and-System-Design.md) | Production architecture, security, data boundaries, APIs, offline sync, deployment, DevOps, operations |
| Database schema | [Database Schema](Database-Schema.md) | Relational model, constraints, indexes, lifecycle and migration notes |
| UML package | [UML Package](02-UML-Package.md) | Use case, class, sequence, activity, state diagrams and cohesion/coupling rationale |
| Project plan | [Project Plan](03-Project-Plan.md) | WBS, network, forward pass, critical path, float, Gantt, milestones and resources |
| Estimation | [Estimation Sheet](04-Estimation-Sheet.md) | Required content and voice calculations, assumptions, confidence and launch control |
| Test and evidence | [Test Plan](05-Test-Plan.md) | Test strategy, BVA, equivalence classes, decision tables, traceability, defect log, DRE and density |
| Risk and closure | [Risk Register and Closure](06-Risk-Register-and-Closure-Note.md) | Ranked risks, RMMM, issue log, lessons learned and closure criteria |

## Shared product rules

- Roles: `learner`, `content_writer`, `voice_artist`, `reviewer`, `admin`, `product_head`.
- Supported learner first languages: Hindi and Marathi.
- Initial English levels: A1 and A2.
- Quiz pass threshold: 70% inclusive.
- Unlock rule: a learner can launch a lesson only when it is published and either it is the first published lesson or the previous published lesson is passed.
- Streak rule: passing a lesson counts for the calendar day; consecutive days increment, a first completion starts a streak, one missed day can be protected by one freeze per Sunday-start calendar week, and an unprotected miss resets the streak.
- Publish gate: English script, Hindi gloss, Marathi gloss, at least three quiz questions, audio, and audio duration within +/-10% of the script target.
- Lesson lifecycle: `draft -> in_review -> published`; rejected work returns to `draft`; old versions may become `deprecated`.
- Offline behavior: published lesson content is readable from cache; quiz results are queued locally and synchronized idempotently when connectivity returns.

## Consistency rule
Requirement IDs (`FR-01` through `FR-11` and `NFR-01` through `NFR-06`), test IDs (`TC-*`), risks (`R-*`), and schedule tasks (`C-*`, `V-*`, `A-*`) are stable cross-document identifiers. A change to a product rule must update the SRS, UML narrative, test decision tables, API/data design, and frontend contract together.
