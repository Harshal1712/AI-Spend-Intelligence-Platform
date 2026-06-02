import {
  alerts,
  agents,
  departments,
  employees as employeeSeed,
  integrations as integrationSeed,
  monthly,
  toolUsage,
  usageLogs as usageSeed,
  type Employee,
  type Integration,
  type PromptLog,
  type UsageLog
} from "./platform-data";

type PlatformStore = {
  integrations: Integration[];
  employees: Employee[];
  usageLogs: UsageLog[];
  promptLogs: PromptLog[];
};

const globalStore = globalThis as typeof globalThis & { aiSpendStore?: PlatformStore };

const store =
  globalStore.aiSpendStore ??
  (globalStore.aiSpendStore = {
    integrations: [...integrationSeed],
    employees: [...employeeSeed],
    usageLogs: [...usageSeed],
    promptLogs: []
  });

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function parseMoney(value: string) {
  return Number(value.replace(/[^0-9.]/g, "")) || 0;
}

function formatTokens(tokens: number) {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${Math.round(tokens / 1000)}K`;
  return String(tokens);
}

export function getDashboardData() {
  const totalMonthlyCost = monthly.at(-1)?.cost ?? 0;
  const tokenConsumption = monthly.at(-1)?.tokens ?? 0;
  const activeUsers = departments.reduce((sum, department) => sum + department.users, 0);
  const adoptionRate = Math.round(departments.reduce((sum, department) => sum + department.productivity, 0) / departments.length + 41);

  return {
    metrics: {
      totalAiSpend: 1420000,
      activeUsers,
      monthlyCost: totalMonthlyCost,
      tokenConsumption,
      adoptionRate,
      roiScore: 4.7,
      nextMonthForecast: monthly.at(-1)?.forecast ?? 0,
      productivityImprovement: monthly.at(-1)?.productivity ?? 0,
      timeSavedHours: 8240
    },
    monthly,
    departments,
    toolUsage,
    agents,
    alerts,
    integrations: store.integrations,
    generatedAt: new Date().toISOString()
  };
}

export function searchEmployees({ query = "", team = "All Teams" }: { query?: string; team?: string }) {
  const normalizedQuery = query.trim().toLowerCase();

  return store.employees.filter((employee) => {
    const matchesQuery =
      !normalizedQuery ||
      [employee.name, employee.team, employee.department, employee.tool].some((value) => value.toLowerCase().includes(normalizedQuery));
    const matchesTeam = team === "All Teams" || employee.department === team || employee.team === team || (team === "High Risk" && employee.risk >= 50);

    return matchesQuery && matchesTeam;
  });
}

export function createEmployee(input: {
  name: string;
  team: string;
  department: string;
  tool: string;
  productivity?: number;
  risk?: number;
}) {
  const name = input.name.trim();
  if (!name || !input.team.trim() || !input.department.trim() || !input.tool.trim()) {
    throw new Error("Name, team, department, and AI tool are required.");
  }

  const employee: Employee = {
    id: `emp-${slugify(name)}-${Date.now()}`,
    name,
    team: input.team.trim(),
    department: input.department.trim(),
    tool: input.tool.trim(),
    prompts: 0,
    tokens: "0",
    cost: "$0",
    productivity: input.productivity ?? 72,
    lastActive: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    risk: input.risk ?? 10
  };

  store.employees = [employee, ...store.employees];
  return employee;
}

export function getUsageLogs(employeeId?: string) {
  return employeeId ? store.usageLogs.filter((log) => log.employeeId === employeeId) : store.usageLogs;
}

export function getPromptLogs(employeeId?: string) {
  return employeeId ? store.promptLogs.filter((log) => log.employeeId === employeeId) : store.promptLogs;
}

export function addUsageLog(input: {
  employeeId: string;
  tool: string;
  prompts: number;
  tokens: number;
  cost: number;
  prompt: string;
}) {
  const employee = store.employees.find((item) => item.id === input.employeeId);
  if (!employee) throw new Error("Employee not found.");
  if (!input.prompt.trim()) throw new Error("Prompt is required.");

  const analysis = analyzePrompt(input.prompt);
  const risk = analysis.riskLevel === "Elevated" ? Math.max(employee.risk, 62) : employee.risk;
  const log: UsageLog = {
    id: `usage-${Date.now()}`,
    employeeId: employee.id,
    employeeName: employee.name,
    tool: input.tool.trim() || employee.tool,
    prompts: Number(input.prompts) || 1,
    tokens: Number(input.tokens) || 0,
    cost: Number(input.cost) || 0,
    prompt: input.prompt.trim(),
    createdAt: new Date().toISOString(),
    risk
  };

  store.usageLogs = [log, ...store.usageLogs];
  store.promptLogs = [
    {
      id: `prompt-${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      tool: log.tool,
      prompt: log.prompt,
      quality: analysis.quality,
      efficiency: analysis.efficiency,
      complexity: analysis.complexity,
      riskLevel: analysis.riskLevel,
      createdAt: log.createdAt
    },
    ...store.promptLogs
  ];

  store.employees = store.employees.map((item) => {
    if (item.id !== employee.id) return item;
    const previousTokens = Number(item.tokens.replace(/[^0-9.]/g, "")) * (item.tokens.includes("M") ? 1000000 : item.tokens.includes("K") ? 1000 : 1);
    const nextCost = parseMoney(item.cost) + log.cost;

    return {
      ...item,
      tool: log.tool,
      prompts: item.prompts + log.prompts,
      tokens: formatTokens(previousTokens + log.tokens),
      cost: `$${Math.round(nextCost).toLocaleString("en-US")}`,
      risk,
      lastActive: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    };
  });

  return { log, analysis };
}

