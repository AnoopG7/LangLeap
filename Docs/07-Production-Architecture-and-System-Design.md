# LangLeap — Production System Architecture & DevOps Specification

**Version:** 1.0  
**Date:** October 2026  
**Author:** Team LangLeap  

---

## 1. Executive Summary & Architectural Principles

LangLeap is a high-availability, offline-first mobile learning platform built to teach English to native Hindi and Marathi speakers. This document details the production engineering architecture, comprehensive PostgreSQL database schema, end-to-end user workflows across all categories and personas, cloud deployment topology, automated CI/CD pipelines, and observability framework.

### 1.1 Core Architectural Principles

1. **Strict Content-App Decoupling:** Educational content (scripts, bilingual glosses, audio assets, quizzes) is managed independently via headless Content Studio APIs and delivered via CDN. The mobile app never hardcodes lesson logic.
2. **Offline-First Resilience:** Learners in low-connectivity areas (Tier 2/Tier 3 towns) can download lessons, practice speaking, and take quizzes entirely offline. Progress mutations are logged locally in IndexedDB and reconciled via idempotent server synchronization.
3. **Immutability & Auditability:** User quiz attempts, streak mutations, audio revisions, and content publish transitions are append-only ledger entries with cryptographic idempotency keys.
4. **Sub-200ms Latency:** API endpoints adhere to strict p95 $\le 200\text{ ms}$ response times; static assets and audio are distributed globally through CloudFront edge nodes.
5. **Regulatory Compliance:** Full adherence to India’s **Digital Personal Data Protection (DPDP) Act 2023**, with data residency in AWS Asia Pacific (Mumbai) `ap-south-1`.

---

## 2. High-Level System Architecture & C4 Model

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CLIENT LAYER                                           │
│  ┌───────────────────────────────┐               ┌──────────────────────────────────┐  │
│  │   Learner Mobile PWA / App    │               │    Content Studio Web Portal     │  │
│  │   (React + TS + Zustand +     │               │    (Next.js / Vite CMS Portal)   │  │
│  │    IndexedDB Offline Store)   │               │    (Writers, Artists, Reviewers) │  │
│  └──────────────┬────────────────┘               └────────────────┬─────────────────┘  │
└─────────────────┼─────────────────────────────────────────────────┼────────────────────┘
                  │ HTTPS / WSS                                     │ HTTPS / WSS
                  ▼                                                 ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                           EDGE & CONTENT DELIVERY NETWORK                              │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                       AWS CloudFront CDN / Cloudflare Edge                       │  │
│  │  - Edge Caching (Lesson JSON, Static App Bundles)                                │  │
│  │  - Low-Latency Audio Streaming (AAC-LC, 64kbps, CloudFront CDN)                  │  │
│  │  - DDoS Protection & Web Application Firewall (AWS WAF)                          │  │
│  └──────────────────────────────────────┬───────────────────────────────────────────┘  │
└─────────────────────────────────────────┼──────────────────────────────────────────────┘
                                          │
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY & LOAD BALANCER                               │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                       AWS Application Load Balancer (ALB)                        │  │
│  │  - TLS 1.3 Termination, Path-Based Routing (/api/v1/learner, /api/v1/studio)     │  │
│  │  - JWT Bearer Authentication & Rate Limiting (Redis-backed token bucket)         │  │
│  └──────────────────────────────────────┬───────────────────────────────────────────┘  │
└─────────────────────────────────────────┼──────────────────────────────────────────────┘
                                          │
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CORE BACKEND EC2 FLEET                                  │
│  ┌─────────────────────────────────┐           ┌────────────────────────────────────┐  │
│  │      Learner API Service        │           │    Content Studio API Service      │  │
│  │  (Node.js / Express / Fastify)  │           │   (Node.js / Express / Fastify)    │  │
│  │  - Auth & Profile Management    │           │   - Lesson Authoring & Scripting   │  │
│  │  - Curriculum & Gloss Serving   │           │   - Audio Asset Management         │  │
│  │  - Quiz Evaluation Engine       │           │   - Automated Publish Gate Engine  │  │
│  │  - Streak Engine & Freezes      │           │   - Reviewer Workflow & Audit Log  │  │
│  └──────────────┬──────────────────┘           └─────────────────┬──────────────────┘  │
│                 │                                                │                     │
│                 └───────────────────────┬────────────────────────┘                     │
│                                         ▼                                              │
│                        ┌─────────────────────────────────┐                             │
│                        │      Background Worker Fleet    │                             │
│                        │       (BullMQ / Redis / Celery) │                             │
│                        │  - Audio Transcoding & LUFS EQ  │                             │
│                        │  - Offline Sync Batch Reconcile │                             │
│                        │  - Daily Streak Reset Cron      │                             │
│                        │  - Push Notifications & Alerts  │                             │
│                        └────────────────┬────────────────┘                             │
└─────────────────────────────────────────┼──────────────────────────────────────────────┘
                                          │
                  ┌───────────────────────┴────────────────────────┐
                  ▼                                                ▼
