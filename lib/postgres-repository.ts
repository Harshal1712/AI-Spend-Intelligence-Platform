import { hasDatabase, query } from "./db";
import { analyzePrompt, generateExecutiveReportPdf as generateFallbackPdf, getDashboardData as getFallbackDashboard, searchEmployees as searchFallbackEmployees } from "./platform-service";
import type { Role } from "./permissions";

export type AnalyticsScope = {
  role?: Role;
  userId?: string;
  departmentId?: string;
};

function scopeClause(scope: AnalyticsScope, alias = "u") {
  if (scope.role === "Employee" && scope.userId) {
    return { clause: ` AND ${alias}.id = $1`, params: [scope.userId] };
  }

  if (scope.role === "Manager" && scope.departmentId) {
    return { clause: ` AND ${alias}.department_id = $1`, params: [scope.departmentId] };
  }

  return { clause: "", params: [] };
}

export async function getEnterpriseDashboard(scope: AnalyticsScope = {}) {
  if (!hasDatabase) return getFallbackDashboard();

  const scoped = scopeClause(scope, "u");
  const params = scoped.params;
  const totals = await query<{
    total_spend: string;
    tokens_consumed: string;
    active_users: string;
    time_saved_minutes: string;
    productivity_gain: string;
  }>(
    `SELECT
      COALESCE(SUM(l.cost), 0)::text AS total_spend,
      COALESCE(SUM(l.token_consumption), 0)::text AS tokens_consumed,
      COUNT(DISTINCT l.user_id)::text AS active_users,
      COALESCE(SUM(l.time_saved_minutes), 0)::text AS time_saved_minutes,
      COALESCE(AVG(l.productivity_score), 0)::text AS productivity_gain
    FROM ai_usage_logs l
    JOIN users u ON u.id = l.user_id
    WHERE l.occurred_at >= date_trunc('month', now()) ${scoped.clause}`,
    params
  );

  const monthly = await query<{ month: string; cost: string; tokens: string; productivity: string }>(
    `SELECT
      to_char(date_trunc('month', l.occurred_at), 'Mon') AS month,
      COALESCE(SUM(l.cost), 0)::text AS cost,
      COALESCE(SUM(l.token_consumption), 0)::text AS tokens,
      COALESCE(AVG(l.productivity_score), 0)::text AS productivity
    FROM ai_usage_logs l
    JOIN users u ON u.id = l.user_id
    WHERE l.occurred_at >= now() - interval '6 months' ${scoped.clause}
    GROUP BY date_trunc('month', l.occurred_at)
    ORDER BY date_trunc('month', l.occurred_at)`,
    params
  );

  const departments = await query<{ name: string; value: string; productivity: string; users: string; budget_monthly: string }>(
    `SELECT
      d.name,
      COALESCE(SUM(l.cost), 0)::text AS value,
      COALESCE(AVG(l.productivity_score), 0)::text AS productivity,
      COUNT(DISTINCT u.id)::text AS users,
      d.budget_monthly::text
    FROM departments d
    LEFT JOIN users u ON u.department_id = d.id
    LEFT JOIN ai_usage_logs l ON l.user_id = u.id AND l.occurred_at >= date_trunc('month', now())
    WHERE 1 = 1 ${scope.role === "Manager" && scope.departmentId ? "AND d.id = $1" : ""}
    GROUP BY d.id, d.name, d.budget_monthly
    ORDER BY value::numeric DESC`,
    scope.role === "Manager" && scope.departmentId ? [scope.departmentId] : []
  );

  const toolUsage = await query<{ tool: string; cost: string; adoption: string; productivity: string; speed: string; accuracy: string }>(
    `SELECT
      l.ai_tool AS tool,
      COALESCE(SUM(l.cost), 0)::text AS cost,
      COUNT(DISTINCT l.user_id)::text AS adoption,
      COALESCE(AVG(l.productivity_score), 0)::text AS productivity,
      COALESCE(AVG(m.speed_score), 75)::text AS speed,
      COALESCE(AVG(m.quality_score), 80)::text AS accuracy
    FROM ai_usage_logs l
    JOIN users u ON u.id = l.user_id
    LEFT JOIN model_benchmarks m ON m.model_name = l.model_name OR m.provider = l.ai_tool
    WHERE l.occurred_at >= date_trunc('month', now()) ${scoped.clause}
    GROUP BY l.ai_tool
    ORDER BY cost::numeric DESC`,
    params
  );

  const security = await query<{ incident_count: string; risk_score: string; critical_count: string }>(
    `SELECT
      COUNT(*)::text AS incident_count,
      COALESCE(AVG(CASE severity WHEN 'Critical' THEN 95 WHEN 'High' THEN 75 WHEN 'Medium' THEN 45 ELSE 20 END), 0)::text AS risk_score,
      COUNT(*) FILTER (WHERE severity = 'Critical')::text AS critical_count
    FROM security_events
    WHERE detected_at >= now() - interval '30 days'`
  );

  const total = totals.rows[0];
  const totalSpend = Number(total?.total_spend ?? 0);
  const productivityGain = Number(total?.productivity_gain ?? 0);
  const forecast = monthly.rows.length > 1 ? Math.round(Number(monthly.rows.at(-1)?.cost ?? 0) * 1.12) : Math.round(totalSpend * 1.12);

  return {
    metrics: {
      totalAiSpend: totalSpend,
      activeUsers: Number(total?.active_users ?? 0),
      monthlyCost: totalSpend,
      tokenConsumption: Number(total?.tokens_consumed ?? 0),
      adoptionRate: Number(total?.active_users ?? 0),
      roiScore: Number((productivityGain / 10).toFixed(1)),
      nextMonthForecast: forecast,
      productivityImprovement: Math.round(productivityGain),
      timeSavedHours: Math.round(Number(total?.time_saved_minutes ?? 0) / 60),
      securityRiskScore: Math.round(Number(security.rows[0]?.risk_score ?? 0)),
      incidentCount: Number(security.rows[0]?.incident_count ?? 0)
    },
    monthly: monthly.rows.map((row) => ({
      month: row.month,
      cost: Number(row.cost),
      tokens: Number(row.tokens),
      productivity: Math.round(Number(row.productivity)),
      forecast
    })),
    departments: departments.rows.map((row) => ({
      name: row.name,
      value: Number(row.value),
      productivity: Math.round(Number(row.productivity)),
      users: Number(row.users),
      budget: Number(row.budget_monthly)
    })),
    toolUsage: toolUsage.rows.map((row) => ({
      tool: row.tool,
      cost: Number(row.cost),
      adoption: Number(row.adoption),
      productivity: Math.round(Number(row.productivity)),
      speed: Math.round(Number(row.speed)),
      accuracy: Math.round(Number(row.accuracy))
    })),
    securitySummary: security.rows[0],
    generatedAt: new Date().toISOString()
  };
}

