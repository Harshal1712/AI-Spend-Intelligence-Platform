CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  budget_monthly NUMERIC(12,2) NOT NULL DEFAULT 0,
  manager_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL CHECK (role IN ('CEO', 'Admin', 'Manager', 'Employee')),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  team TEXT NOT NULL DEFAULT 'General',
  image_url TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE departments
  ADD CONSTRAINT departments_manager_user_fk
  FOREIGN KEY (manager_user_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  ai_tool TEXT NOT NULL,
  model_name TEXT NOT NULL,
  prompt_count INTEGER NOT NULL DEFAULT 1,
  token_consumption INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  productivity_score INTEGER NOT NULL DEFAULT 70,
  time_saved_minutes INTEGER NOT NULL DEFAULT 0,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  usage_log_id UUID REFERENCES ai_usage_logs(id) ON DELETE SET NULL,
  ai_tool TEXT NOT NULL,
  model_name TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  rewritten_prompt TEXT,
  quality_score INTEGER NOT NULL DEFAULT 0,
  effectiveness_score INTEGER NOT NULL DEFAULT 0,
  token_efficiency_score INTEGER NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'Low',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL,
  title TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  scheduled_cron TEXT,
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'Ready',
  config JSONB NOT NULL DEFAULT '{}',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'slack', 'teams', 'in_app')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'Medium',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  associated_cost NUMERIC(12,4),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS model_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  model_name TEXT NOT NULL,
  cost_per_1k_tokens NUMERIC(10,5) NOT NULL,
  speed_score INTEGER NOT NULL,
  quality_score INTEGER NOT NULL,
  productivity_score INTEGER NOT NULL,
  adoption_score INTEGER NOT NULL,
  recommendation TEXT,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider, model_name)
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user_time ON ai_usage_logs(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_department_time ON ai_usage_logs(department_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_user_time ON prompts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_time ON audit_logs(action, created_at DESC);