┌───────────────────────────────────┐            ┌───────────────────────────────────────┐
│          STORAGE & CACHE          │            │               BLOB STORAGE            │
│  ┌─────────────────────────────┐  │            │  ┌─────────────────────────────────┐  │
│  │ Amazon RDS PostgreSQL 16    │  │            │  │        Amazon S3 Bucket         │  │
│  │ (Multi-AZ, Primary + Replica│  │            │  │ (Raw & Processed Audio Files,   │  │
│  │  Row-Level Security, JSONB) │  │            │  │  Devanagari Font Subsets,       │  │
│  └─────────────────────────────┘  │            │  │  Lesson Export Bundles)         │  │
│  ┌─────────────────────────────┐  │            │  └─────────────────────────────────┘  │
│  │ Amazon ElastiCache (Redis)  │  │            └───────────────────────────────────────┘
│  │ (Session store, Rate limit, │  │
│  │  Leaderboard, Streak cache) │  │
│  └─────────────────────────────┘  │
└───────────────────────────────────┘
```

---

## 3. Production PostgreSQL Database Schema (DDL)

The schema enforces data integrity, performance, role isolation, and comprehensive auditability using PostgreSQL 16 features (Triggers, ENUMs, Generated Columns, Composite Indexes, and Foreign Key constraints).

```sql
-- ============================================================================
-- LANGLEAP PRODUCTION DATABASE SCHEMA (POSTGRESQL 16)
-- Target: AWS RDS PostgreSQL 16 (Multi-AZ)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ENUMS & DOMAINS
-- ============================================================================

CREATE TYPE user_role AS ENUM (
    'LEARNER', 
    'CONTENT_WRITER', 
    'VOICE_ARTIST', 
    'LINGUISTIC_REVIEWER', 
    'CONTENT_ADMIN', 
    'SYSTEM_ADMIN'
);

CREATE TYPE native_language_code AS ENUM (
    'HI',   -- Hindi
    'MR'    -- Marathi
);

CREATE TYPE content_publish_status AS ENUM (
    'DRAFT', 
    'IN_REVIEW', 
    'APPROVED', 
    'AUDIO_RECORDED', 
    'PUBLISHED', 
    'ARCHIVED'
);

CREATE TYPE question_type AS ENUM (
    'MULTIPLE_CHOICE', 
    'AUDIO_MATCH', 
    'FILL_IN_BLANK', 
    'SENTENCE_REORDER'
);

CREATE TYPE sync_status AS ENUM (
    'PENDING', 
    'APPLIED', 
    'REJECTED', 
    'CONFLICT_RESOLVED'
);

-- ============================================================================
-- 2. USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role user_role NOT NULL DEFAULT 'LEARNER',
    native_language native_language_code NOT NULL DEFAULT 'HI',
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_id VARCHAR(128) NOT NULL,
    device_os VARCHAR(32),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auth_sessions_user ON auth_sessions(user_id, is_revoked);
CREATE INDEX idx_auth_sessions_token ON auth_sessions(refresh_token_hash);

-- ============================================================================
-- 3. CURRICULUM, LESSONS & GLOSSES
-- ============================================================================

CREATE TABLE curriculum_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_code VARCHAR(16) NOT NULL DEFAULT 'A1', -- A1 (Beginner), A2 (Elementary)
    title VARCHAR(128) NOT NULL,
    description TEXT,
    order_index INT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES curriculum_modules(id) ON DELETE RESTRICT,
    lesson_number INT NOT NULL UNIQUE, -- 1 to 120
    title VARCHAR(128) NOT NULL,
    difficulty_level VARCHAR(16) NOT NULL DEFAULT 'A1',
    estimated_duration_minutes INT NOT NULL DEFAULT 10,
    passing_threshold_score INT NOT NULL DEFAULT 80, -- FR-06: Strict >= 80%
    publish_status content_publish_status NOT NULL DEFAULT 'DRAFT',
    content_version INT NOT NULL DEFAULT 1,
    created_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_threshold_score CHECK (passing_threshold_score BETWEEN 50 AND 100)
);