export async function listEmployeesFromDb({ queryText = "", team = "All Teams", scope = {} }: { queryText?: string; team?: string; scope?: AnalyticsScope }) {
  if (!hasDatabase) return searchFallbackEmployees({ query: queryText, team });

  const values: unknown[] = [];
  const where: string[] = [];

  if (queryText.trim()) {
    values.push(`%${queryText.trim()}%`);
    where.push(`(u.name ILIKE $${values.length} OR u.email ILIKE $${values.length} OR u.team ILIKE $${values.length} OR d.name ILIKE $${values.length})`);
  }

  if (team !== "All Teams" && team !== "High Risk") {
    values.push(team);
    where.push(`(u.team = $${values.length} OR d.name = $${values.length})`);
  }

  if (scope.role === "Employee" && scope.userId) {
    values.push(scope.userId);
    where.push(`u.id = $${values.length}`);
  }

  if (scope.role === "Manager" && scope.departmentId) {
    values.push(scope.departmentId);
    where.push(`u.department_id = $${values.length}`);
  }

  const result = await query<{
    id: string;
    name: string;
    team: string;
    department: string;
    tool: string;
    prompts: string;
    tokens: string;
    cost: string;
    productivity: string;
    last_active: string;
    risk: string;
  }>(
    `SELECT
      u.id,
      u.name,
      u.team,
      COALESCE(d.name, 'Unassigned') AS department,
      COALESCE((array_agg(l.ai_tool ORDER BY l.occurred_at DESC))[1], 'No usage') AS tool,
      COALESCE(SUM(l.prompt_count), 0)::text AS prompts,
      COALESCE(SUM(l.token_consumption), 0)::text AS tokens,
      COALESCE(SUM(l.cost), 0)::text AS cost,
      COALESCE(AVG(l.productivity_score), 0)::text AS productivity,
      COALESCE(MAX(l.occurred_at), u.created_at)::text AS last_active,
      COALESCE(MAX(CASE se.severity WHEN 'Critical' THEN 95 WHEN 'High' THEN 75 WHEN 'Medium' THEN 45 ELSE 10 END), 10)::text AS risk
    FROM users u
    LEFT JOIN departments d ON d.id = u.department_id
    LEFT JOIN ai_usage_logs l ON l.user_id = u.id
    LEFT JOIN security_events se ON se.user_id = u.id AND se.status = 'Open'
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    GROUP BY u.id, u.name, u.team, d.name, u.created_at
    ${team === "High Risk" ? "HAVING COALESCE(MAX(CASE se.severity WHEN 'Critical' THEN 95 WHEN 'High' THEN 75 WHEN 'Medium' THEN 45 ELSE 10 END), 10) >= 50" : ""}
    ORDER BY cost::numeric DESC`,
    values
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    team: row.team,
    department: row.department,
    tool: row.tool,
    prompts: Number(row.prompts),
    tokens: Number(row.tokens).toLocaleString("en-US"),
    cost: `$${Math.round(Number(row.cost)).toLocaleString("en-US")}`,
    productivity: Math.round(Number(row.productivity)),
    lastActive: new Date(row.last_active).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    risk: Math.round(Number(row.risk))
  }));
}

