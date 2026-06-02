export type Employee = {
  id: string;
  name: string;
  team: string;
  department: string;
  tool: string;
  prompts: number;
  tokens: string;
  cost: string;
  productivity: number;
  lastActive: string;
  risk: number;
};

export type UsageLog = {
  id: string;
  employeeId: string;
  employeeName: string;
  tool: string;
  prompts: number;
  tokens: number;
  cost: number;
  prompt: string;
  createdAt: string;
  risk: number;
};

export type PromptLog = {
  id: string;
  employeeId: string;
  employeeName: string;
  tool: string;
  prompt: string;
  quality: number;
  efficiency: number;
  complexity: number;
  riskLevel: string;
  createdAt: string;
};

export type Integration = {
  name: string;
  status: "Connected" | "Ready";
  lastSync: string;
};

export const monthly = [
  { month: "Jan", cost: 62000, tokens: 920, productivity: 18, forecast: 64000 },
  { month: "Feb", cost: 74000, tokens: 1040, productivity: 22, forecast: 76000 },
  { month: "Mar", cost: 89000, tokens: 1190, productivity: 27, forecast: 90000 },
  { month: "Apr", cost: 97000, tokens: 1350, productivity: 31, forecast: 101000 },
  { month: "May", cost: 121000, tokens: 1660, productivity: 38, forecast: 125000 },
  { month: "Jun", cost: 136000, tokens: 1810, productivity: 43, forecast: 142000 }
];

export const departments = [
  { name: "Engineering", value: 48500, productivity: 47, users: 148 },
  { name: "Sales", value: 22100, productivity: 31, users: 84 },
  { name: "Marketing", value: 18400, productivity: 38, users: 62 },
  { name: "Support", value: 15600, productivity: 29, users: 71 },
  { name: "Legal", value: 8900, productivity: 19, users: 18 },
  { name: "Finance", value: 12400, productivity: 25, users: 34 }
];

export const toolUsage = [
  { tool: "ChatGPT", cost: 36200, speed: 87, accuracy: 91, productivity: 43, adoption: 76 },
  { tool: "Claude", cost: 24100, speed: 78, accuracy: 93, productivity: 39, adoption: 58 },
  { tool: "Gemini", cost: 11800, speed: 82, accuracy: 84, productivity: 28, adoption: 41 },
  { tool: "Copilot", cost: 29100, speed: 92, accuracy: 86, productivity: 48, adoption: 71 },
  { tool: "Cursor", cost: 20400, speed: 89, accuracy: 88, productivity: 46, adoption: 54 },
  { tool: "Perplexity", cost: 8200, speed: 94, accuracy: 82, productivity: 25, adoption: 37 }
];

export const employees: Employee[] = [
  { id: "emp-aarav", name: "Aarav Mehta", team: "Platform", department: "Engineering", tool: "Cursor", prompts: 1842, tokens: "21.8M", cost: "$1,420", productivity: 94, lastActive: "May 30, 2026", risk: 12 },
  { id: "emp-maya", name: "Maya Thompson", team: "Growth", department: "Marketing", tool: "ChatGPT", prompts: 936, tokens: "8.4M", cost: "$612", productivity: 88, lastActive: "May 29, 2026", risk: 18 },
  { id: "emp-jordan", name: "Jordan Lee", team: "Enterprise", department: "Sales", tool: "Claude", prompts: 742, tokens: "7.2M", cost: "$486", productivity: 81, lastActive: "May 30, 2026", risk: 22 },
  { id: "emp-priya", name: "Priya Shah", team: "Security", department: "Engineering", tool: "Internal LLM", prompts: 412, tokens: "5.1M", cost: "$284", productivity: 77, lastActive: "May 28, 2026", risk: 63 },
  { id: "emp-noah", name: "Noah Williams", team: "Support Ops", department: "Support", tool: "Gemini", prompts: 1194, tokens: "10.7M", cost: "$533", productivity: 84, lastActive: "May 30, 2026", risk: 16 },
  { id: "emp-elena", name: "Elena Garcia", team: "Finance", department: "Finance", tool: "ChatGPT", prompts: 268, tokens: "2.9M", cost: "$214", productivity: 69, lastActive: "May 27, 2026", risk: 29 },
  { id: "emp-vikram", name: "Vikram Rao", team: "DevEx", department: "Engineering", tool: "GitHub Copilot", prompts: 2038, tokens: "15.2M", cost: "$910", productivity: 96, lastActive: "May 30, 2026", risk: 9 }
];

export const usageLogs: UsageLog[] = [
  {
    id: "usage-1",
    employeeId: "emp-vikram",
    employeeName: "Vikram Rao",
    tool: "GitHub Copilot",
    prompts: 42,
    tokens: 318000,
    cost: 18.7,
    prompt: "Generate tests for the billing usage aggregation endpoint.",
    createdAt: "2026-05-30T10:45:00.000Z",
    risk: 9
  },
  {
    id: "usage-2",
    employeeId: "emp-priya",
    employeeName: "Priya Shah",
    tool: "Internal LLM",
    prompts: 8,
    tokens: 74000,
    cost: 5.2,
    prompt: "Review this security incident summary for possible API key exposure.",
    createdAt: "2026-05-30T09:15:00.000Z",
    risk: 63
  }
];

export const agents = [
  { name: "Cost Intelligence Agent", task: "Forecasting June API exposure", health: 98, recommendation: "Detected 14% spend acceleration in Engineering", activity: "2 min ago", metric: "12 anomalies resolved" },
  { name: "Security Agent", task: "Scanning prompts for secrets", health: 91, recommendation: "3 risky prompts quarantined for review", activity: "45 sec ago", metric: "99.1% detection precision" },
  { name: "Productivity Agent", task: "Scoring team efficiency", health: 94, recommendation: "Support automation saved 412 hours this month", activity: "5 min ago", metric: "41% lift measured" },
  { name: "Optimization Agent", task: "Preparing savings plan", health: 89, recommendation: "Move 32 workflows to cheaper models", activity: "1 min ago", metric: "$31.4K savings found" },
  { name: "Executive Reporting Agent", task: "Drafting board narrative", health: 96, recommendation: "ROI summary ready for leadership", activity: "8 min ago", metric: "8 reports generated" }
];

export const alerts = [
  { title: "Budget threshold reached", body: "Engineering API budget is at 92% with two days left.", level: "High" },
  { title: "Sensitive data sharing", body: "Potential customer contract pasted into Claude.", level: "Critical" },
  { title: "Renewal reminder", body: "Cursor enterprise seats renew in 9 days.", level: "Medium" },
  { title: "Productivity drop", body: "Legal AI adoption declined 11% week over week.", level: "Medium" }
];

export const integrations: Integration[] = ["OpenAI", "Claude", "Gemini", "GitHub", "GitLab", "Slack", "Microsoft Teams", "Jira"].map((name, index) => ({
  name,
  status: index < 5 ? "Connected" : "Ready",
  lastSync: index < 5 ? "3 min ago" : "Not connected"
}));
