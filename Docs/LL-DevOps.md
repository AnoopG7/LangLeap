# LangLeap DevOps and Delivery Runbook

## 1. Environments

| Environment | Purpose | Data | Promotion |
| --- | --- | --- | --- |
| Local | Frontend mock and service development | Synthetic local data | Developer branch |
| Preview | Pull-request UI and API integration | Ephemeral synthetic database | Successful CI |
| Staging | Release candidate, device and migration rehearsal | Isolated seeded data | Manual product approval |
| Production | Learners and Content Studio | Encrypted live data | Approved release train |

Each environment has separate identity clients, storage buckets, databases, queues and secrets.
Configuration is injected at runtime; secrets are never committed to this repository.

Database migrations, backup verification, restore drills, and schema ownership are documented
in [LL-Database-Schema.md](LL-Database-Schema.md). Schema changes follow the expand/migrate/contract
pattern described in the release process below.

## 2. CI Pipeline

Every pull request must run:

1. lockfile install with a pinned Node LTS;
2. TypeScript build and ESLint;
3. unit tests for unlock, streak, quiz boundary and sync idempotency rules;
4. component and route tests for each role;
5. accessibility checks and production build;
6. dependency, secret, container and license scans;
7. preview deployment with smoke tests.

The default branch additionally runs API contract tests, database migration validation,
Playwright learner/studio journeys, and a bundle-size budget. A red check blocks merge.

## 3. Release Process

- Merge to the protected default branch only after review and green CI.
- Build immutable container and frontend artifacts identified by commit SHA.
- Run database migrations as a backward-compatible expand step before application rollout.
- Deploy to staging, run smoke tests, verify catalog read, quiz submission, offline replay,
  role authorization and publish gate behavior.
- Obtain product-owner approval, create a release record, then deploy with a canary or blue/green strategy.
- Monitor error rate, latency, queue age and sync success for 30 minutes before full rollout.
- Tag the release and attach test evidence, migration output and rollback instructions.

## 4. Rollback

Application rollback uses the previous immutable artifact. Database changes must be backward
compatible; destructive migrations are delayed until the next release. Disable a faulty
feature with a server-side feature flag, pause publishing if content integrity is at risk,
and preserve failed sync items for replay. Never delete a learner event to repair a UI issue.

## 5. Operations Checklist

### Daily

- Check API availability, p95 latency, 5xx rate, auth failures and queue age.
- Check sync conflict and retry counts, notification provider failures and storage errors.
- Verify the content pipeline has no stuck `in_review` or audio-processing jobs.

### Weekly

- Review content throughput against 4.375 lessons/week and voice capacity of 10 lessons/week.
- Review critical-path risk R-01 and artist availability risk R-03.
- Review dependency updates, access logs, backup status and unresolved incidents.

### Before a launch milestone

- Confirm 120 published, versioned lesson packages have passed script, bilingual, quiz and audio gates.
- Confirm voice assets are within the +/-10% duration tolerance or explicitly blocked.
- Confirm app build, catalog manifest, offline cache, sync replay and notification permissions.
- Confirm rollback artifact, on-call owner, status communication and restore evidence.

## 6. Incident Response

1. Declare severity and assign an incident commander.
2. Record start time, impact, affected role or lesson version, and current hypothesis.
3. Stabilize first: rollback, disable the feature, pause publishing, or drain a bad queue consumer.
4. Preserve logs, request IDs, audit events and failed sync payload metadata without exposing audio or secrets.
5. Communicate status at a fixed interval until recovery.
6. Validate recovery with the affected user journey, not only a health check.
7. Write a blameless post-incident review with root cause, detection gap and preventive action.

## 7. Ownership and Access

Production access is least-privilege, time-bound and audited. Studio reviewers may publish
content but cannot administer infrastructure. Developers use read-only production observability
by default. Rotate credentials on role change, keep break-glass access separate, and review
access monthly. The product head owns launch decisions; engineering owns service health; QA
owns release evidence; content operations owns catalog completeness.
