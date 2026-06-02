"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BrainCircuit,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  Download,
  FileText,
  Gauge,
  GitBranch,
  KeyRound,
  LockKeyhole,
  MessageSquareText,
  PieChart as PieIcon,
  Plus,
  PlugZap,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Users,
  WandSparkles,
  Zap
} from "lucide-react";
import { clsx } from "clsx";
import type { Employee, Integration } from "@/lib/platform-data";

const monthly = [
  { month: "Jan", cost: 62000, tokens: 920, productivity: 18, forecast: 64000 },
  { month: "Feb", cost: 74000, tokens: 1040, productivity: 22, forecast: 76000 },
  { month: "Mar", cost: 89000, tokens: 1190, productivity: 27, forecast: 90000 },
  { month: "Apr", cost: 97000, tokens: 1350, productivity: 31, forecast: 101000 },
  { month: "May", cost: 121000, tokens: 1660, productivity: 38, forecast: 125000 },
  { month: "Jun", cost: 136000, tokens: 1810, productivity: 43, forecast: 142000 }
];

const departments = [
  { name: "Engineering", value: 48500, productivity: 47, users: 148 },
  { name: "Sales", value: 22100, productivity: 31, users: 84 },
  { name: "Marketing", value: 18400, productivity: 38, users: 62 },
  { name: "Support", value: 15600, productivity: 29, users: 71 },
  { name: "Legal", value: 8900, productivity: 19, users: 18 },
  { name: "Finance", value: 12400, productivity: 25, users: 34 }
];

const toolUsage = [
  { tool: "ChatGPT", cost: 36200, speed: 87, accuracy: 91, productivity: 43, adoption: 76 },
  { tool: "Claude", cost: 24100, speed: 78, accuracy: 93, productivity: 39, adoption: 58 },
  { tool: "Gemini", cost: 11800, speed: 82, accuracy: 84, productivity: 28, adoption: 41 },
  { tool: "Copilot", cost: 29100, speed: 92, accuracy: 86, productivity: 48, adoption: 71 },
  { tool: "Cursor", cost: 20400, speed: 89, accuracy: 88, productivity: 46, adoption: 54 },
  { tool: "Perplexity", cost: 8200, speed: 94, accuracy: 82, productivity: 25, adoption: 37 }
];

const initialEmployees: Employee[] = [
  { id: "emp-aarav", name: "Aarav Mehta", team: "Platform", department: "Engineering", tool: "Cursor", prompts: 1842, tokens: "21.8M", cost: "$1,420", productivity: 94, lastActive: "May 30, 2026", risk: 12 },
  { id: "emp-maya", name: "Maya Thompson", team: "Growth", department: "Marketing", tool: "ChatGPT", prompts: 936, tokens: "8.4M", cost: "$612", productivity: 88, lastActive: "May 29, 2026", risk: 18 },
  { id: "emp-jordan", name: "Jordan Lee", team: "Enterprise", department: "Sales", tool: "Claude", prompts: 742, tokens: "7.2M", cost: "$486", productivity: 81, lastActive: "May 30, 2026", risk: 22 },
  { id: "emp-priya", name: "Priya Shah", team: "Security", department: "Engineering", tool: "Internal LLM", prompts: 412, tokens: "5.1M", cost: "$284", productivity: 77, lastActive: "May 28, 2026", risk: 63 },
  { id: "emp-noah", name: "Noah Williams", team: "Support Ops", department: "Support", tool: "Gemini", prompts: 1194, tokens: "10.7M", cost: "$533", productivity: 84, lastActive: "May 30, 2026", risk: 16 },
  { id: "emp-elena", name: "Elena Garcia", team: "Finance", department: "Finance", tool: "ChatGPT", prompts: 268, tokens: "2.9M", cost: "$214", productivity: 69, lastActive: "May 27, 2026", risk: 29 },
  { id: "emp-vikram", name: "Vikram Rao", team: "DevEx", department: "Engineering", tool: "GitHub Copilot", prompts: 2038, tokens: "15.2M", cost: "$910", productivity: 96, lastActive: "May 30, 2026", risk: 9 }
];