CREATE INDEX idx_lessons_number ON lessons(lesson_number);
CREATE INDEX idx_lessons_status ON lessons(publish_status);

-- Section items inside a lesson (Conversation dialogues, vocabulary cards, grammar notes)
CREATE TABLE lesson_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    order_index INT NOT NULL,
    speaker_name VARCHAR(64),
    english_text TEXT NOT NULL,
    context_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_lesson_section_order UNIQUE(lesson_id, order_index)
);

CREATE INDEX idx_lesson_sections_lesson ON lesson_sections(lesson_id);

-- Bilingual glosses attached to sentences or vocabulary tokens
CREATE TABLE bilingual_glosses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES lesson_sections(id) ON DELETE CASCADE,
    target_phrase_en VARCHAR(255) NOT NULL,
    hindi_gloss TEXT NOT NULL,       -- Native Hindi meaning / phonetic explanation
    marathi_gloss TEXT NOT NULL,     -- Native Marathi meaning / phonetic explanation
    phonetic_transcription VARCHAR(255), -- English pronunciation in Devanagari script
    cue_timestamp_start_ms INT,      -- Audio sync start offset
    cue_timestamp_end_ms INT,        -- Audio sync end offset
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bilingual_glosses_section ON bilingual_glosses(section_id);

-- ============================================================================
-- 4. AUDIO ASSETS & VOICE PIPELINE
-- ============================================================================

CREATE TABLE audio_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    section_id UUID REFERENCES lesson_sections(id) ON DELETE CASCADE,
    voice_artist_id UUID NOT NULL REFERENCES users(id),
    language_target native_language_code NOT NULL, -- Audio prompt language
    s3_key VARCHAR(512) NOT NULL,
    cdn_url TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    duration_seconds NUMERIC(6, 2) NOT NULL,
    audio_codec VARCHAR(32) NOT NULL DEFAULT 'AAC-LC',
    bitrate_kbps INT NOT NULL DEFAULT 64, -- NFR: Optimized for 3G/low bandwidth
    sample_rate_hz INT NOT NULL DEFAULT 44100,
    lufs_loudness NUMERIC(4, 1) NOT NULL DEFAULT -16.0, -- Standardized mastering
    sha256_checksum VARCHAR(64) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audio_assets_lesson ON audio_assets(lesson_id);

-- ============================================================================
-- 5. QUIZZES, QUESTIONS & ANSWER KEYS
-- ============================================================================

CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL UNIQUE REFERENCES lessons(id) ON DELETE CASCADE,
    total_questions INT NOT NULL DEFAULT 5,
    max_score INT NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    order_index INT NOT NULL,
    question_type question_type NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    prompt_text_en TEXT NOT NULL,
    prompt_audio_id UUID REFERENCES audio_assets(id),
    hindi_hint TEXT,
    marathi_hint TEXT,
    explanation_en TEXT,
    explanation_hi TEXT,
    explanation_mr TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_quiz_question_order UNIQUE(quiz_id, order_index)
);

CREATE TABLE quiz_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    order_index INT NOT NULL,
    option_text TEXT NOT NULL,
    option_audio_id UUID REFERENCES audio_assets(id),
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_question_option_order UNIQUE(question_id, order_index)
);

CREATE INDEX idx_quiz_options_question ON quiz_options(question_id);

-- ============================================================================
-- 6. LEARNER PROGRESS, QUIZ ATTEMPTS & UNLOCK ENGINE
-- ============================================================================

CREATE TABLE learner_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    highest_score INT NOT NULL DEFAULT 0,
    attempts_count INT NOT NULL DEFAULT 0,
    first_unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_lesson UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_learner_progress_user ON learner_lesson_progress(user_id);
CREATE INDEX idx_learner_progress_status ON learner_lesson_progress(user_id, is_completed);

CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    score_percentage INT NOT NULL,
    passed BOOLEAN NOT NULL,
    time_taken_seconds INT NOT NULL,
    answers_payload JSONB NOT NULL, -- Detailed question_id -> chosen_option_id mapping
    client_mutation_id UUID UNIQUE NOT NULL, -- Idempotency key for offline sync
    client_timestamp TIMESTAMPTZ NOT NULL,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_score_range CHECK (score_percentage BETWEEN 0 AND 100)
);

CREATE INDEX idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);
CREATE INDEX idx_quiz_attempts_client_id ON quiz_attempts(client_mutation_id);

