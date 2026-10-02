# LangLeap Production Database Schema

This schema is the production persistence model for the learner app and Content Studio.
The current frontend mock uses localStorage, so this document is a target design rather
than a claim that these tables already exist in the mock.

## Design Rules

- PostgreSQL is the system of record; IDs are UUIDs and timestamps are UTC.
- Published lesson content is immutable. Editing creates a new `lesson_versions` row.
- Audio is pinned to a lesson version. Changing the script invalidates the old audio take.
- Quiz attempts and sync commands are append-only and idempotent.
- `content_reviews` and `audio_reviews` preserve accepted/rejected history instead of overwriting it.
- All Studio mutations create an `audit_events` row.

## Entity Relationship Diagram

```mermaid
erDiagram
  USERS ||--o{ USER_ROLES : has
  ROLES ||--o{ USER_ROLES : grants
  USERS ||--o{ LESSON_VERSIONS : authors
  LESSONS ||--o{ LESSON_VERSIONS : versions
  LESSON_VERSIONS ||--o{ SCRIPT_LINES : contains
  LESSON_VERSIONS ||--o{ VOCABULARY_ITEMS : teaches
  LESSON_VERSIONS ||--o{ QUIZ_ITEMS : contains
  LESSON_VERSIONS ||--o{ AUDIO_ASSETS : has
  AUDIO_ASSETS ||--o{ AUDIO_REVIEWS : receives
  USERS ||--o{ AUDIO_REVIEWS : performs
  LESSON_VERSIONS ||--o{ CONTENT_REVIEWS : receives
  USERS ||--o{ CONTENT_REVIEWS : performs
  USERS ||--o{ LEARNER_PROGRESS : owns
  LESSON_VERSIONS ||--o{ LEARNER_PROGRESS : tracks
  USERS ||--o{ QUIZ_ATTEMPTS : makes
  LESSON_VERSIONS ||--o{ QUIZ_ATTEMPTS : targets
  QUIZ_ATTEMPTS ||--o{ QUIZ_ANSWERS : contains
  USERS ||--o{ STREAKS : owns
  USERS ||--o{ SYNC_COMMANDS : queues
  USERS ||--o{ NOTIFICATIONS : receives
  USERS ||--o{ AUDIT_EVENTS : acts

  USERS {
    uuid id PK
    text email UK
    text full_name
    text first_language
    text english_level
    timestamptz created_at
    timestamptz deleted_at
  }
  ROLES {
    text code PK
  }
  USER_ROLES {
    uuid user_id FK
    text role_code FK
    timestamptz granted_at
  }
  LESSONS {
    uuid id PK
    text code UK
    int position
    text current_state
    timestamptz created_at
  }
  LESSON_VERSIONS {
    uuid id PK
    uuid lesson_id FK
    int version_no
    text title
    text level
    jsonb hint_i18n
    text state
    uuid author_id FK
    timestamptz submitted_at
    timestamptz published_at
    timestamptz created_at
  }
  SCRIPT_LINES {
    uuid id PK
    uuid lesson_version_id FK
    int line_no
    jsonb text_i18n
  }
  VOCABULARY_ITEMS {
    uuid id PK
    uuid lesson_version_id FK
    text term
    jsonb meaning_i18n
  }
  QUIZ_ITEMS {
    uuid id PK
    uuid lesson_version_id FK
    int item_order
    text prompt
    jsonb options
    int correct_index
  }
  AUDIO_ASSETS {
    uuid id PK
    uuid lesson_version_id FK
    text object_key UK
    int duration_sec
    text status
    text checksum
    timestamptz uploaded_at
  }
  AUDIO_REVIEWS {
    uuid id PK
    uuid audio_asset_id FK
    uuid reviewer_id FK
    text decision
    text note
    timestamptz decided_at
  }
  CONTENT_REVIEWS {
    uuid id PK
    uuid lesson_version_id FK
    uuid reviewer_id FK
    text decision
    text note
    timestamptz decided_at
  }
  LEARNER_PROGRESS {
    uuid user_id FK
    uuid lesson_version_id FK
    int best_score
    boolean passed
    int attempts_count
    timestamptz completed_at
    timestamptz updated_at
  }
  QUIZ_ATTEMPTS {
    uuid id PK
    uuid user_id FK
    uuid lesson_version_id FK
    text idempotency_key UK
    int score
    boolean passed
    timestamptz submitted_at
  }
  QUIZ_ANSWERS {
    uuid id PK
    uuid attempt_id FK
    uuid quiz_item_id FK
    int selected_index
    boolean correct
  }
  STREAKS {
    uuid user_id PK,FK
    int current_count
    int best_count
    date last_completed_day
    int freezes_used
    text freeze_week
  }
  SYNC_COMMANDS {
    uuid id PK
    uuid user_id FK
    text idempotency_key UK
    text command_type
    jsonb payload
    text status
    int retry_count
    timestamptz received_at
    timestamptz processed_at
  }
  NOTIFICATIONS {
    uuid id PK
    uuid user_id FK
    text kind
    text title
    text body
    boolean read_at_present
    timestamptz created_at
  }
  AUDIT_EVENTS {
    uuid id PK
    uuid actor_id FK
    text action
    text entity_type
    uuid entity_id
    jsonb metadata
    timestamptz created_at
  }
```

## Key Constraints and Indexes

```sql
CREATE UNIQUE INDEX uq_lesson_version
  ON lesson_versions (lesson_id, version_no);

CREATE UNIQUE INDEX uq_published_version_per_lesson
  ON lesson_versions (lesson_id)
  WHERE state = 'published';

CREATE UNIQUE INDEX uq_attempt_idempotency
  ON quiz_attempts (idempotency_key);

CREATE UNIQUE INDEX uq_sync_command_idempotency
  ON sync_commands (idempotency_key);

CREATE INDEX ix_catalog_lookup
  ON lesson_versions (state, level, lesson_id, version_no);

CREATE INDEX ix_progress_by_learner
  ON learner_progress (user_id, updated_at DESC);

CREATE INDEX ix_audio_queue
  ON audio_assets (status, uploaded_at);
```

## State Transitions

### Lesson content

`draft -> in_review -> published -> deprecated`

Rejection returns the version to `draft` and adds a `content_reviews(decision = 'rejected')`
row. A published version is never edited in place.

### Audio

`draft -> submitted -> accepted`

`submitted -> rejected -> draft`

Audio acceptance requires a stored duration between 90% and 110% of the script target,
and the reviewer decision remains auditable in `audio_reviews`. A lesson cannot publish
until it has an accepted audio asset for the exact lesson version.

## Transaction Boundaries

1. **Submit quiz:** insert `quiz_attempts`, insert answers, upsert derived `learner_progress`,
   evaluate unlock and streak, and enqueue an event in one transaction.
2. **Accept audio:** insert `audio_reviews`, update `audio_assets.status`, and write an audit
   event in one transaction.
3. **Publish lesson:** lock the lesson version, re-run all QA gates, verify accepted audio,
   insert `content_reviews`, update state, and write an audit event in one transaction.
4. **Offline replay:** insert the idempotency key first; repeated commands return the original
   result without duplicating progress or streak effects.
