"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
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
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BrainCircuit,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  GitBranch,
  KeyRound,
  LockKeyhole,
  LogOut,
  Menu,
  MessageSquareText,
  PieChart as PieIcon,
  Plus,
  PlugZap,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  Star,
  Target,
  Timer,
  TrendingUp,
  User,
  Users,
  WandSparkles,
  X,
  Zap
} from "lucide-react";
import { clsx } from "clsx";
import type { Employee, Integration } from "@/lib/platform-data";

type DateRange = "7d" | "30d" | "90d" | "all";

type Notification = {
  id: string;
  title: string;
  body: string;
  severity: string;
  channel: string;
  read_at: string | null;
  created_at: string;
};

type BenchmarkRow = {
  provider: string;
  model_name: string;
  cost_per_1k_tokens: number;
  speed_score: number;
  quality_score: number;
  productivity_score: number;
  adoption_score: number;
  recommendation: string;
};

type AuditLogRow = {
  id: string;
  actor_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  associated_cost: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

type BudgetAlert = {
  department: string;
  spent: number;
  budget: number;
  percentage: number;
  level: "warning" | "critical";
};

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

type DashboardPayload = {
  metrics: {
    totalAiSpend: number;
    activeUsers: number;
    monthlyCost: number;
    tokenConsumption: number;
    adoptionRate: number;
    roiScore: number;
    nextMonthForecast: number;
    productivityImprovement: number;
    timeSavedHours: number;
    securityRiskScore?: number;
    incidentCount?: number;
  };
  monthly?: typeof monthly;
  departments?: typeof departments;
  toolUsage?: typeof toolUsage;
  integrations?: Integration[];
};

function formatMoney(value: number) {
  return `$${Math.round(value / 1000)}K`;
}

function formatLarge(value: number) {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return String(value);
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
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role ?? "Admin";

  // Core state
  const [employeeRows, setEmployeeRows] = useState<Employee[]>(initialEmployees);
  const [dashboard, setDashboard] = useState<DashboardPayload & { budgetAlerts?: BudgetAlert[] }>({
    metrics: {
      totalAiSpend: 1420000,
      activeUsers: 417,
      monthlyCost: 136000,
      tokenConsumption: 1810000000,
      adoptionRate: 72,
      roiScore: 4.7,
      nextMonthForecast: 142000,
      productivityImprovement: 43,
      timeSavedHours: 8240,
      securityRiskScore: 31,
      incidentCount: 12
    }
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [newEmployee, setNewEmployee] = useState({ name: "", email: "", team: "", department: "", tool: "ChatGPT" });
  const [usageEntry, setUsageEntry] = useState({ employeeId: "emp-aarav", tool: "ChatGPT", modelName: "GPT-4o", prompts: 1, tokens: 25000, cost: 4.5, prompt: "" });
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
  const [analyzingPrompt, setAnalyzingPrompt] = useState(false);

  // New feature state
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeePrompts, setEmployeePrompts] = useState<PromptLog[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const employeeExportUrl = useMemo(
    () => `/api/employees/export?q=${encodeURIComponent(searchQuery)}&team=${encodeURIComponent(teamFilter)}`,
    [searchQuery, teamFilter]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/employees?q=${encodeURIComponent(searchQuery)}&team=${encodeURIComponent(teamFilter)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { employees: Employee[] }) => { setEmployeeRows(data.employees); setBackendStatus("Synced"); })
      .catch((e) => { if (e.name !== "AbortError") setBackendStatus("Offline cache"); });
    return () => controller.abort();
  }, [searchQuery, teamFilter]);

  useEffect(() => {
    fetch("/api/prompts").then((r) => r.json()).then((d: { prompts: PromptLog[] }) => setPromptHistory(d.prompts)).catch(() => setPromptHistory([]));
  }, []);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data: DashboardPayload & { budgetAlerts?: BudgetAlert[] }) => {
        setDashboard(data);
        if (data.integrations) setIntegrations(data.integrations);
        setBackendStatus("Synced");
      })
      .catch(() => setBackendStatus("Offline cache"));
  }, [dateRange]);

  // Load notifications
  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d: { notifications: Notification[] }) => {
        setNotifications(d.notifications);
        setUnreadCount(d.notifications.filter((n) => !n.read_at).length);
      })
      .catch(() => {});
  }, []);

  // Load benchmarks
  useEffect(() => {
    fetch("/api/benchmarks").then((r) => r.json()).then((d: { benchmarks: BenchmarkRow[] }) => setBenchmarks(d.benchmarks)).catch(() => {});
  }, []);

  // Load audit logs
  useEffect(() => {
    fetch("/api/audit-logs").then((r) => r.json()).then((d: { logs: AuditLogRow[] }) => setAuditLogs(d.logs ?? [])).catch(() => {});
  }, []);

  async function handlePromptAnalysis() {
    setAnalyzingPrompt(true);
    const response = await fetch("/api/prompts/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    if (response.ok) {
      const result = await response.json();
      setPromptAnalysis(result);
      setBackendStatus(result.usedAI ? "AI Analysis" : "Rule Analysis");
    }
    setAnalyzingPrompt(false);
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
      setNewEmployee({ name: "", email: "", team: "", department: "", tool: "ChatGPT" });
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
      fetch("/api/dashboard").then((r) => r.json()).then((p: DashboardPayload) => setDashboard(p));
      const prompts = await fetch("/api/prompts").then((i) => i.json()) as { prompts: PromptLog[] };
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

  const NAV_ITEMS: [string, typeof Gauge][] = [
    ["Executive", Gauge], ["Employees", Users], ["Cost Intelligence", CircleDollarSign],
    ["Productivity", TrendingUp], ["Prompt Analyzer", MessageSquareText], ["Security", ShieldAlert],
    ["Optimization", Sparkles], ["Agents", BrainCircuit], ["Forecasting", Activity],
    ["Benchmarking", Target], ["Reports", FileText], ["Integrations", PlugZap],
    ["Audit Logs", ClipboardList]
  ];

  return (
    <main className="relative min-h-screen">
      {/* ── Employee Detail Modal ── */}
      <AnimatePresence>
        {selectedEmployee && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
            onClick={() => setSelectedEmployee(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-6 thin-scrollbar"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-cyan/15 text-2xl font-bold text-cyan">
                    {selectedEmployee.name[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{selectedEmployee.name}</h2>
                    <p className="text-sm text-slate-400">{selectedEmployee.team} · {selectedEmployee.department}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEmployee(null)} className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Prompts", value: String(selectedEmployee.prompts), color: "text-cyan" },
                  { label: "Tokens", value: selectedEmployee.tokens, color: "text-mint" },
                  { label: "Cost", value: selectedEmployee.cost, color: "text-amber" },
                  { label: "Productivity", value: `${selectedEmployee.productivity}%`, color: "text-white" }
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-lg border border-line bg-white/[0.03] p-3 text-center">
                    <div className={`text-xl font-semibold ${color}`}>{value}</div>
                    <div className="mt-1 text-xs text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-md border border-line bg-white/[0.03] p-3">
                  <div className="text-xs text-slate-400">AI Tool</div>
                  <div className="mt-1 font-medium text-white">{selectedEmployee.tool}</div>
                </div>
                <div className="rounded-md border border-line bg-white/[0.03] p-3">
                  <div className="text-xs text-slate-400">Risk Score</div>
                  <div className={clsx("mt-1 font-semibold", selectedEmployee.risk > 50 ? "text-rose" : "text-mint")}>{selectedEmployee.risk}/100</div>
                </div>
              </div>
              <div className="mt-5">
                <h3 className="mb-3 text-sm font-semibold text-white">Prompt History</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto thin-scrollbar">
                  {promptHistory.filter(p => p.employeeName === selectedEmployee.name).length === 0 ? (
                    <div className="rounded-md border border-line bg-white/[0.03] p-3 text-sm text-slate-400">No prompts logged for this employee yet.</div>
                  ) : promptHistory.filter(p => p.employeeName === selectedEmployee.name).map((entry) => (
                    <div key={entry.id} className="rounded-md border border-line bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString("en-US")}</span>
                        <span className={clsx("rounded-full px-2 py-0.5 text-xs", entry.riskLevel === "Elevated" ? "bg-rose/10 text-rose" : "bg-mint/10 text-mint")}>{entry.riskLevel}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-300 line-clamp-2">{entry.prompt}</p>
                      <div className="mt-1 text-xs text-slate-500">Quality: {entry.quality}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Nav Drawer ── */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 xl:hidden" onClick={() => setMobileNavOpen(false)} />
            <motion.aside initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }} transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 h-screen w-72 border-r border-line bg-black/90 p-5 backdrop-blur-xl xl:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-mint/15 text-mint"><BrainCircuit className="h-6 w-6" /></div>
                  <div>
                    <div className="text-sm font-semibold text-white">AI Spend Intelligence</div>
                    <div className="text-xs text-slate-400">Enterprise command center</div>
                  </div>
                </div>
                <button onClick={() => setMobileNavOpen(false)} className="rounded-md p-1.5 text-slate-400 hover:bg-white/10"><X className="h-5 w-5" /></button>
              </div>
              <nav className="mt-8 space-y-1">
                {NAV_ITEMS.map(([item, Icon]) => (
                  <a key={item} href={`#${String(item).toLowerCase().replaceAll(" ", "-")}`}
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white">
                    <Icon className="h-4 w-4" />{item}
                  </a>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop Sidebar ── */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 border-r border-line bg-black/30 p-5 backdrop-blur-xl xl:flex xl:flex-col">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-mint/15 text-mint"><BrainCircuit className="h-6 w-6" /></div>
          <div>
            <div className="text-sm font-semibold text-white">AI Spend Intelligence</div>
            <div className="text-xs text-slate-400">Enterprise command center</div>
          </div>
        </div>
        <nav className="mt-8 flex-1 space-y-1 overflow-y-auto thin-scrollbar">
          {NAV_ITEMS.map(([item, Icon]) => (
            <a key={item} href={`#${String(item).toLowerCase().replaceAll(" ", "-")}`}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white">
              <Icon className="h-4 w-4" />{item}
            </a>
          ))}
        </nav>
        {/* Sidebar user info */}
        {session?.user && (
          <div className="mt-4 rounded-lg border border-line bg-white/[0.03] p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-cyan/15 text-sm font-bold text-cyan">
                {session.user.name?.[0] ?? "U"}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-white">{session.user.name}</div>
                <div className="text-xs text-slate-400">{userRole}</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      <div className="xl:pl-72">
        {/* ── Header ── */}
        <header className="sticky top-0 z-20 border-b border-line bg-[#06070b]/78 px-4 py-3 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button onClick={() => setMobileNavOpen(true)} className="grid h-9 w-9 place-items-center rounded-md border border-line bg-white/5 text-slate-300 xl:hidden">
              <Menu className="h-4 w-4" />
            </button>

            {/* Search */}
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-line bg-white/5 px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                placeholder="Search employees, tools, departments..." />
            </div>

            {/* Date range filter */}
            <div className="hidden items-center gap-1 rounded-lg border border-line bg-white/5 p-1 md:flex">
              {(["7d", "30d", "90d", "all"] as DateRange[]).map((r) => (
                <button key={r} onClick={() => setDateRange(r)}
                  className={clsx("rounded-md px-2.5 py-1 text-xs font-medium transition", dateRange === r ? "bg-cyan text-black" : "text-slate-400 hover:text-white")}>
                  {r === "all" ? "All" : r}
                </button>
              ))}
            </div>

            {/* Backend status */}
            <span className="hidden rounded-md bg-mint/10 px-3 py-1.5 text-xs font-semibold text-mint md:block">{backendStatus}</span>

            {/* Notification bell */}
            <div ref={notifRef} className="relative">
              <button onClick={() => setNotifOpen((o) => !o)}
                className="relative grid h-9 w-9 place-items-center rounded-md border border-line bg-white/5 text-slate-300 hover:bg-white/10">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-rose text-[9px] font-bold text-white">{unreadCount}</span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-line bg-black/90 shadow-card backdrop-blur-xl">
                    <div className="flex items-center justify-between border-b border-line px-4 py-3">
                      <span className="text-sm font-semibold text-white">Notifications</span>
                      <span className="rounded-full bg-rose/10 px-2 py-0.5 text-xs text-rose">{unreadCount} unread</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto thin-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-slate-400">No notifications</div>
                      ) : notifications.map((n) => (
                        <div key={n.id} className={clsx("border-b border-line px-4 py-3 last:border-0", !n.read_at && "bg-white/[0.02]")}>
                          <div className="flex items-start gap-2">
                            <span className={clsx("mt-1 h-2 w-2 shrink-0 rounded-full", n.severity === "Critical" ? "bg-rose" : n.severity === "High" ? "bg-amber" : "bg-cyan")} />
                            <div>
                              <div className="text-sm font-medium text-white">{n.title}</div>
                              <div className="mt-0.5 text-xs text-slate-400">{n.body}</div>
                              <div className="mt-1 text-xs text-slate-500">{new Date(n.created_at).toLocaleString("en-US")}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-line px-4 py-2">
                      <button className="w-full text-center text-xs text-slate-400 hover:text-white" onClick={() => { setUnreadCount(0); setNotifOpen(false); }}>
                        Mark all as read
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User menu */}
            <div ref={userMenuRef} className="relative">
              <button onClick={() => setUserMenuOpen((o) => !o)}
                className="grid h-9 w-9 place-items-center rounded-full border border-line bg-cyan/15 text-sm font-bold text-cyan hover:bg-cyan/25">
                {session?.user?.name?.[0] ?? <User className="h-4 w-4" />}
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 top-12 z-50 w-52 rounded-xl border border-line bg-black/90 shadow-card backdrop-blur-xl">
                    <div className="border-b border-line px-4 py-3">
                      <div className="text-sm font-medium text-white">{session?.user?.name ?? "User"}</div>
                      <div className="text-xs text-slate-400">{userRole}</div>
                    </div>
                    <a href="/settings/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                      <User className="h-4 w-4" /> Profile Settings
                    </a>
                    <a href="/settings/organization" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                      <Building2 className="h-4 w-4" /> Organization
                    </a>
                    <div className="border-t border-line">
                      <button onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rose hover:bg-rose/5">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1560px] space-y-10 px-4 py-6 md:px-8">

          {/* ── Budget Alert Banners ── */}
          {dashboard.budgetAlerts && dashboard.budgetAlerts.length > 0 && (
            <div className="space-y-2">
              {dashboard.budgetAlerts.map((alert) => (
                <motion.div key={alert.department} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className={clsx("flex items-center gap-3 rounded-lg border px-4 py-3 text-sm",
                    alert.level === "critical" ? "border-rose/30 bg-rose/10 text-rose" : "border-amber/30 bg-amber/10 text-amber")}>
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span><b>{alert.department}</b> has used <b>{alert.percentage.toFixed(0)}%</b> of its ${alert.budget.toLocaleString()} monthly AI budget — ${alert.spent.toLocaleString()} spent.</span>
                  <span className={clsx("ml-auto rounded-full px-2 py-0.5 text-xs font-semibold uppercase", alert.level === "critical" ? "bg-rose/20" : "bg-amber/20")}>{alert.level}</span>
                </motion.div>
              ))}
            </div>
          )}

          <section id="executive" className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass overflow-hidden rounded-lg p-6 md:p-8">
              <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/10 px-3 py-1 text-xs font-semibold text-mint">
                    <Zap className="h-3.5 w-3.5" /> Real-time AI governance cockpit
                  </div>
                  <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.02em] text-white md:text-6xl">AI Spend Intelligence Platform</h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                    Monitor AI subscriptions, API usage, employee adoption, security exposure, productivity lift, and executive ROI.
                  </p>
                </div>
                <div className="rounded-lg border border-line bg-black/25 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">ROI score</div>
                  <div className="mt-2 text-5xl font-semibold text-mint">{dashboard.metrics.roiScore}x</div>
                  <div className="mt-2 flex items-center gap-1 text-sm text-mint"><ArrowUpRight className="h-4 w-4" /> 18% this month</div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard icon={CircleDollarSign} label="Total AI Spend" value={formatMoney(dashboard.metrics.totalAiSpend)} delta="+14.2%" />
                <MetricCard icon={Users} label="Active Users" value={String(dashboard.metrics.activeUsers)} delta="+21" tone="cyan" />
                <MetricCard icon={Activity} label="Token Consumption" value={formatLarge(dashboard.metrics.tokenConsumption)} delta="+9.4%" tone="amber" />
                <MetricCard icon={Timer} label="Time Saved" value={`${dashboard.metrics.timeSavedHours.toLocaleString("en-US")}h`} delta="+31%" />
                <MetricCard icon={Building2} label="Monthly Cost" value={formatMoney(dashboard.metrics.monthlyCost)} delta="+12.4%" tone="rose" />
                <MetricCard icon={Target} label="AI Adoption Rate" value={`${dashboard.metrics.adoptionRate}%`} delta="+8%" tone="cyan" />
                <MetricCard icon={TrendingUp} label="Next Month Forecast" value={formatMoney(dashboard.metrics.nextMonthForecast)} delta="+4.4%" tone="amber" />
                <MetricCard icon={Gauge} label="Security Risk Score" value={`${dashboard.metrics.securityRiskScore ?? 31}/100`} delta={`${dashboard.metrics.incidentCount ?? 12} incidents`} />
              </div>
            </motion.div>

            <Card>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Executive Briefing</h3>
                <span className="rounded-full bg-mint/10 px-2 py-1 text-xs text-mint">Board ready</span>
              </div>
              <div className="mt-6 space-y-4">
                {["$31.4K potential monthly savings identified", "3 security incidents require review", "Engineering delivers highest AI productivity ROI", "Copilot and Cursor outperform generic chat for devs"].map((item) => (
                  <div key={item} className="flex gap-3 rounded-md border border-line bg-white/[0.03] p-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                    <span className="text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg border border-line bg-black/25 p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-slate-400">Budget utilization</span><span className="text-white">84%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10"><div className="h-full w-[84%] rounded-full bg-gradient-to-r from-mint to-cyan" /></div>
              </div>
            </Card>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <ChartShell title="Monthly Cost Trend">
              <ResponsiveContainer>
                <AreaChart data={dashboard.monthly ?? monthly}>
                  <defs><linearGradient id="cost" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#37f5b1" stopOpacity={0.38} /><stop offset="1" stopColor="#37f5b1" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid stroke="rgba(148,163,184,.1)" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" /><YAxis stroke="#94a3b8" tickFormatter={formatMoney} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area dataKey="cost" name="Cost" stroke="#37f5b1" fill="url(#cost)" strokeWidth={2} />
                  <Line dataKey="forecast" name="Forecast" stroke="#46d5ff" strokeDasharray="5 5" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartShell>
            <ChartShell title="Cost vs Productivity">
              <ResponsiveContainer>
                <ComposedChart data={dashboard.monthly ?? monthly}>
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
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><Plus className="h-4 w-4 text-cyan" /> Add employee</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input required value={newEmployee.name} onChange={(e) => setNewEmployee((c) => ({ ...c, name: e.target.value }))} className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none" placeholder="Employee name" />
                    <input required type="email" value={newEmployee.email} onChange={(e) => setNewEmployee((c) => ({ ...c, email: e.target.value }))} className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none" placeholder="Work email" />
                    <input required value={newEmployee.team} onChange={(e) => setNewEmployee((c) => ({ ...c, team: e.target.value }))} className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none" placeholder="Team" />
                    <input required value={newEmployee.department} onChange={(e) => setNewEmployee((c) => ({ ...c, department: e.target.value }))} className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none" placeholder="Department" />
                    <select value={newEmployee.tool} onChange={(e) => setNewEmployee((c) => ({ ...c, tool: e.target.value }))} className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none">
                      {["ChatGPT", "Claude", "Gemini", "GitHub Copilot", "Cursor", "Windsurf", "Perplexity", "Internal LLM"].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <button className="mt-3 flex items-center gap-2 rounded-md bg-cyan px-3 py-2 text-sm font-semibold text-black"><Plus className="h-4 w-4" /> Add employee</button>
                </form>
                <form onSubmit={handleAddUsage} className="rounded-lg border border-line bg-white/[0.03] p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><MessageSquareText className="h-4 w-4 text-cyan" /> Log AI usage</div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <select value={usageEntry.employeeId} onChange={(e) => setUsageEntry((c) => ({ ...c, employeeId: e.target.value }))} className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none">
                      {employeeRows.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                    <select value={usageEntry.tool} onChange={(e) => setUsageEntry((c) => ({ ...c, tool: e.target.value }))} className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none">
                      {["ChatGPT", "Claude", "Gemini", "GitHub Copilot", "Cursor", "Windsurf", "Perplexity", "Internal LLM"].map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <input value={usageEntry.modelName} onChange={(e) => setUsageEntry((c) => ({ ...c, modelName: e.target.value }))} className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none" placeholder="Model name" />
                    <input type="number" min="1" value={usageEntry.prompts} onChange={(e) => setUsageEntry((c) => ({ ...c, prompts: Number(e.target.value) }))} className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none" placeholder="Prompts" />
                    <input type="number" min="0" value={usageEntry.tokens} onChange={(e) => setUsageEntry((c) => ({ ...c, tokens: Number(e.target.value) }))} className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none" placeholder="Tokens" />
                    <input type="number" min="0" step="0.01" value={usageEntry.cost} onChange={(e) => setUsageEntry((c) => ({ ...c, cost: Number(e.target.value) }))} className="rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none" placeholder="Cost $" />
                    <button className="flex items-center justify-center gap-2 rounded-md bg-mint px-3 py-2 text-sm font-semibold text-black"><Check className="h-4 w-4" /> Save usage</button>
                  </div>
                  <textarea required value={usageEntry.prompt} onChange={(e) => setUsageEntry((c) => ({ ...c, prompt: e.target.value }))} className="mt-3 h-20 w-full resize-none rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none" placeholder="Prompt submitted by the employee..." />
                </form>
              </div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {["All Teams", "Engineering", "Sales", "Marketing", "High Risk"].map((f) => (
                    <button key={f} onClick={() => setTeamFilter(f)} className={clsx("rounded-md border border-line px-3 py-2 text-xs text-slate-300 hover:bg-white/10", teamFilter === f ? "bg-cyan/10 text-cyan" : "bg-white/5")}>{f}</button>
                  ))}
                </div>
                <a href={employeeExportUrl} className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-black"><Download className="h-4 w-4" /> Export CSV</a>
              </div>
              <div className="thin-scrollbar overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    <tr>{["Employee Name", "Team", "Department", "AI Tool", "Prompts", "Tokens", "Cost", "Productivity", "Last Active", "Risk"].map((h) => <th key={h} className="border-b border-line px-3 py-3">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {employeeRows.map((emp) => (
                      <tr key={emp.id} className="cursor-pointer border-b border-line/70 text-slate-300 hover:bg-white/[0.03]" onClick={() => setSelectedEmployee(emp)}>
                        <td className="px-3 py-4 font-medium text-white">{emp.name}</td>
                        <td className="px-3 py-4">{emp.team}</td>
                        <td className="px-3 py-4">{emp.department}</td>
                        <td className="px-3 py-4">{emp.tool}</td>
                        <td className="px-3 py-4">{emp.prompts}</td>
                        <td className="px-3 py-4">{emp.tokens}</td>
                        <td className="px-3 py-4">{emp.cost}</td>
                        <td className="px-3 py-4">{emp.productivity}%</td>
                        <td className="px-3 py-4">{emp.lastActive}</td>
                        <td className="px-3 py-4"><span className={clsx("rounded-full px-2 py-1 text-xs", emp.risk > 50 ? "bg-rose/10 text-rose" : "bg-mint/10 text-mint")}>{emp.risk}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-slate-500">Click any row to view employee details and prompt history.</p>
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
                <BarChart data={dashboard.departments ?? departments}>
                  <CartesianGrid stroke="rgba(148,163,184,.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" /><YAxis stroke="#94a3b8" tickFormatter={formatMoney} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Cost" radius={[4, 4, 0, 0]}>
                    {(dashboard.departments ?? departments).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
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
                  <LineChart data={dashboard.monthly ?? monthly}>
                    <CartesianGrid stroke="rgba(148,163,184,.1)" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" /><YAxis stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line dataKey="productivity" name="Productivity %" stroke="#37f5b1" strokeWidth={3} />
                    <Line dataKey="tokens" name="Token Usage" stroke="#46d5ff" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartShell>
            </div>
            <Card className="lg:mt-[68px]">
              <h3 className="font-semibold text-white">AI Impact Reports</h3>
              {["Top team: Platform Engineering", "Top user: Vikram Rao", "Most efficient dept: Support", "Output quality score: 87/100"].map((item) => (
                <div key={item} className="mt-4 rounded-md border border-line bg-white/[0.03] p-3 text-sm text-slate-300">{item}</div>
              ))}
            </Card>
          </section>

          <section id="prompt-analyzer" className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <SectionTitle icon={MessageSquareText} eyebrow="Prompt intelligence" title="Analyze, optimize, and govern prompt quality" />
              <Card>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Paste a prompt to analyze it</span>
                  {(promptAnalysis as { usedAI?: boolean }).usedAI && (
                    <span className="flex items-center gap-1 rounded-full bg-mint/10 px-2 py-0.5 text-xs text-mint"><Star className="h-3 w-3" /> AI-powered</span>
                  )}
                </div>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                  className="h-40 w-full resize-none rounded-md border border-line bg-black/30 p-4 text-sm text-slate-200 outline-none placeholder:text-slate-500"
                  placeholder="Paste a prompt to analyze complexity, cost, leakage risk, and output quality..." />
                <button onClick={handlePromptAnalysis} disabled={analyzingPrompt}
                  className="mt-4 flex items-center gap-2 rounded-md bg-cyan px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
                  <WandSparkles className="h-4 w-4" />
                  {analyzingPrompt ? "Analyzing..." : "Analyze and improve prompt"}
                </button>
              </Card>
              <Card className="mt-4">
                <h3 className="font-semibold text-white">Employee Prompt History</h3>
                <div className="mt-4 max-h-72 space-y-3 overflow-auto thin-scrollbar">
                  {promptHistory.length === 0 ? (
                    <div className="rounded-md border border-line bg-white/[0.03] p-3 text-sm text-slate-400">No prompts logged yet. Add usage above to populate history.</div>
                  ) : promptHistory.map((entry) => (
                    <div key={entry.id} className="rounded-md border border-line bg-white/[0.03] p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium text-white">{entry.employeeName} via {entry.tool}</span>
                        <span className={clsx("rounded-full px-2 py-1 text-xs", entry.riskLevel === "Elevated" ? "bg-rose/10 text-rose" : "bg-mint/10 text-mint")}>{entry.riskLevel}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{entry.prompt}</p>
                      <div className="mt-2 text-xs text-slate-400">Quality {entry.quality} — {new Date(entry.createdAt).toLocaleString("en-US")}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <Card className="lg:mt-[68px]">
              <div className="grid gap-4 sm:grid-cols-3">
                {[["Quality", promptAnalysis.quality], ["Efficiency", promptAnalysis.efficiency], ["Complexity", promptAnalysis.complexity]].map(([label, score]) => (
                  <div key={label as string} className="rounded-lg border border-line bg-white/[0.03] p-4">
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
              <div className="mt-4 rounded-md border border-line bg-white/[0.02] p-3">
                <div className="mb-1 text-xs text-slate-400">Risk level</div>
                <span className={clsx("rounded-full px-3 py-1 text-sm font-semibold", promptAnalysis.riskLevel === "Elevated" ? "bg-rose/15 text-rose" : "bg-mint/15 text-mint")}>{promptAnalysis.riskLevel}</span>
              </div>
            </Card>
          </section>

          <section id="security" className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div>
              <SectionTitle icon={ShieldAlert} eyebrow="Security and compliance" title="Detect leakage, violations, and sensitive AI behavior" />
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard icon={LockKeyhole} label="Security Risk Score" value={`${dashboard.metrics.securityRiskScore ?? 31}/100`} delta="-9%" />
                <MetricCard icon={AlertTriangle} label="Incident Count" value={String(dashboard.metrics.incidentCount ?? 12)} delta="+3" tone="rose" />
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
              {[["Move GPT-4 workflows to GPT-4o-mini", "$14.2K/mo", "Low quality risk"], ["Remove inactive Claude seats", "$6.8K/mo", "41 idle users"], ["Compress repetitive support prompts", "$5.1K/mo", "Token waste detected"], ["Route code search to internal LLM", "$5.3K/mo", "Data stays private"]].map(([title, savings, detail]) => (
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
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><GitBranch className="h-3.5 w-3.5" /> Step {index + 1}: {metric}</div>
                </Card>
              ))}
            </div>
          </section>

          <section id="forecasting" className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <SectionTitle icon={Activity} eyebrow="Predictive analytics" title="Machine learning forecasts for AI spend and adoption" />
              <ChartShell title="Future Spend and Token Usage Projections">
                <ResponsiveContainer>
                  <AreaChart data={dashboard.monthly ?? monthly}>
                    <defs><linearGradient id="tokens" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#46d5ff" stopOpacity={0.35} /><stop offset="1" stopColor="#46d5ff" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid stroke="rgba(148,163,184,.1)" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" /><YAxis stroke="#94a3b8" />
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

          {/* ── Benchmarking — Now with live API data ── */}
          <section id="benchmarking">
            <SectionTitle icon={Target} eyebrow="Tool benchmarking" title="Compare AI tools by cost, accuracy, speed, and productivity" />
            <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
              <Card>
                <ResponsiveContainer width="100%" height={290}>
                  <RadarChart data={dashboard.toolUsage ?? toolUsage}>
                    <PolarGrid stroke="rgba(148,163,184,.18)" />
                    <PolarAngleAxis dataKey="tool" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                    <Radar dataKey="productivity" stroke="#37f5b1" fill="#37f5b1" fillOpacity={0.25} />
                    <Radar dataKey="accuracy" stroke="#46d5ff" fill="#46d5ff" fillOpacity={0.12} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <h3 className="mb-4 text-sm font-semibold text-white">Model Benchmark Comparison</h3>
                <div className="thin-scrollbar overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        {["Provider", "Model", "Cost/1K", "Speed", "Quality", "Productivity", "Recommendation"].map((h) => (
                          <th key={h} className="border-b border-line px-3 py-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {benchmarks.map((b) => (
                        <tr key={`${b.provider}-${b.model_name}`} className="border-b border-line/60 text-slate-300 hover:bg-white/[0.02]">
                          <td className="px-3 py-3 font-medium text-white">{b.provider}</td>
                          <td className="px-3 py-3">{b.model_name}</td>
                          <td className="px-3 py-3 text-amber">${b.cost_per_1k_tokens.toFixed(4)}</td>
                          <td className="px-3 py-3"><div className="flex items-center gap-2"><div className="h-1.5 w-16 rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan" style={{ width: `${b.speed_score}%` }} /></div><span>{b.speed_score}</span></div></td>
                          <td className="px-3 py-3"><div className="flex items-center gap-2"><div className="h-1.5 w-16 rounded-full bg-white/10"><div className="h-full rounded-full bg-mint" style={{ width: `${b.quality_score}%` }} /></div><span>{b.quality_score}</span></div></td>
                          <td className="px-3 py-3"><span className={clsx("rounded-full px-2 py-0.5 text-xs", b.productivity_score >= 90 ? "bg-mint/15 text-mint" : b.productivity_score >= 80 ? "bg-cyan/15 text-cyan" : "bg-white/10 text-slate-300")}>{b.productivity_score}</span></td>
                          <td className="px-3 py-3 max-w-[200px] text-slate-400">{b.recommendation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </section>

          <section id="reports" className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <SectionTitle icon={FileText} eyebrow="Executive reporting center" title="CEO-friendly business reporting and ROI narratives" />
              <Card>
                <div className="grid gap-4 md:grid-cols-2">
                  {["Total AI Investment: $1.42M", "Total Productivity Gain: 43%", "Estimated Time Saved: 8,240 hours", "Cost of Inaction: $2.8M annual opportunity loss", "Risk Assessment: Moderate", "AI Adoption Status: Scaling", "Dept Performance: Engineering leads", "Strategic Rec: Optimize model routing"].map((report) => (
                    <div key={report} className="rounded-md border border-line bg-white/[0.03] p-4 text-sm text-slate-300">{report}</div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href="/api/reports/executive/pdf" className="flex items-center gap-2 rounded-md border border-line bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"><Download className="h-4 w-4" /> Download PDF</a>
                  <a href={employeeExportUrl} className="flex items-center gap-2 rounded-md border border-line bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"><Download className="h-4 w-4" /> Export CSV</a>
                </div>
              </Card>
            </div>
            <ChartShell title="Department Cost Pie Chart">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={dashboard.departments ?? departments} innerRadius={62} outerRadius={100} dataKey="value" nameKey="name" paddingAngle={3}>
                    {(dashboard.departments ?? departments).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
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
                <h3 className="font-semibold text-white">Role & Policy Controls</h3>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[["Admin", "Full platform access"], ["Manager", "Dept-scoped analytics"], ["Employee", "Personal usage only"], ["CEO", "Company-wide ROI & reports"]].map(([role, desc]) => (
                  <div key={role} className={clsx("rounded-md border border-line bg-white/[0.03] p-4", userRole === role && "border-cyan/30 bg-cyan/5")}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-white">{role}</div>
                      {userRole === role && <span className="rounded-full bg-cyan/15 px-2 py-0.5 text-xs text-cyan">You</span>}
                    </div>
                    <div className="mt-1 text-sm text-slate-400">{desc}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <a href="/settings/organization" className="flex items-center gap-2 rounded-md bg-cyan px-3 py-2 text-sm font-semibold text-black"><Settings className="h-4 w-4" /> Organization Settings</a>
                <a href="/settings/profile" className="flex items-center gap-2 rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"><User className="h-4 w-4" /> Profile</a>
              </div>
            </Card>
          </section>

          {/* ── Audit Logs ── */}
          <section id="audit-logs">
            <SectionTitle icon={ClipboardList} eyebrow="Compliance & audit trail" title="Every action logged for security and compliance review" />
            <Card>
              {auditLogs.length === 0 ? (
                <div className="rounded-md border border-line bg-white/[0.03] p-6 text-center">
                  <ClipboardList className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-3 text-sm text-slate-400">Audit logs appear here when the database is connected and actions are performed (employee creation, usage logging, etc.).</p>
                </div>
              ) : (
                <div className="thin-scrollbar overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-wider text-slate-500">
                      <tr>{["Action", "Entity Type", "Entity ID", "Cost", "Time"].map((h) => <th key={h} className="border-b border-line px-3 py-2">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {auditLogs.slice(0, 50).map((log) => (
                        <tr key={log.id} className="border-b border-line/60 text-slate-300 hover:bg-white/[0.02]">
                          <td className="px-3 py-3 font-medium text-white">{log.action}</td>
                          <td className="px-3 py-3">{log.entity_type}</td>
                          <td className="px-3 py-3 text-slate-500 text-xs">{log.entity_id ?? "—"}</td>
                          <td className="px-3 py-3">{log.associated_cost != null ? `$${log.associated_cost.toFixed(2)}` : "—"}</td>
                          <td className="px-3 py-3 text-slate-400">{new Date(log.created_at).toLocaleString("en-US")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </section>

        </div>
      </div>
    </main>
  );
}

