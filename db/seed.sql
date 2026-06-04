INSERT INTO departments (name, budget_monthly)
VALUES
  ('Engineering', 70000),
  ('Sales', 32000),
  ('Marketing', 26000),
  ('Support', 22000),
  ('Legal', 14000),
  ('Finance', 18000)
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (email, name, role, department_id, team, password_hash)
SELECT 'ceo@demo.com', 'CEO Demo', 'CEO', NULL, 'Executive', '$2a$10$QvB/1P6v3fzF3VhCZr53IOnV1oBYw7Y8E4Y3tBQNOdYIY4eU9TxoW'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ceo@demo.com');

INSERT INTO users (email, name, role, department_id, team, password_hash)
SELECT 'admin@demo.com', 'Admin Demo', 'Admin', d.id, 'Platform', '$2a$10$QvB/1P6v3fzF3VhCZr53IOnV1oBYw7Y8E4Y3tBQNOdYIY4eU9TxoW'
FROM departments d
WHERE d.name = 'Engineering'
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, name, role, department_id, team, password_hash)
SELECT seed.email, seed.name, seed.role, d.id, seed.team, '$2a$10$QvB/1P6v3fzF3VhCZr53IOnV1oBYw7Y8E4Y3tBQNOdYIY4eU9TxoW'
FROM (
  VALUES
    ('aarav@demo.com', 'Aarav Mehta', 'Employee', 'Engineering', 'Platform'),
    ('maya@demo.com', 'Maya Thompson', 'Manager', 'Marketing', 'Growth'),
    ('jordan@demo.com', 'Jordan Lee', 'Manager', 'Sales', 'Enterprise'),
    ('priya@demo.com', 'Priya Shah', 'Employee', 'Engineering', 'Security'),
    ('noah@demo.com', 'Noah Williams', 'Employee', 'Support', 'Support Ops'),
    ('elena@demo.com', 'Elena Garcia', 'Employee', 'Finance', 'Finance'),
    ('vikram@demo.com', 'Vikram Rao', 'Employee', 'Engineering', 'DevEx')
) AS seed(email, name, role, department, team)
JOIN departments d ON d.name = seed.department
ON CONFLICT (email) DO NOTHING;

INSERT INTO integrations (provider, status, last_sync_at)
VALUES
  ('OpenAI', 'Connected', now()),
  ('Claude', 'Connected', now()),
  ('Gemini', 'Connected', now()),
  ('GitHub', 'Connected', now()),
  ('GitLab', 'Connected', now()),
  ('Slack', 'Ready', NULL),
  ('Microsoft Teams', 'Ready', NULL),
  ('Jira', 'Ready', NULL)
ON CONFLICT (provider) DO NOTHING;

INSERT INTO model_benchmarks (provider, model_name, cost_per_1k_tokens, speed_score, quality_score, productivity_score, adoption_score, recommendation)
VALUES
  ('OpenAI', 'GPT-4o', 0.00500, 88, 94, 91, 78, 'Use for high-value reasoning and executive work.'),
  ('OpenAI', 'GPT-4o-mini', 0.00060, 95, 84, 87, 71, 'Route repetitive summarization here to reduce spend.'),
  ('Anthropic', 'Claude 3.5 Sonnet', 0.00300, 82, 95, 89, 62, 'Use for long-form analysis and policy workflows.'),
  ('Google', 'Gemini 1.5 Pro', 0.00250, 86, 87, 78, 45, 'Good for multimodal and broad research workflows.'),
  ('GitHub', 'Copilot', 0.00120, 92, 86, 94, 74, 'Best fit for developer productivity.'),
  ('Cursor', 'Cursor Agent', 0.00140, 90, 88, 93, 59, 'Best fit for codebase-aware engineering tasks.'),
  ('Perplexity', 'Sonar', 0.00100, 96, 82, 73, 38, 'Best fit for fast external research.')
ON CONFLICT (provider, model_name) DO NOTHING;
