-- ============================================================
-- CareerMitra AI — PostgreSQL Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE job_type AS ENUM ('government', 'private', 'internship');
CREATE TYPE experience_level AS ENUM ('fresher', '1-2 years', '2-5 years', '5+ years');
CREATE TYPE application_status AS ENUM ('saved', 'applied', 'assessment', 'interview', 'selected', 'rejected');
CREATE TYPE notification_type AS ENUM ('job_alert', 'exam_alert', 'deadline', 'study_reminder', 'interview', 'learning', 'system');
CREATE TYPE interview_type AS ENUM ('hr', 'technical', 'data_analyst', 'software_developer', 'ai_ml', 'government');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE roadmap_step_status AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE message_sender AS ENUM ('user', 'ai');
CREATE TYPE question_difficulty AS ENUM ('easy', 'medium', 'hard');

-- ============================================================
-- 1. USERS
-- ============================================================

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone         VARCHAR(20),
  role          user_role DEFAULT 'user',
  is_active     BOOLEAN DEFAULT TRUE,
  is_verified   BOOLEAN DEFAULT FALSE,
  avatar_url    TEXT,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- ============================================================
-- 2. USER PROFILES
-- ============================================================

CREATE TABLE profiles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  qualification       VARCHAR(255),
  graduation_year     INTEGER,
  experience_level    experience_level DEFAULT 'fresher',
  preferred_job_type  job_type,
  preferred_location  VARCHAR(255),
  bio                 TEXT,
  github_url          TEXT,
  linkedin_url        TEXT,
  portfolio_url       TEXT,
  career_readiness    INTEGER DEFAULT 0 CHECK (career_readiness BETWEEN 0 AND 100),
  language_preference VARCHAR(20) DEFAULT 'english',
  demo_mode           BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- 3. SKILLS
-- ============================================================

CREATE TABLE skills (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) UNIQUE NOT NULL,
  category    VARCHAR(100),  -- e.g. 'programming', 'analytics', 'soft_skill'
  icon_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_skills_category ON skills(category);

-- ============================================================
-- 4. USER SKILLS
-- ============================================================