-- ============================================================================
-- 7. STREAK ENGINE, FREEZES & DAILY ACTIVITY LOG
-- ============================================================================

CREATE TABLE learner_streaks (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_activity_date DATE,
    freeze_credits_available INT NOT NULL DEFAULT 1, -- Max 1 free per week
    freezes_used_this_week INT NOT NULL DEFAULT 0,
    last_freeze_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE streak_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    action_type VARCHAR(32) NOT NULL, -- 'LESSON_COMPLETE', 'PRACTICE_DRILL', 'FREEZE_CONSUMED'
    streak_count_snapshot INT NOT NULL,
    freeze_applied BOOLEAN NOT NULL DEFAULT FALSE,
    client_mutation_id UUID UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_activity_date UNIQUE(user_id, activity_date)
);

CREATE INDEX idx_streak_logs_user_date ON streak_activity_logs(user_id, activity_date);

-- ============================================================================
-- 8. OFFLINE SYNC IDEMPOTENCY & AUDIT LOGS
-- ============================================================================

CREATE TABLE offline_sync_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_mutation_id UUID UNIQUE NOT NULL,
    entity_type VARCHAR(32) NOT NULL, -- 'QUIZ_ATTEMPT', 'LESSON_PROGRESS', 'STREAK_ACTIVITY'
    payload JSONB NOT NULL,
    sync_status sync_status NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    client_timestamp TIMESTAMPTZ NOT NULL,
    server_received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX idx_sync_ledger_client_id ON offline_sync_ledger(client_mutation_id);
CREATE INDEX idx_sync_ledger_user ON offline_sync_ledger(user_id, sync_status);

-- Publish gate audit log for content compliance
CREATE TABLE publish_gate_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    executed_by UUID NOT NULL REFERENCES users(id),
    passed BOOLEAN NOT NULL,
    check_results JSONB NOT NULL, -- Automated validation findings
    reviewer_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. TRIGGERS & BUSINESS LOGIC ENFORCEMENT
-- ============================================================================

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_learner_streaks_updated_at BEFORE UPDATE ON learner_streaks FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_learner_progress_updated_at BEFORE UPDATE ON learner_lesson_progress FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Automatic unlock trigger for Lesson 1 upon user creation
CREATE OR REPLACE FUNCTION initialize_learner_curriculum()
RETURNS TRIGGER AS $$
DECLARE
    v_first_lesson_id UUID;
BEGIN
    IF NEW.role = 'LEARNER' THEN
        -- Initialize Streak Record
        INSERT INTO learner_streaks (user_id, current_streak, longest_streak, freeze_credits_available)
        VALUES (NEW.id, 0, 0, 1)
        ON CONFLICT DO NOTHING;

        -- Find Lesson 1
        SELECT id INTO v_first_lesson_id FROM lessons WHERE lesson_number = 1 LIMIT 1;
        
        IF v_first_lesson_id IS NOT NULL THEN
            INSERT INTO learner_lesson_progress (user_id, lesson_id, is_unlocked, is_completed)
            VALUES (NEW.id, v_first_lesson_id, TRUE, FALSE)
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_learner_init AFTER INSERT ON users FOR EACH ROW EXECUTE FUNCTION initialize_learner_curriculum();
```

---

## 4. End-to-End Application Flows & State Machines

### 4.1 Learner Journey: Onboarding, Daily Practice & Unlock Loop

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LEARNER DAILY JOURNEY                           │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                     [ 1. User Authentication / Signup ]
                     - Mobile phone OTP (Firebase / Msg91)
                     - Select Native Language: Hindi (HI) or Marathi (MR)
                                    │
                                    ▼
                     [ 2. Home Dashboard & Curriculum Tree ]
                     - Fetch cached lesson tree from IndexedDB
                     - Identify current active unlocked lesson (e.g. Lesson N)
                     - Display Current Streak & Freeze status
                                    │
                                    ▼
                     [ 3. Lesson Engagement (10 Minutes) ]
                     - Step 3.1: Scenario Dialogue (English + Native Glosses)
                     - Step 3.2: Audio Listening (Native prompt + English audio)
                     - Step 3.3: Interactive Pronunciation / Speaking Practice
                                    │
                                    ▼
                     [ 4. Comprehensive Quiz (5 Questions) ]
                     - Multiple Choice, Fill-in-Blank, Audio Matching
                     - Submit answers locally; evaluate score %
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │ Quiz Score >= 80% (FR-06) ?   │
                    └───────────────┬───────────────┘
                           YES      │      NO
              ┌─────────────────────┴─────────────────────┐
              ▼                                           ▼
      [ Passed: Score >= 80% ]                  [ Failed: Score < 80% ]
      - Mark Lesson N Completed                 - Show targeted explanation in
      - Unlock Lesson N + 1 in DB                 Hindi / Marathi
      - Trigger Streak Engine                   - Keep Lesson N + 1 Locked
      - Award XP / Badges                       - Allow immediate retry
              │                                           │
              ▼                                           ▼
      [ Update Streak Engine ]                  [ Retry Quiz or Review ]
      - If last_activity = Yesterday:
          Streak = Streak + 1
      - If last_activity = Today:
          Streak unchanged (already active)
      - If last_activity < Yesterday:
          Check Freeze credit (Apply if avail)
              │
              ▼
      [ Queue Offline Sync Mutation ]
      - Record payload with client_mutation_id
      - Push to Background Sync Gateway
```