export async function createEmployeeInDb(input: { name: string; email: string; team: string; department: string; tool: string; role?: Role }) {
  if (!hasDatabase) {
    const { createEmployee } = await import("./platform-service");
    return createEmployee(input);
  }

  const department = await query<{ id: string }>(
    "INSERT INTO departments (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET updated_at = now() RETURNING id",
    [input.department]
  );
  const result = await query<{ id: string; name: string; team: string; role: Role }>(
    `INSERT INTO users (email, name, role, department_id, team)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, team, role`,
    [input.email, input.name, input.role ?? "Employee", department.rows[0].id, input.team]
  );

  await auditLog({ action: "employee.created", entityType: "users", entityId: result.rows[0].id, metadata: { email: input.email, department: input.department } });

  return {
    id: result.rows[0].id,
    name: result.rows[0].name,
    team: result.rows[0].team,
    department: input.department,
    tool: input.tool,
    prompts: 0,
    tokens: "0",
    cost: "$0",
    productivity: 0,
    lastActive: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    risk: 10
  };
}

export async function createUsageInDb(input: { employeeId: string; tool: string; modelName: string; prompts: number; tokens: number; cost: number; prompt: string }) {
  if (!hasDatabase) {
    const { addUsageLog } = await import("./platform-service");
    return addUsageLog({ employeeId: input.employeeId, tool: input.tool, prompts: input.prompts, tokens: input.tokens, cost: input.cost, prompt: input.prompt });
  }

  const user = await query<{ department_id: string | null; name: string }>("SELECT department_id, name FROM users WHERE id = $1", [input.employeeId]);
  if (!user.rows[0]) throw new Error("Employee not found.");

  const analysis = analyzePrompt(input.prompt);
  const usage = await query<{ id: string }>(
    `INSERT INTO ai_usage_logs (user_id, department_id, ai_tool, model_name, prompt_count, token_consumption, cost, productivity_score, time_saved_minutes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [input.employeeId, user.rows[0].department_id, input.tool, input.modelName, input.prompts, input.tokens, input.cost, analysis.quality, Math.round(input.prompts * 18)]
  );

  const prompt = await query<{ id: string }>(
    `INSERT INTO prompts (user_id, usage_log_id, ai_tool, model_name, prompt_text, rewritten_prompt, quality_score, effectiveness_score, token_efficiency_score, risk_level)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [input.employeeId, usage.rows[0].id, input.tool, input.modelName, input.prompt, analysis.improvedPrompt, analysis.quality, analysis.quality, analysis.efficiency, analysis.riskLevel]
  );

  if (analysis.riskLevel === "Elevated") {
    await query(
      `INSERT INTO security_events (user_id, department_id, prompt_id, event_type, severity, description)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [input.employeeId, user.rows[0].department_id, prompt.rows[0].id, "sensitive_prompt", "High", "Sensitive prompt content detected by prompt intelligence analyzer."]
    );
  }

  await auditLog({ action: "usage.created", entityType: "ai_usage_logs", entityId: usage.rows[0].id, associatedCost: input.cost, metadata: { tool: input.tool, modelName: input.modelName } });

  return {
    log: {
      id: usage.rows[0].id,
      employeeId: input.employeeId,
      employeeName: user.rows[0].name,
      tool: input.tool,
      prompts: input.prompts,
      tokens: input.tokens,
      cost: input.cost,
      prompt: input.prompt,
      createdAt: new Date().toISOString(),
      risk: analysis.riskLevel === "Elevated" ? 75 : 10
    },
    analysis
  };
}

export async function listPromptHistory(scope: AnalyticsScope = {}) {
  if (!hasDatabase) {
    const { getPromptLogs } = await import("./platform-service");
    return getPromptLogs();
  }

  const scoped = scopeClause(scope, "u");
  const result = await query<{
    id: string;
    employee_name: string;
    ai_tool: string;
    prompt_text: string;
    quality_score: number;
    risk_level: string;
    created_at: string;
  }>(
    `SELECT p.id, u.name AS employee_name, p.ai_tool, p.prompt_text, p.quality_score, p.risk_level, p.created_at::text
     FROM prompts p
     JOIN users u ON u.id = p.user_id
     WHERE 1 = 1 ${scoped.clause}
     ORDER BY p.created_at DESC
     LIMIT 100`,
    scoped.params
  );

  return result.rows.map((row) => ({
    id: row.id,
    employeeName: row.employee_name,
    tool: row.ai_tool,
    prompt: row.prompt_text,
    quality: row.quality_score,
    riskLevel: row.risk_level,
    createdAt: row.created_at
  }));
}

export async function getSecurityDashboard() {
  if (!hasDatabase) return { events: [], riskScore: 31, incidentCount: 12, threatLevel: "Medium", complianceStatus: "94%" };

  const result = await query<{ incident_count: string; risk_score: string; critical_count: string }>(
    `SELECT COUNT(*)::text AS incident_count,
      COALESCE(AVG(CASE severity WHEN 'Critical' THEN 95 WHEN 'High' THEN 75 WHEN 'Medium' THEN 45 ELSE 20 END), 0)::text AS risk_score,
      COUNT(*) FILTER (WHERE severity = 'Critical')::text AS critical_count
    FROM security_events
    WHERE detected_at >= now() - interval '30 days'`
  );
  const events = await query("SELECT id, event_type, severity, description, status, detected_at FROM security_events ORDER BY detected_at DESC LIMIT 50");
  const riskScore = Math.round(Number(result.rows[0]?.risk_score ?? 0));

  return {
    riskScore,
    incidentCount: Number(result.rows[0]?.incident_count ?? 0),
    threatLevel: riskScore > 80 ? "Critical" : riskScore > 60 ? "High" : riskScore > 35 ? "Medium" : "Low",
    complianceStatus: `${Math.max(0, 100 - riskScore)}%`,
    events: events.rows
  };
}

export async function getBenchmarks() {
  if (!hasDatabase) return [];
  const result = await query("SELECT provider, model_name, cost_per_1k_tokens, speed_score, quality_score, productivity_score, adoption_score, recommendation FROM model_benchmarks ORDER BY productivity_score DESC");
  return result.rows;
}

export async function auditLog(input: { actorUserId?: string; action: string; entityType: string; entityId?: string; associatedCost?: number; metadata?: Record<string, unknown> }) {
  if (!hasDatabase) return;
  await query(
    `INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, associated_cost, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [input.actorUserId ?? null, input.action, input.entityType, input.entityId ?? null, input.associatedCost ?? null, JSON.stringify(input.metadata ?? {})]
  );
}

export async function getAuditLogs(queryText = "") {
  if (!hasDatabase) return [];
  const values: unknown[] = [];
  const where = queryText ? "WHERE action ILIKE $1 OR entity_type ILIKE $1" : "";
  if (queryText) values.push(`%${queryText}%`);
  const result = await query(`SELECT id, actor_user_id, action, entity_type, entity_id, associated_cost, metadata, created_at FROM audit_logs ${where} ORDER BY created_at DESC LIMIT 100`, values);
  return result.rows;
}

export async function generateExecutiveReportPdf() {
  return generateFallbackPdf();
}