const agents = [
  ["Cost Intelligence Agent", "Forecasting June API exposure", 98, "Detected 14% spend acceleration in Engineering", "2 min ago", "12 anomalies resolved"],
  ["Security Agent", "Scanning prompts for secrets", 91, "3 risky prompts quarantined for review", "45 sec ago", "99.1% detection precision"],
  ["Productivity Agent", "Scoring team efficiency", 94, "Support automation saved 412 hours this month", "5 min ago", "41% lift measured"],
  ["Optimization Agent", "Preparing savings plan", 89, "Move 32 workflows to cheaper models", "1 min ago", "$31.4K savings found"],
  ["Executive Reporting Agent", "Drafting board narrative", 96, "ROI summary ready for leadership", "8 min ago", "8 reports generated"]
];

const alerts = [
  ["Budget threshold reached", "Engineering API budget is at 92% with two days left.", "High"],
  ["Sensitive data sharing", "Potential customer contract pasted into Claude.", "Critical"],
  ["Renewal reminder", "Cursor enterprise seats renew in 9 days.", "Medium"],
  ["Productivity drop", "Legal AI adoption declined 11% week over week.", "Medium"]
];

const initialIntegrations: Integration[] = ["OpenAI", "Claude", "Gemini", "GitHub", "GitLab", "Slack", "Microsoft Teams", "Jira"].map((name, index) => ({
  name,
  status: index < 5 ? "Connected" : "Ready",
  lastSync: index < 5 ? "3 min ago" : "Not connected"
}));
const colors = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

type PromptAnalysis = {
  quality: number;
  efficiency: number;
  complexity: number;
  riskLevel: string;
  suggestions: string[];
  improvedPrompt: string;
};

type PromptLog = {
  id: string;
  employeeName: string;
  tool: string;
  prompt: string;
  quality: number;
  riskLevel: string;
  createdAt: string;
};

function formatMoney(value: number) {
  return `$${Math.round(value / 1000)}K`;
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("glass rounded-lg p-5", className)}>{children}</div>;
}

function SectionTitle({ icon: Icon, title, eyebrow }: { icon: typeof Activity; title: string; eyebrow: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan">
          <Icon className="h-4 w-4" />
          {eyebrow}
        </div>
        <h2 className="text-2xl font-semibold text-white md:text-3xl">{title}</h2>
      </div>
      <button className="hidden items-center gap-2 rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 md:flex">
        View details <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, delta, tone = "mint" }: { icon: typeof Activity; label: string; value: string; delta: string; tone?: "mint" | "cyan" | "amber" | "rose" }) {
  const toneClass = {
    mint: "text-mint bg-mint/10",
    cyan: "text-cyan bg-cyan/10",
    amber: "text-amber bg-amber/10",
    rose: "text-rose bg-rose/10"
  }[tone];
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="glass rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className={clsx("rounded-md p-2", toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="flex items-center gap-1 rounded-full border border-line bg-white/5 px-2 py-1 text-xs text-mint">
          <ArrowUpRight className="h-3 w-3" />
          {delta}
        </span>
      </div>
      <div className="mt-5 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-sm text-slate-400">{label}</div>
    </motion.div>
  );
}

function ChartShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="min-h-[320px]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-400">Live</span>
      </div>
      <div className="h-64">{children}</div>
    </Card>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line bg-white p-3 text-xs shadow-card">
      <div className="mb-1 font-semibold text-white">{label}</div>
      {payload.map((item: any) => (
        <div key={item.dataKey} className="text-slate-300">
          {item.name || item.dataKey}: {typeof item.value === "number" && item.value > 1000 ? formatMoney(item.value) : item.value}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [employeeRows, setEmployeeRows] = useState<Employee[]>(initialEmployees);
  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [newEmployee, setNewEmployee] = useState({ name: "", team: "", department: "", tool: "ChatGPT" });
  const [usageEntry, setUsageEntry] = useState({ employeeId: "emp-aarav", tool: "ChatGPT", prompts: 1, tokens: 25000, cost: 4.5, prompt: "" });
  const [promptHistory, setPromptHistory] = useState<PromptLog[]>([]);
  const [prompt, setPrompt] = useState("Summarize quarterly usage, identify teams wasting tokens, and recommend cheaper model routing without losing answer quality.");
  const [promptAnalysis, setPromptAnalysis] = useState<PromptAnalysis>({
    quality: 92,
    efficiency: 84,
    complexity: 61,
    riskLevel: "Low",
    suggestions: ["Output format is clear.", "Business context is present.", "The prompt includes useful constraints."],
    improvedPrompt: "Structured executive summary with token cap, risk filters, model routing, and measurable ROI fields."
  });
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
  const [backendStatus, setBackendStatus] = useState("Connecting");
  const employeeExportUrl = useMemo(
    () => `/api/employees/export?q=${encodeURIComponent(searchQuery)}&team=${encodeURIComponent(teamFilter)}`,
    [searchQuery, teamFilter]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/employees?q=${encodeURIComponent(searchQuery)}&team=${encodeURIComponent(teamFilter)}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { employees: Employee[] }) => {
        setEmployeeRows(data.employees);
        setBackendStatus("Synced");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setBackendStatus("Offline cache");
        }
      });

    return () => controller.abort();
  }, [searchQuery, teamFilter]);

  useEffect(() => {
    fetch("/api/prompts")
      .then((response) => response.json())
      .then((data: { prompts: PromptLog[] }) => setPromptHistory(data.prompts))
      .catch(() => setPromptHistory([]));
  }, []);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => response.json())
      .then((data: { integrations?: Integration[] }) => {
        if (data.integrations) setIntegrations(data.integrations);
        setBackendStatus("Synced");
      })
      .catch(() => setBackendStatus("Offline cache"));
  }, []);

  async function handlePromptAnalysis() {
    const response = await fetch("/api/prompts/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    if (response.ok) {
      setPromptAnalysis(await response.json());
      setBackendStatus("Synced");
    }
  }

  async function refreshEmployees() {
    const response = await fetch(`/api/employees?q=${encodeURIComponent(searchQuery)}&team=${encodeURIComponent(teamFilter)}`);
    if (response.ok) {
      const data = (await response.json()) as { employees: Employee[] };
      setEmployeeRows(data.employees);
    }
  }

  async function handleCreateEmployee(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEmployee)
    });

    if (response.ok) {
      const data = (await response.json()) as { employee: Employee };
      setEmployeeRows((current) => [data.employee, ...current]);
      setUsageEntry((current) => ({ ...current, employeeId: data.employee.id, tool: data.employee.tool }));
      setNewEmployee({ name: "", team: "", department: "", tool: "ChatGPT" });
      setBackendStatus("Employee added");
    }
  }

  async function handleAddUsage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usageEntry)
    });

    if (response.ok) {
      const data = (await response.json()) as { analysis: PromptAnalysis };
      setPromptAnalysis(data.analysis);
      setUsageEntry((current) => ({ ...current, prompt: "" }));
      await refreshEmployees();
      const prompts = await fetch("/api/prompts").then((item) => item.json()) as { prompts: PromptLog[] };
      setPromptHistory(prompts.prompts);
      setBackendStatus("Usage saved");
    }
  }

  async function toggleIntegration(integration: Integration) {
    const nextStatus = integration.status === "Connected" ? "Ready" : "Connected";
    const response = await fetch("/api/integrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: integration.name, status: nextStatus })
    });

    if (response.ok) {
      const data = (await response.json()) as { integration: Integration };
      setIntegrations((current) => current.map((item) => (item.name === data.integration.name ? data.integration : item)));
      setBackendStatus("Synced");
    }
  }

  return (
    <main className="relative min-h-screen">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 border-r border-line bg-black/30 p-5 backdrop-blur-xl xl:block">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-mint/15 text-mint">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">AI Spend Intelligence</div>
            <div className="text-xs text-slate-400">Enterprise command center</div>
          </div>
        </div>
        <nav className="mt-8 space-y-1">
          {[
            ["Executive", Gauge],
            ["Employees", Users],
            ["Cost Intelligence", CircleDollarSign],
            ["Productivity", TrendingUp],
            ["Prompt Analyzer", MessageSquareText],
            ["Security", ShieldAlert],
            ["Optimization", Sparkles],
            ["Agents", BrainCircuit],
            ["Forecasting", Activity],
            ["Benchmarking", Target],
            ["Reports", FileText],
            ["Integrations", PlugZap]
          ].map(([item, Icon]) => (
            <a key={item as string} href={`#${String(item).toLowerCase().replaceAll(" ", "-")}`} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white">
              <Icon className="h-4 w-4" />
              {item as string}
            </a>
          ))}
        </nav>
      </aside>

      <div className="xl:pl-72">
        <header className="sticky top-0 z-20 border-b border-line bg-[#06070b]/78 px-4 py-3 backdrop-blur-xl md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-line bg-white/5 px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="Search employees, prompts, tools, reports, budgets..." />
            </div>
            <button className="grid h-10 w-10 place-items-center rounded-md border border-line bg-white/5 text-slate-200">
              <Bell className="h-4 w-4" />
            </button>
            <button className="hidden rounded-md bg-mint px-4 py-2 text-sm font-semibold text-black shadow-glow md:block">{backendStatus}</button>
          </div>
        </header>

        <div className="mx-auto max-w-[1560px] space-y-10 px-4 py-6 md:px-8">
          <section id="executive" className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass overflow-hidden rounded-lg p-6 md:p-8">
              <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/10 px-3 py-1 text-xs font-semibold text-mint">
                    <Zap className="h-3.5 w-3.5" />
                    Real-time AI governance cockpit
                  </div>
                  <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.02em] text-white md:text-6xl">AI Spend Intelligence Platform</h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                    Monitor AI subscriptions, API usage, employee adoption, security exposure, productivity lift, and executive ROI from every enterprise AI tool.
                  </p>
                </div>
                <div className="rounded-lg border border-line bg-black/25 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">ROI score</div>
                  <div className="mt-2 text-5xl font-semibold text-mint">4.7x</div>
                  <div className="mt-2 flex items-center gap-1 text-sm text-mint"><ArrowUpRight className="h-4 w-4" /> 18% this month</div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard icon={CircleDollarSign} label="Total AI Spend" value="$1.42M" delta="+14.2%" />
                <MetricCard icon={Users} label="Active Users" value="417" delta="+21" tone="cyan" />
                <MetricCard icon={Activity} label="Token Consumption" value="1.81B" delta="+9.4%" tone="amber" />
                <MetricCard icon={Timer} label="Time Saved Using AI" value="8,240h" delta="+31%" />
                <MetricCard icon={Building2} label="Monthly Cost" value="$136K" delta="+12.4%" tone="rose" />
                <MetricCard icon={Target} label="AI Adoption Rate" value="72%" delta="+8%" tone="cyan" />
                <MetricCard icon={TrendingUp} label="Next Month Forecast" value="$142K" delta="+4.4%" tone="amber" />
                <MetricCard icon={Gauge} label="Productivity Improvement" value="43%" delta="+5%" />
              </div>
            </motion.div>

            <Card>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Executive Briefing</h3>
                <span className="rounded-full bg-mint/10 px-2 py-1 text-xs text-mint">Board ready</span>
              </div>
              <div className="mt-6 space-y-4">
                {["$31.4K potential monthly savings identified", "3 security incidents require review", "Engineering delivers highest AI productivity ROI", "Copilot and Cursor outperform generic chat for developer workflows"].map((item) => (
                  <div key={item} className="flex gap-3 rounded-md border border-line bg-white/[0.03] p-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                    <span className="text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg border border-line bg-black/25 p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-slate-400">Budget utilization</span>
                  <span className="text-white">84%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-mint to-cyan" />
                </div>
              </div>
            </Card>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <ChartShell title="Monthly Cost Trend">
              <ResponsiveContainer>
                <AreaChart data={monthly}>
                  <defs>
                    <linearGradient id="cost" x1="0" x2="0" y1="0" y2="1">
                      <stop stopColor="#37f5b1" stopOpacity={0.38} />
                      <stop offset="1" stopColor="#37f5b1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(148,163,184,.1)" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={formatMoney} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area dataKey="cost" name="Cost" stroke="#37f5b1" fill="url(#cost)" strokeWidth={2} />
                  <Line dataKey="forecast" name="Forecast" stroke="#46d5ff" strokeDasharray="5 5" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartShell>
            <ChartShell title="Cost vs Productivity Graph">
              <ResponsiveContainer>
                <ComposedChart data={monthly}>
                  <CartesianGrid stroke="rgba(148,163,184,.1)" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis yAxisId="left" stroke="#94a3b8" tickFormatter={formatMoney} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="cost" name="Cost" fill="#46d5ff" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" dataKey="productivity" name="Productivity %" stroke="#f8bd4d" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartShell>
          </section>

          <section id="employees">
            <SectionTitle icon={Users} eyebrow="Employee analytics" title="Every employee's AI activity, cost, productivity, and risk" />
            <Card>
              <div className="mb-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={handleCreateEmployee} className="rounded-lg border border-line bg-white/[0.03] p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                    <Plus className="h-4 w-4 text-cyan" />
                    Add employee
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input required value={newEmployee.name} onChange={(event) => setNewEmployee((current) => ({ ...current, name: event.target.value }))} className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none" placeholder="Employee name" />
                    <input required value={newEmployee.team} onChange={(event) => setNewEmployee((current) => ({ ...current, team: event.target.value }))} className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none" placeholder="Team" />
                    <input required value={newEmployee.department} onChange={(event) => setNewEmployee((current) => ({ ...current, department: event.target.value }))} className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none" placeholder="Department" />
                    <select value={newEmployee.tool} onChange={(event) => setNewEmployee((current) => ({ ...current, tool: event.target.value }))} className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none">
                      {["ChatGPT", "Claude", "Gemini", "GitHub Copilot", "Cursor", "Windsurf", "Perplexity", "Internal LLM"].map((tool) => <option key={tool}>{tool}</option>)}
                    </select>
                  </div>
                  <button className="mt-3 flex items-center gap-2 rounded-md bg-cyan px-3 py-2 text-sm font-semibold text-black"><Plus className="h-4 w-4" /> Add employee</button>
                </form>

                <form onSubmit={handleAddUsage} className="rounded-lg border border-line bg-white/[0.03] p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                    <MessageSquareText className="h-4 w-4 text-cyan" />
                    Add AI usage and prompt
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <select value={usageEntry.employeeId} onChange={(event) => setUsageEntry((current) => ({ ...current, employeeId: event.target.value }))} className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none">
                      {employeeRows.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                    </select>
                    <select value={usageEntry.tool} onChange={(event) => setUsageEntry((current) => ({ ...current, tool: event.target.value }))} className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none">
                      {["ChatGPT", "Claude", "Gemini", "GitHub Copilot", "Cursor", "Windsurf", "Perplexity", "Internal LLM"].map((tool) => <option key={tool}>{tool}</option>)}
                    </select>
                    <input type="number" min="1" value={usageEntry.prompts} onChange={(event) => setUsageEntry((current) => ({ ...current, prompts: Number(event.target.value) }))} className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none" placeholder="Prompts" />
                    <input type="number" min="0" value={usageEntry.tokens} onChange={(event) => setUsageEntry((current) => ({ ...current, tokens: Number(event.target.value) }))} className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none" placeholder="Tokens" />
                    <input type="number" min="0" step="0.01" value={usageEntry.cost} onChange={(event) => setUsageEntry((current) => ({ ...current, cost: Number(event.target.value) }))} className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none" placeholder="Cost" />
                    <button className="flex items-center justify-center gap-2 rounded-md bg-mint px-3 py-2 text-sm font-semibold text-black"><Check className="h-4 w-4" /> Save usage</button>
                  </div>
                  <textarea required value={usageEntry.prompt} onChange={(event) => setUsageEntry((current) => ({ ...current, prompt: event.target.value }))} className="mt-3 h-20 w-full resize-none rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none" placeholder="Prompt submitted by the employee..." />
                </form>
              </div>

              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  {["All Teams", "Engineering", "Sales", "Marketing", "High Risk"].map((filter) => (
                    <button key={filter} onClick={() => setTeamFilter(filter)} className={clsx("rounded-md border border-line px-3 py-2 text-xs text-slate-300 hover:bg-white/10", teamFilter === filter ? "bg-cyan/10 text-cyan" : "bg-white/5")}>{filter}</button>
                  ))}
                </div>
                <a href={employeeExportUrl} className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-black"><Download className="h-4 w-4" /> Export CSV</a>
              </div>
              <div className="thin-scrollbar overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    <tr>{["Employee Name", "Team", "Department", "AI Tool Used", "Prompts Sent", "Tokens Consumed", "Monthly Cost", "Productivity Score", "Last Active Date", "Risk Score"].map((h) => <th key={h} className="border-b border-line px-3 py-3">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {employeeRows.map((employee) => (
                      <tr key={employee.name} className="border-b border-line/70 text-slate-300 hover:bg-white/[0.03]">
                        {[employee.name, employee.team, employee.department, employee.tool, employee.prompts, employee.tokens, employee.cost, employee.productivity, employee.lastActive].map((cell, idx) => (
                          <td key={`${employee.name}-${idx}`} className="px-3 py-4">{cell}</td>
                        ))}
                        <td className="px-3 py-4">
                          <span className={clsx("rounded-full px-2 py-1 text-xs", employee.risk > 50 ? "bg-rose/10 text-rose" : "bg-mint/10 text-mint")}>{employee.risk}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          <section id="cost-intelligence" className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionTitle icon={CircleDollarSign} eyebrow="Cost intelligence" title="Spend visibility from subscription to token" />
              <div className="grid gap-3 sm:grid-cols-2">
                {["Total Monthly Cost $136K", "API Costs $81K", "Subscription Costs $55K", "Daily Spend $4.5K", "Cost Per Employee $326", "Savings Found $31.4K"].map((item) => {
                  const [label, value] = item.replace(/ (\$|[0-9])/, "|$1").split("|");
                  return <Card key={item} className="p-4"><div className="text-sm text-slate-400">{label}</div><div className="mt-2 text-2xl font-semibold text-white">{value}</div></Card>;
                })}
              </div>
            </div>
            <ChartShell title="Department Cost Breakdown">
              <ResponsiveContainer>
                <BarChart data={departments}>
                  <CartesianGrid stroke="rgba(148,163,184,.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={formatMoney} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Cost" radius={[4, 4, 0, 0]}>
                    {departments.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartShell>
          </section>

          <section id="productivity" className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SectionTitle icon={TrendingUp} eyebrow="Productivity intelligence" title="Measure the business impact of AI usage" />
              <ChartShell title="Productivity Growth Chart">
                <ResponsiveContainer>
                  <LineChart data={monthly}>
                    <CartesianGrid stroke="rgba(148,163,184,.1)" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line dataKey="productivity" name="Productivity %" stroke="#37f5b1" strokeWidth={3} />
                    <Line dataKey="tokens" name="Token Usage" stroke="#46d5ff" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartShell>
            </div>
            <Card className="lg:mt-[68px]">
              <h3 className="font-semibold text-white">AI Impact Reports</h3>
              {["Top team: Platform Engineering", "Top user: Vikram Rao", "Most efficient department: Support", "Output quality score: 87/100"].map((item) => (
                <div key={item} className="mt-4 rounded-md border border-line bg-white/[0.03] p-3 text-sm text-slate-300">{item}</div>
              ))}
            </Card>
          </section>

          <section id="prompt-analyzer" className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <SectionTitle icon={MessageSquareText} eyebrow="Prompt intelligence" title="Analyze, optimize, and govern prompt quality" />
              <Card>
                <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="h-40 w-full resize-none rounded-md border border-line bg-black/30 p-4 text-sm text-slate-200 outline-none placeholder:text-slate-500" placeholder="Paste a prompt to analyze complexity, cost, leakage risk, and output quality..." />
                <button onClick={handlePromptAnalysis} className="mt-4 flex items-center gap-2 rounded-md bg-cyan px-4 py-2 text-sm font-semibold text-black"><WandSparkles className="h-4 w-4" /> Analyze and improve prompt</button>
              </Card>
              <Card className="mt-4">
                <h3 className="font-semibold text-white">Employee Prompt History</h3>
                <div className="mt-4 max-h-72 space-y-3 overflow-auto thin-scrollbar">
                  {promptHistory.length === 0 ? (
                    <div className="rounded-md border border-line bg-white/[0.03] p-3 text-sm text-slate-400">No employee prompts logged yet. Add usage above to populate this history.</div>
                  ) : promptHistory.map((entry) => (
                    <div key={entry.id} className="rounded-md border border-line bg-white/[0.03] p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium text-white">{entry.employeeName} via {entry.tool}</span>
                        <span className={clsx("rounded-full px-2 py-1 text-xs", entry.riskLevel === "Elevated" ? "bg-rose/10 text-rose" : "bg-mint/10 text-mint")}>{entry.riskLevel}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{entry.prompt}</p>
                      <div className="mt-2 text-xs text-slate-400">Quality {entry.quality} - {new Date(entry.createdAt).toLocaleString("en-US")}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <Card className="lg:mt-[68px]">
              <div className="grid gap-4 sm:grid-cols-3">
                {[["Quality", promptAnalysis.quality], ["Efficiency", promptAnalysis.efficiency], ["Complexity", promptAnalysis.complexity]].map(([label, score]) => (
                  <div key={label} className="rounded-lg border border-line bg-white/[0.03] p-4">
                    <div className="text-sm text-slate-400">{label}</div>
                    <div className="mt-2 text-3xl font-semibold text-white">{score}</div>
                    <div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-mint to-cyan" style={{ width: `${score}%` }} /></div>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-md border border-line bg-black/25 p-4 text-sm text-slate-300"><b className="text-white">Suggestions</b><br />{promptAnalysis.suggestions.join(" ")}</div>
                <div className="rounded-md border border-mint/30 bg-mint/10 p-4 text-sm text-slate-200"><b className="text-mint">Improved Prompt</b><br />{promptAnalysis.improvedPrompt}</div>
              </div>
            </Card>
          </section>

          <section id="security" className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div>
              <SectionTitle icon={ShieldAlert} eyebrow="Security and compliance" title="Detect leakage, violations, and sensitive AI behavior" />
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard icon={LockKeyhole} label="Security Risk Score" value="31/100" delta="-9%" />
                <MetricCard icon={AlertTriangle} label="Incident Count" value="12" delta="+3" tone="rose" />
                <MetricCard icon={KeyRound} label="API Key Leakage" value="2" delta="open" tone="amber" />
                <MetricCard icon={Check} label="Compliance Status" value="94%" delta="+4%" tone="cyan" />
              </div>
            </div>
            <Card className="lg:mt-[68px]">
              <h3 className="font-semibold text-white">Security Alerts</h3>
              <div className="mt-4 space-y-3">
                {alerts.map(([title, body, level]) => (
                  <div key={title} className="rounded-md border border-line bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-white">{title}</span>
                      <span className={clsx("rounded-full px-2 py-1 text-xs", level === "Critical" ? "bg-rose/15 text-rose" : level === "High" ? "bg-amber/15 text-amber" : "bg-cyan/15 text-cyan")}>{level}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{body}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section id="optimization">
            <SectionTitle icon={Sparkles} eyebrow="Cost optimization engine" title="Savings recommendations ranked by financial impact" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Move GPT-4 workflows to GPT-4o-mini", "$14.2K/mo", "Low quality risk"],
                ["Remove inactive Claude seats", "$6.8K/mo", "41 idle users"],
                ["Compress repetitive support prompts", "$5.1K/mo", "Token waste detected"],
                ["Route code search to internal LLM", "$5.3K/mo", "Data stays private"]
              ].map(([title, savings, detail]) => (
                <Card key={title}>
                  <div className="text-sm text-slate-400">{detail}</div>
                  <h3 className="mt-3 min-h-12 text-lg font-semibold text-white">{title}</h3>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-2xl font-semibold text-mint">{savings}</span>
                    <ArrowDownRight className="h-5 w-5 text-mint" />
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section id="agents">
            <SectionTitle icon={BrainCircuit} eyebrow="Multi-agent AI control center" title="AI workers collaborating on cost, risk, productivity, and ROI" />
            <div className="grid gap-4 lg:grid-cols-5">
              {agents.map(([name, task, health, recommendation, activity, metric], index) => (
                <Card key={name} className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-mint/10 px-2 py-1 text-xs text-mint">Active</span>
                    <span className="text-xs text-slate-500">{activity}</span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white">{name}</h3>
                  <p className="mt-2 min-h-10 text-sm text-slate-400">{task}</p>
                  <div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan to-mint" style={{ width: `${health}%` }} /></div>
                  <div className="mt-2 text-xs text-slate-400">Health score {health}%</div>
                  <div className="mt-4 rounded-md border border-line bg-black/25 p-3 text-sm text-slate-300">{recommendation}</div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><GitBranch className="h-3.5 w-3.5" /> Step {index + 1} synced: {metric}</div>
                </Card>
              ))}
            </div>
          </section>

          <section id="forecasting" className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <SectionTitle icon={Activity} eyebrow="Predictive analytics" title="Machine learning forecasts for AI spend and adoption" />
              <ChartShell title="Future Spend and Token Usage Projections">
                <ResponsiveContainer>
                  <AreaChart data={monthly}>
                    <defs>
                      <linearGradient id="tokens" x1="0" x2="0" y1="0" y2="1">
                        <stop stopColor="#46d5ff" stopOpacity={0.35} />
                        <stop offset="1" stopColor="#46d5ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148,163,184,.1)" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area dataKey="tokens" name="Tokens" stroke="#46d5ff" fill="url(#tokens)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartShell>
            </div>
            <Card className="lg:mt-[68px]">
              <h3 className="font-semibold text-white">Cost Escalation Risks</h3>
              {["Engineering token growth may exceed budget by June 18, 2026.", "Sales adoption rising faster than procurement coverage.", "Internal LLM load forecast needs GPU capacity approval."].map((risk) => (
                <div key={risk} className="mt-4 rounded-md border border-line bg-white/[0.03] p-4 text-sm text-slate-300">{risk}</div>
              ))}
            </Card>
          </section>

          <section id="benchmarking" className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <SectionTitle icon={Target} eyebrow="Tool benchmarking" title="Compare AI tools by cost, accuracy, speed, and adoption" />
              <Card>
                <ResponsiveContainer width="100%" height={290}>
                  <RadarChart data={toolUsage}>
                    <PolarGrid stroke="rgba(148,163,184,.18)" />
                    <PolarAngleAxis dataKey="tool" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                    <Radar dataKey="productivity" stroke="#37f5b1" fill="#37f5b1" fillOpacity={0.25} />
                    <Radar dataKey="accuracy" stroke="#46d5ff" fill="#46d5ff" fillOpacity={0.12} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </div>
            <ChartShell title="AI Tool Usage Comparison">
              <ResponsiveContainer>
                <BarChart data={toolUsage}>
                  <CartesianGrid stroke="rgba(148,163,184,.1)" vertical={false} />
                  <XAxis dataKey="tool" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="adoption" name="Adoption Rate" fill="#37f5b1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="productivity" name="Productivity" fill="#46d5ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartShell>
          </section>

          <section id="reports" className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <SectionTitle icon={FileText} eyebrow="Executive reporting center" title="CEO-friendly business reporting and ROI narratives" />
              <Card>
                <div className="grid gap-4 md:grid-cols-2">
                  {["Total AI Investment: $1.42M", "Total Productivity Gain: 43%", "Estimated Time Saved: 8,240 hours", "Cost of Inaction: $2.8M annual opportunity loss", "Risk Assessment: Moderate", "AI Adoption Status: Scaling", "Department Performance: Engineering leads", "Strategic Recommendation: Optimize model routing"].map((report) => (
                    <div key={report} className="rounded-md border border-line bg-white/[0.03] p-4 text-sm text-slate-300">{report}</div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href="/api/reports/executive/pdf" className="flex items-center gap-2 rounded-md border border-line bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"><Download className="h-4 w-4" /> Download PDF</a>
                  <button className="flex items-center gap-2 rounded-md border border-line bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"><Download className="h-4 w-4" /> Share Report</button>
                  <a href={employeeExportUrl} className="flex items-center gap-2 rounded-md border border-line bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"><Download className="h-4 w-4" /> Export Analytics</a>
                </div>
              </Card>
            </div>
            <ChartShell title="Department Cost Pie Chart">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={departments} innerRadius={62} outerRadius={100} dataKey="value" nameKey="name" paddingAngle={3}>
                    {departments.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartShell>
          </section>

          <section id="integrations" className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div>
              <SectionTitle icon={PlugZap} eyebrow="Settings and integrations" title="Connect every AI tool, workflow, and business system" />
              <div className="grid gap-3 sm:grid-cols-2">
                {integrations.map((integration) => (
                  <Card key={integration.name} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-md bg-white/8 text-cyan"><PlugZap className="h-4 w-4" /></div>
                      <div>
                        <span className="font-medium text-white">{integration.name}</span>
                        <div className="text-xs text-slate-400">Last sync: {integration.lastSync}</div>
                      </div>
                    </div>
                    <button onClick={() => toggleIntegration(integration)} className={clsx("rounded-full px-2 py-1 text-xs", integration.status === "Connected" ? "bg-mint/10 text-mint" : "bg-white/5 text-slate-400")}>{integration.status}</button>
                  </Card>
                ))}
              </div>
            </div>
            <Card className="lg:mt-[68px]">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-cyan" />
                <h3 className="font-semibold text-white">Role and policy controls</h3>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {["Admin", "Manager", "Employee", "Executive"].map((role) => (
                  <div key={role} className="rounded-md border border-line bg-white/[0.03] p-4">
                    <div className="font-medium text-white">{role}</div>
                    <div className="mt-2 text-sm text-slate-400">Budget, data, prompt, and report permissions configured.</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-lg border border-cyan/25 bg-cyan/10 p-4 text-sm text-slate-200">
                Notification rules are active for budget thresholds, abnormal spending, security incidents, productivity drops, and subscription renewals.
              </div>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