### 4.2 Streak State Machine & Cutoff Rules

```
                      ┌────────────────────────┐
                      │    ACTIVE STREAK = S   │
                      │  (Last active = Today) │
                      └───────────┬────────────┘
                                  │
                                  ▼ Midnight (00:00 IST)
                      ┌────────────────────────┐
                      │   PENDING ACTIVITY     │
                      │(Last active = Yesterday│
                      └───────────┬────────────┘
                                  │
               ┌──────────────────┴──────────────────┐
               │                                     │
   User completes lesson                24h elapsed without activity
   before 23:59:59 IST                  (Streak at risk)
               │                                     │
               ▼                                     ▼
     ┌──────────────────┐               ┌────────────────────────┐
     │ STREAK EXTENDED  │               │   FREEZE EVALUATION    │
     │     S = S + 1    │               │  Freeze credits > 0 ?  │
     └──────────────────┘               └───────────┬────────────┘
                                                    │
                                     ┌──────────────┴──────────────┐
                                     │ YES                         │ NO
                                     ▼                             ▼
                           ┌──────────────────┐          ┌──────────────────┐
                           │   FREEZE USED    │          │  STREAK RESET    │
                           │ Streak conserved │          │    S = 0         │
                           │ Freeze credit = 0│          │ (Fresh restart)  │
                           └──────────────────┘          └──────────────────┘
```

### 4.3 Content Studio Pipeline & Publish Gate State Machine

The content lifecycle isolates writers, voice artists, and reviewers into a strictly monitored, linear state machine:

```
┌──────────────┐     Author Draft      ┌────────────────┐     Submit Review     ┌──────────────────┐
│   [DRAFT]    │ ────────────────────> │  [IN_REVIEW]   │ ────────────────────> │    [APPROVED]    │
│ Content team │                       │ Linguistic QA  │                       │ Ready for audio  │
│ scripts text │                       │ verifies Hindi/│                       │ recording        │
└──────────────┘                       │ Marathi glosses│                       └────────┬─────────┘
                                       └───────┬────────┘                                │
                                               │ Rejected (Rework)                       │ Record audio
                                               ▼                                         ▼
                                       ┌────────────────┐                       ┌──────────────────┐
                                       │ Return to      │                       │ [AUDIO_RECORDED] │
                                       │ Writer Queue   │                       │ Audio synced &   │
                                       └────────────────┘                       │ LUFS normalized  │
                                                                                └────────┬─────────┘
                                                                                         │
                                                                                         │ Automated Gate
                                                                                         ▼
                                                                                ┌──────────────────┐
                                                                                │  PUBLISH GATE    │
                                                                                │  VERIFICATION    │
                                                                                └────────┬─────────┘
                                                                                         │
                                                           ┌─────────────────────────────┴────────────┐
                                                           │ Passes all 6 checklist criteria          │ Fails any check
                                                           ▼                                          ▼
                                                ┌──────────────────┐                       ┌──────────────────┐
                                                │   [PUBLISHED]    │                       │ [GATE_REJECTED]  │
                                                │ Live on CDN &    │                       │ Remediation tick-│
                                                │ Learner App      │                       │ et generated     │
                                                └──────────────────┘                       └──────────────────┘
```