CREATE TABLE user_skills (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id     UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency  INTEGER DEFAULT 1 CHECK (proficiency BETWEEN 1 AND 5),
  verified     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

CREATE INDEX idx_user_skills_user ON user_skills(user_id);

-- ============================================================
-- 5. COMPANIES
-- ============================================================

CREATE TABLE companies (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255) NOT NULL,
  logo_url      TEXT,
  website       TEXT,
  career_page   TEXT,
  industry      VARCHAR(255),
  size          VARCHAR(50),  -- 'startup', 'mid-size', 'large', 'mnc'
  description   TEXT,
  is_verified   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. JOBS
-- ============================================================

CREATE TABLE jobs (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                VARCHAR(255) NOT NULL,
  company_id           UUID REFERENCES companies(id) ON DELETE SET NULL,
  job_type             job_type NOT NULL,
  category             VARCHAR(100),  -- 'SSC','UPSC','Banking','IT','Finance', etc.
  sub_category         VARCHAR(100),
  description          TEXT,
  qualification        TEXT,
  experience_required  experience_level,
  age_limit_min        INTEGER,
  age_limit_max        INTEGER,
  salary_min           NUMERIC(12,2),
  salary_max           NUMERIC(12,2),
  salary_display       VARCHAR(100),  -- e.g. "₹35,000 – ₹50,000"
  location             VARCHAR(255),
  vacancy_count        INTEGER,
  application_fee      VARCHAR(100),
  selection_process    TEXT,
  exam_pattern         TEXT,
  syllabus             TEXT,
  application_start    DATE,
  application_end      DATE,
  exam_date            DATE,
  result_date          DATE,
  notification_url     TEXT,
  apply_url            TEXT,
  is_active            BOOLEAN DEFAULT TRUE,
  is_demo              BOOLEAN DEFAULT FALSE,
  risk_level           risk_level DEFAULT 'low',
  risk_reason          TEXT,
  posted_at            TIMESTAMPTZ DEFAULT NOW(),
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_type      ON jobs(job_type);
CREATE INDEX idx_jobs_category  ON jobs(category);
CREATE INDEX idx_jobs_active    ON jobs(is_active);
CREATE INDEX idx_jobs_end_date  ON jobs(application_end);
CREATE INDEX idx_jobs_posted    ON jobs(posted_at DESC);

-- ============================================================
-- 7. JOB SKILLS (required skills for a job)
-- ============================================================

CREATE TABLE job_skills (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id    UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  skill_id  UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  is_must   BOOLEAN DEFAULT TRUE,
  UNIQUE(job_id, skill_id)
);

CREATE INDEX idx_job_skills_job ON job_skills(job_id);

-- ============================================================
-- 8. APPLICATIONS / BOOKMARKS
-- ============================================================

CREATE TABLE applications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id      UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status      application_status DEFAULT 'saved',
  applied_at  TIMESTAMPTZ,
  notes       TEXT,
  match_score INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

CREATE INDEX idx_applications_user   ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);

-- ============================================================
-- 9. EXAMS
-- ============================================================

CREATE TABLE exams (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             VARCHAR(255) NOT NULL,
  short_name       VARCHAR(50),
  category         VARCHAR(100),   -- 'SSC', 'UPSC', 'TNPSC', 'Banking', 'Railway'
  conducting_body  VARCHAR(255),
  description      TEXT,
  official_url     TEXT,
  exam_date        DATE,
  notification_url TEXT,
  is_active        BOOLEAN DEFAULT TRUE,
  is_demo          BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exams_category ON exams(category);

-- ============================================================
-- 10. SUBJECTS
-- ============================================================

CREATE TABLE subjects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id     UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  weightage   INTEGER,   -- percentage weightage in exam
  order_index INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subjects_exam ON subjects(exam_id);

-- ============================================================
-- 11. STUDY MATERIALS
-- ============================================================

CREATE TABLE study_materials (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id      UUID REFERENCES exams(id) ON DELETE CASCADE,
  subject_id   UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  content_type VARCHAR(50),  -- 'pdf', 'video', 'article', 'notes'
  content_url  TEXT,
  content_text TEXT,
  thumbnail    TEXT,
  duration_min INTEGER,
  is_free      BOOLEAN DEFAULT TRUE,
  is_demo      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_study_materials_exam    ON study_materials(exam_id);
CREATE INDEX idx_study_materials_subject ON study_materials(subject_id);

-- ============================================================
-- 12. QUESTIONS
-- ============================================================

CREATE TABLE questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id       UUID REFERENCES exams(id) ON DELETE CASCADE,
  subject_id    UUID REFERENCES subjects(id) ON DELETE CASCADE,
  topic         VARCHAR(255),
  question_text TEXT NOT NULL,
  option_a      TEXT NOT NULL,
  option_b      TEXT NOT NULL,
  option_c      TEXT NOT NULL,
  option_d      TEXT NOT NULL,
  correct_ans   CHAR(1) NOT NULL CHECK (correct_ans IN ('A','B','C','D')),
  explanation   TEXT,
  difficulty    question_difficulty DEFAULT 'medium',
  year          INTEGER,  -- previous year
  is_demo       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_exam    ON questions(exam_id);
CREATE INDEX idx_questions_subject ON questions(subject_id);
CREATE INDEX idx_questions_topic   ON questions(topic);
CREATE INDEX idx_questions_diff    ON questions(difficulty);

-- ============================================================
-- 13. MOCK TESTS
-- ============================================================

CREATE TABLE mock_tests (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id        UUID REFERENCES exams(id) ON DELETE CASCADE,
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  duration_min   INTEGER NOT NULL DEFAULT 60,
  total_marks    INTEGER NOT NULL DEFAULT 100,
  pass_marks     INTEGER DEFAULT 35,
  question_count INTEGER NOT NULL DEFAULT 50,
  is_demo        BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mock_tests_exam ON mock_tests(exam_id);

-- Mock test ↔ questions mapping
CREATE TABLE mock_test_questions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id     UUID NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  marks       INTEGER DEFAULT 2,
  UNIQUE(test_id, question_id)
);

-- ============================================================
-- 14. TEST ATTEMPTS
-- ============================================================

CREATE TABLE test_attempts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_id        UUID NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
  score          INTEGER DEFAULT 0,
  total_marks    INTEGER,
  accuracy       NUMERIC(5,2),
  time_taken_min INTEGER,
  strong_areas   TEXT[],
  weak_areas     TEXT[],
  improvement_plan TEXT,
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attempts_user ON test_attempts(user_id);
CREATE INDEX idx_attempts_test ON test_attempts(test_id);

-- ============================================================
-- 15. TEST ANSWERS
-- ============================================================

CREATE TABLE test_answers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id  UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected    CHAR(1) CHECK (selected IN ('A','B','C','D')),
  is_correct  BOOLEAN,
  time_taken  INTEGER  -- seconds spent on this question
);

CREATE INDEX idx_answers_attempt ON test_answers(attempt_id);

-- ============================================================
-- 16. CAREER GOALS & ROADMAPS
-- ============================================================

CREATE TABLE career_goals (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE roadmaps (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id         UUID NOT NULL REFERENCES career_goals(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  ai_generated    BOOLEAN DEFAULT FALSE,
  completion_pct  INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE roadmap_steps (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roadmap_id      UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  resources       TEXT,
  order_index     INTEGER DEFAULT 0,
  status          roadmap_step_status DEFAULT 'not_started',
  completion_pct  INTEGER DEFAULT 0,
  mini_project    TEXT,
  estimated_days  INTEGER,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_roadmaps_user ON roadmaps(user_id);
CREATE INDEX idx_roadmap_steps_roadmap ON roadmap_steps(roadmap_id);

-- ============================================================
-- 17. VIDEOS / LEARNING
-- ============================================================

CREATE TABLE videos (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        VARCHAR(255) NOT NULL,
  channel      VARCHAR(255),
  platform     VARCHAR(50) DEFAULT 'youtube',
  url          TEXT NOT NULL,
  thumbnail    TEXT,
  duration_min INTEGER,
  topic        VARCHAR(255),
  skill_id     UUID REFERENCES skills(id) ON DELETE SET NULL,
  exam_id      UUID REFERENCES exams(id) ON DELETE SET NULL,
  subject_id   UUID REFERENCES subjects(id) ON DELETE SET NULL,
  description  TEXT,
  is_verified  BOOLEAN DEFAULT FALSE,
  is_demo      BOOLEAN DEFAULT FALSE,
  view_count   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_videos_topic   ON videos(topic);
CREATE INDEX idx_videos_skill   ON videos(skill_id);
CREATE INDEX idx_videos_subject ON videos(subject_id);

-- ============================================================
-- 18. AI CONVERSATIONS
-- ============================================================

CREATE TABLE ai_conversations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255),
  language    VARCHAR(20) DEFAULT 'english',
  context     TEXT,  -- JSON context for AI
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_messages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id  UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  sender           message_sender NOT NULL,
  content          TEXT NOT NULL,
  tokens_used      INTEGER,
  model_used       VARCHAR(100),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_messages_conv      ON ai_messages(conversation_id);

-- ============================================================
-- 19. RESUMES
-- ============================================================

CREATE TABLE resumes (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename       VARCHAR(255),
  file_url       TEXT,
  file_size      INTEGER,
  ats_score      INTEGER CHECK (ats_score BETWEEN 0 AND 100),
  skills_found   TEXT[],
  missing_skills TEXT[],
  suggestions    TEXT,
  raw_text       TEXT,
  analyzed_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resumes_user ON resumes(user_id);

-- ============================================================
-- 20. MOCK INTERVIEWS
-- ============================================================

CREATE TABLE interviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interview_type  interview_type NOT NULL,
  overall_score   INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  tech_score      INTEGER,
  comm_score      INTEGER,
  quality_score   INTEGER,
  feedback        TEXT,
  suggestions     TEXT,
  transcript      TEXT,  -- JSON array of Q&A
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interviews_user ON interviews(user_id);

-- ============================================================
-- 21. NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       VARCHAR(255) NOT NULL,
  body        TEXT,
  data        JSONB,
  is_read     BOOLEAN DEFAULT FALSE,
  sent_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user   ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Notification preferences
CREATE TABLE notification_preferences (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_alerts     BOOLEAN DEFAULT TRUE,
  exam_alerts    BOOLEAN DEFAULT TRUE,
  deadlines      BOOLEAN DEFAULT TRUE,
  study_reminder BOOLEAN DEFAULT TRUE,
  interview      BOOLEAN DEFAULT TRUE,
  learning       BOOLEAN DEFAULT TRUE,
  push_enabled   BOOLEAN DEFAULT TRUE,
  email_enabled  BOOLEAN DEFAULT FALSE,
  fcm_token      TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- 22. GAMIFICATION
-- ============================================================

CREATE TABLE achievements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         VARCHAR(100) UNIQUE NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  icon        VARCHAR(10),  -- emoji
  xp_value    INTEGER DEFAULT 10,
  category    VARCHAR(50),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE user_stats (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  xp_total        INTEGER DEFAULT 0,
  current_streak  INTEGER DEFAULT 0,
  longest_streak  INTEGER DEFAULT 0,
  last_active     DATE,
  questions_done  INTEGER DEFAULT 0,
  tests_done      INTEGER DEFAULT 0,
  jobs_applied    INTEGER DEFAULT 0,
  videos_watched  INTEGER DEFAULT 0,
  ai_chats        INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- 23. DAILY PLANS
-- ============================================================

CREATE TABLE daily_plans (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_date     DATE NOT NULL,
  tasks         JSONB NOT NULL DEFAULT '[]',
  completion_pct INTEGER DEFAULT 0,
  ai_generated  BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plan_date)
);

-- ============================================================
-- 24. JOB SCAM REPORTS
-- ============================================================

CREATE TABLE job_scam_checks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_text     TEXT NOT NULL,
  risk_level   risk_level,
  risk_reasons TEXT[],
  ai_summary   TEXT,
  disclaimer   TEXT DEFAULT 'This is an AI risk assessment and not a legal guarantee.',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 25. CAREER COMPARISONS
-- ============================================================

CREATE TABLE career_comparisons (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  careers     TEXT[] NOT NULL,
  result      JSONB,
  ai_insight  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS — auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users','profiles','companies','jobs','applications',
    'exams','study_materials','mock_tests','career_goals',
    'roadmaps','resumes','ai_conversations','notification_preferences',
    'user_stats','daily_plans'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();', t, t
    );
  END LOOP;
END;
$$;