export function employeesToCsv(rows: Employee[]) {
  const headers = ["Employee Name", "Team", "Department", "AI Tool Used", "Prompts Sent", "Tokens Consumed", "Monthly Cost", "Productivity Score", "Last Active Date", "Risk Score"];
  const body = rows.map((employee) =>
    [employee.name, employee.team, employee.department, employee.tool, employee.prompts, employee.tokens, employee.cost, employee.productivity, employee.lastActive, employee.risk]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(",")
  );

  return [headers.join(","), ...body].join("\n");
}

export function analyzePrompt(prompt: string) {
  const trimmed = prompt.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const hasFormat = /json|table|bullets|format|schema|csv|summary/i.test(trimmed);
  const hasContext = /role|context|company|department|quarter|monthly|budget|goal/i.test(trimmed);
  const hasRisk = /secret|password|api[_-\s]?key|confidential|contract|customer/i.test(trimmed);
  const hasConstraints = /limit|cap|max|avoid|must|include|exclude|without/i.test(trimmed);

  const quality = Math.min(98, 44 + wordCount * 2 + (hasFormat ? 14 : 0) + (hasContext ? 12 : 0) + (hasConstraints ? 10 : 0));
  const efficiency = Math.max(42, Math.min(96, 92 - Math.max(0, wordCount - 34) + (hasConstraints ? 8 : 0)));
  const complexity = Math.min(95, 28 + wordCount + (hasRisk ? 12 : 0));

  return {
    quality,
    efficiency,
    complexity,
    riskLevel: hasRisk ? "Elevated" : "Low",
    suggestions: [
      hasFormat ? "Output format is clear." : "Add an exact output format, such as JSON, table, or executive bullets.",
      hasContext ? "Business context is present." : "Add role, business goal, department, and decision context.",
      hasConstraints ? "The prompt includes useful constraints." : "Add token, budget, model, and data handling constraints."
    ],
    improvedPrompt: `Act as an enterprise AI spend analyst. Using the latest usage, cost, risk, and productivity data, produce an executive-ready summary with: 1. top cost drivers, 2. wasted spend, 3. model routing recommendations, 4. security risks, 5. ROI impact, and 6. next actions. Keep the answer concise, avoid sensitive data exposure, and use a structured table plus three bullet recommendations.\n\nOriginal request: ${trimmed}`,
    analyzedAt: new Date().toISOString()
  };
}

export function getExecutiveReport() {
  return {
    title: "Executive AI Investment Report",
    totalAiInvestment: "$1.42M",
    totalProductivityGain: "43%",
    estimatedTimeSaved: "8,240 hours",
    costOfInaction: "$2.8M annual opportunity loss",
    riskAssessment: "Moderate",
    adoptionStatus: "Scaling",
    departmentPerformance: "Engineering leads ROI, Support leads repeatable time savings",
    strategicRecommendations: [
      "Route lower-complexity requests to cheaper models.",
      "Remove inactive enterprise seats before renewal.",
      "Require prompt security scanning for Legal and Finance workflows."
    ],
    generatedAt: new Date().toISOString()
  };
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function generateExecutiveReportPdf() {
  const report = getExecutiveReport();
  const lines = [
    report.title,
    `Generated: ${new Date(report.generatedAt).toLocaleString("en-US")}`,
    `Total AI Investment: ${report.totalAiInvestment}`,
    `Total Productivity Gain: ${report.totalProductivityGain}`,
    `Estimated Time Saved: ${report.estimatedTimeSaved}`,
    `Cost of Inaction: ${report.costOfInaction}`,
    `Risk Assessment: ${report.riskAssessment}`,
    `AI Adoption Status: ${report.adoptionStatus}`,
    `Department Performance: ${report.departmentPerformance}`,
    "Strategic Recommendations:",
    ...report.strategicRecommendations.map((item, index) => `${index + 1}. ${item}`)
  ];

  const text = lines.map((line, index) => `BT /F1 ${index === 0 ? 20 : 11} Tf 54 ${760 - index * 28} Td (${escapePdfText(line)}) Tj ET`).join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${text.length} >> stream\n${text}\nendstream endobj`
  ];
  let offset = "%PDF-1.4\n".length;
  const xref = ["0000000000 65535 f "];
  const body = objects
    .map((object) => {
      xref.push(`${String(offset).padStart(10, "0")} 00000 n `);
      offset += object.length + 1;
      return object;
    })
    .join("\n");
  const trailer = `xref\n0 ${xref.length}\n${xref.join("\n")}\ntrailer << /Size ${xref.length} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`;

  return `%PDF-1.4\n${body}\n${trailer}`;
}

export function updateIntegration(name: string, status: "Connected" | "Ready") {
  store.integrations = store.integrations.map((integration) =>
    integration.name === name
      ? {
          ...integration,
          status,
          lastSync: status === "Connected" ? "Just now" : "Not connected"
        }
      : integration
  );

  return store.integrations.find((integration) => integration.name === name);
}