#### Automated Publish Gate Verification Checklist:
1. **Bilingual Completeness:** Exactly 100% of English dialogue phrases have non-null, non-empty `hindi_gloss` and `marathi_gloss`.
2. **Audio Alignment:** Every speech turn has a mapped AAC-LC 64kbps audio file with verified sha256 checksum and duration $> 0$.
3. **Audio Mastering Norm:** Audio loudness measured between $-15.0\text{ LUFS}$ and $-17.0\text{ LUFS}$ (target $-16.0\text{ LUFS}$).
4. **Quiz Question Count:** Exactly 5 valid questions attached to the quiz.
5. **Answer Key Correctness:** Exactly 1 correct option marked per question; options count $\ge 3$ and $\le 4$.
6. **Passing Threshold Compliance:** `passing_threshold_score` is strictly locked to 80 (FR-06).

---

## 5. Offline Sync Engine & Conflict Resolution Protocol

### 5.1 Client-Side Offline Architecture (IndexedDB)
When the learner is offline:
1. **Lesson Caching:** The app pre-downloads the active lesson plus the next 2 upcoming lessons (JSON text + AAC audio blobs) into IndexedDB.
2. **Local Execution:** Quizzes are scored instantly on the client using the pre-compiled answer key.
3. **Mutation Journaling:** Every progress mutation (quiz completion, score, duration) generates an immutable transaction object stored in IndexedDB store `sync_queue`:

```json
{
  "client_mutation_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "user_id": "184d0b17-7440-410a-86db-e19c35b84e1b",
  "entity_type": "QUIZ_ATTEMPT",
  "payload": {
    "lesson_id": "a4d339e1-255e-4c7a-9a99-4c07b7ec25e2",
    "quiz_id": "d718bbf1-8176-4740-9a37-58b53272eec9",
    "score_percentage": 85,
    "passed": true,
    "time_taken_seconds": 184,
    "answers": [
      { "question_id": "q1", "selected_option_id": "opt_2" },
      { "question_id": "q2", "selected_option_id": "opt_4" }
    ]
  },
  "client_timestamp": "2026-10-04T08:15:30.000Z",
  "status": "QUEUED"
}
```

### 5.2 Server Reconciliation & Conflict Resolution Matrix

When network connectivity resumes (`window.addEventListener('online')`):
1. **Idempotency Guarantee:** The sync gateway queries `offline_sync_ledger` for `client_mutation_id`. If already present, the server returns the cached response without duplicate side effects (prevents double-counting XP or streak tampering).
2. **Conflict Resolution Strategy:**
   - **Progress / Quiz Score:** **Highest Score Wins** (`GREATEST(existing_score, incoming_score)`). Completed status is permanent (`is_completed = existing.is_completed OR incoming.is_completed`).
   - **Streak Date Resolution:** Server validates `client_timestamp` against the server's NTP clock. Timestamps with clock-skew $> 24\text{ hours}$ in the future are flagged as suspicious and reconciled using the server's ingestion date.
   - **Freeze Application:** If two devices sync conflicting missed days, freeze credit deduction is atomic via PostgreSQL row lock:
     ```sql
     UPDATE learner_streaks 
     SET freeze_credits_available = freeze_credits_available - 1,
         freezes_used_this_week = freezes_used_this_week + 1
     WHERE user_id = $1 AND freeze_credits_available > 0;
     ```

---

## 6. DevOps, Infrastructure & Cloud Deployment Architecture

### 6.1 AWS Multi-AZ Production Infrastructure Topology

```
                                  [ INTERNET ]
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │  AWS Route 53 (DNS / SLB) │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │   AWS CloudFront (CDN)    │
                         │    + AWS WAF & Shield     │
                         └─────────────┬─────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                │ Static Assets & Audio Cached                │ Dynamic API Requests
                ▼                                             ▼
  ┌───────────────────────────┐                 ┌───────────────────────────┐
  │   Amazon S3 Bucket        │                 │    AWS ALB (Public Subnet)│
  │   (ap-south-1 Mumbai)     │                 │   (HTTPS TLS 1.3 ACM Cert)│
  └───────────────────────────┘                 └─────────────┬─────────────┘
                                                              │
                    ┌─────────────────────────────────────────┴────────────────────────┐
                    ▼                                                                  ▼
┌──────────────────────────────────────┐            ┌──────────────────────────────────────────┐
│ Availability Zone A (ap-south-1a)    │            │ Availability Zone B (ap-south-1b)        │
│ ┌──────────────────────────────────┐ │            │ ┌──────────────────────────────────────┐ │
│ │ Private App Subnet               │ │            │ │ Private App Subnet                   │ │
│  │  - EC2 Auto Scaling Group         │ │            │ │  - EC2 Auto Scaling Group             │ │
│  │    * backend-api-server           │ │            │ │    * backend-api-server               │ │
│  │    * content-studio-module        │ │            │ │    * content-studio-module            │ │
│  │    * background-worker-server     │ │            │ │    * background-worker-server         │ │
│ └────────────────┬─────────────────┘ │            │ └──────────────────┬───────────────────┘ │
│                  │                   │            │                    │                     │
│ ┌────────────────┴─────────────────┐ │            │ ┌──────────────────┴───────────────────┐ │
│ │ Private Data Subnet              │ │            │ │ Private Data Subnet                  │ │
│ │  - Amazon RDS PostgreSQL 16      │ │◄───────────┼─┤  - Amazon RDS Standby (Replica)      │ │
│ │    (Primary Writer Node)         │ │ Sync Repl. │ │    (Automated Failover)              │ │
│ │  - ElastiCache Redis (Primary)   │ │◄───────────┼─┤  - ElastiCache Redis (Replica)       │ │
│ └──────────────────────────────────┘ │            │ └──────────────────────────────────────┘ │
└──────────────────────────────────────┘            └──────────────────────────────────────────┘
```

### 6.2 Environment Isolation Matrix

| Environment | Purpose | Infrastructure | Domain / Endpoint | DB Tier | Auto-Scaling Policy |
|---|---|---|---|---|---|
| **Development** | Local Docker / Feature testing | Docker Compose / Minikube | `http://localhost:5173` | Local Postgres 16 | N/A |
| **Staging** | QA, BVA tests, Publish Gate tests | EC2 Auto Scaling Group (1 AZ) | `https://staging-api.langleap.in` | RDS db.t4g.medium | Fixed 2 instances |
| **Production** | Public live traffic | EC2 Auto Scaling Groups across AZs | `https://api.langleap.in` | RDS db.r6g.large Multi-AZ | CPU $> 70\%$ or Req $> 800$/sec (Min 3, Max 12) |

---

## 7. CI/CD Pipeline Specification (GitHub Actions)

LangLeap enforces zero-downtime, automated deployments with mandatory linting, test suites, database migration verification, and container scanning.

### 7.1 Pipeline Stages Flowchart

```
[ Git Push / PR to main ]
          │
          ▼
┌──────────────────┐
│ STAGE 1: LINT    │ ──> ESLint + Prettier + TypeScript Compiler (`tsc --noEmit`)
└─────────┬────────┘
          │ (Pass)
          ▼
┌──────────────────┐
│ STAGE 2: TEST    │ ──> Unit & Integration Tests (Jest / Vitest)
└─────────┬────────┘     - BVA Quiz Threshold Tests (FR-06: 79, 80, 81)
          │              - Decision Table Unlock & Streak Verification
          │ (Pass)       - DRE Regression Check
          ▼
┌──────────────────┐
│ STAGE 3: SECURITY│ ──> Trivy Container Scan + Snyk Dependency Audit
└─────────┬────────┘
          │ (Pass)
          ▼
┌──────────────────┐
│ STAGE 4: BUILD   │ ──> Docker Multi-Stage Build & Push to AWS ECR
└─────────┬────────┘
          │ (Pass)
          ▼
┌──────────────────┐
│ STAGE 5: MIGRATE │ ──> Run Prisma / Flyway Migrations on Staging RDS
└─────────┬────────┘
          │ (Pass)
          ▼
┌──────────────────┐
│ STAGE 6: DEPLOY  │ ──> Rolling/blue-green deploy on EC2 via AWS CodeDeploy
└──────────────────┘     - 10% traffic canary for 5 mins
                         - Automated rollback if 5xx errors $> 0.5%
```

### 7.2 Production GitHub Actions Workflow (`.github/workflows/production-deploy.yml`)

```yaml
name: LangLeap Production CI/CD

on:
  push:
    branches: [ main ]

env:
  AWS_REGION: ap-south-1
  ECR_REPOSITORY: langleap-core-backend
  EC2_AUTO_SCALING_GROUP: langleap-prod-api-asg
  EC2_WORKER_GROUP: langleap-prod-worker-asg

jobs:
  validate-and-test:
    name: Code Quality & Automated Test Gate
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Static Code Analysis & Type Check
        run: |
          npm run lint
          npx tsc --noEmit

      - name: Execute Test Suite (BVA + Streak + Publish Gate)
        run: npm run test:ci -- --coverage
        env:
          CI: true

      - name: Verify Minimum Test Coverage (85% Target)
        run: |
          npx nyc check-coverage --lines 85 --functions 85 --branches 80

  build-and-push:
    name: Docker Build & ECR Deployment
    needs: validate-and-test
    runs-on: ubuntu-latest
    outputs:
      image_tag: ${{ steps.build-image.outputs.image_tag }}
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and Tag Docker Image
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG -t $ECR_REGISTRY/$ECR_REPOSITORY:latest .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
          echo "image_tag=$IMAGE_TAG" >> $GITHUB_OUTPUT

      - name: Scan Image for Vulnerabilities (Trivy)
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY }}:${{ github.sha }}
          format: 'table'
          exit-code: '1'
          severity: 'CRITICAL,HIGH'

  database-migration:
    name: Execute Schema Migrations
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Run Database Migration
        run: |
          npm ci
          npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}

  deploy-production:
    name: Blue/Green Rolling EC2 Deployment
    needs: [build-and-push, database-migration]
    runs-on: ubuntu-latest
    steps:
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Build and publish EC2 deployment artifact
        id: publish-artifact
        uses: aws-actions/amazon-s3-sync@v2
        with:
          source: ./dist
          destination: s3://langleap-release-artifacts/${{ github.sha }}/

      - name: Refresh EC2 Auto Scaling Group
        uses: aws-actions/aws-cloudformation-github-deploy@v1
        with:
          name: langleap-prod-compute
          template: infra/ec2-asg-stack.yml
          parameter-overrides: ReleaseVersion=${{ github.sha }}
```

---

## 8. Observability, Monitoring & Disaster Recovery

### 8.1 Metrics & Telemetry Stack

| Layer | Tool | Metrics Collected | SLA / Alert Threshold |
|---|---|---|---|
| **API & Backend** | Prometheus + Grafana | Request rate, p95/p99 latency, 4xx/5xx status counts | p95 latency $> 200\text{ ms}$; Error rate $> 1.0\%$ |
| **Database (RDS)** | AWS CloudWatch + RDS Insights | CPU utilization, active connections, replication lag, slow queries | CPU $> 75\%$; Read replica lag $> 10\text{ seconds}$ |
| **Worker Fleet** | BullMQ Dashboard | Queue backlog, job failure rate, job execution latency | Audio job latency $> 60\text{ sec}$; Sync backlog $> 500$ |
| **Client & Errors** | Sentry (Browser SDK + Node) | Unhandled JS exceptions, React error boundaries, offline sync crashes | Event volume spike $> 50$ events/minute |
| **Network & Edge** | AWS CloudFront Metrics | Cache hit ratio, edge response time, 504 gateway timeouts | Cache hit ratio $< 85\%$ |

### 8.2 Security, Privacy & DPDP Act 2023 Compliance

1. **Authentication Security:**
   - Stateless JWT tokens (access token lifespan: 15 minutes).
   - Refresh tokens stored in cryptographically signed, `HttpOnly`, `SameSite=Strict`, `Secure` cookies with SHA-256 token rotation on every exchange.
2. **Data Encryption:**
   - **In-Transit:** Mandatory TLS 1.3 across all client-to-CDN, CDN-to-ALB, and internal service communication.
   - **At-Rest:** AES-256 encryption on Amazon RDS (AWS KMS managed key) and Amazon S3 server-side encryption (`aws:kms`).
3. **Data Protection & Privacy (DPDP Act 2023):**
   - **Data Localization:** All personal learner records and database clusters reside strictly within the Republic of India (`ap-south-1` Mumbai).
   - **Right to Erasure:** Dedicated endpoint `DELETE /api/v1/learner/me` performs cascading cryptographic erasure of user identity, personal identifiers, and quiz histories while retaining anonymized aggregate completion telemetry.
   - **Parental Consent:** For learners under 18, verifiable parental OTP consent flow is required during signup.

### 8.3 Disaster Recovery & Backup Strategy

- **Recovery Point Objective (RPO):** $< 5\text{ minutes}$ (Continuous PostgreSQL Write-Ahead Log (WAL) streaming to S3).
- **Recovery Time Objective (RTO):** $< 15\text{ minutes}$ (Automated RDS Multi-AZ failover + automated EC2 Auto Scaling instance refresh).
- **Automated Backup Schedule:**
  - Automated full RDS snapshots taken nightly at 02:00 IST with 30-day retention.
  - S3 bucket versioning enabled with MFA Delete protection on all production audio and lesson assets.
  - Quarterly Disaster Recovery drill simulating primary AZ failure with DNS failover validation.
