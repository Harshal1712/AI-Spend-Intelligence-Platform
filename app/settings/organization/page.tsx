"use client";

import { useState } from "react";
import { Building2, PlugZap, Bell, ArrowLeft, Save, Webhook, Check, RefreshCw } from "lucide-react";
import { clsx } from "clsx";

const INTEGRATIONS = [
  { name: "OpenAI", description: "GPT-4o, GPT-4o-mini API tracking", category: "AI" },
  { name: "Claude", description: "Anthropic Claude API usage", category: "AI" },
  { name: "Gemini", description: "Google AI Gemini API tracking", category: "AI" },
  { name: "GitHub", description: "GitHub Copilot seat and usage data", category: "Dev" },
  { name: "GitLab", description: "GitLab Duo AI features", category: "Dev" },
  { name: "Slack", description: "Budget and security alert webhooks", category: "Comms" },
  { name: "Microsoft Teams", description: "Alert notifications via Teams", category: "Comms" },
  { name: "Jira", description: "Project and sprint AI usage", category: "PM" }
];

type Integration = { name: string; status: "Connected" | "Ready"; lastSync: string };

export default function OrganizationSettingsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(
    INTEGRATIONS.map((item, i) => ({
      name: item.name,
      status: i < 5 ? "Connected" : "Ready",
      lastSync: i < 5 ? "3 min ago" : "Not connected"
    }))
  );
  const [webhooks, setWebhooks] = useState({
    slackUrl: "",
    teamsUrl: ""
  });
  const [budgets, setBudgets] = useState({
    Engineering: 70000,
    Sales: 32000,
    Marketing: 26000,
    Support: 22000,
    Legal: 14000,
    Finance: 18000
  });
  const [savedWebhooks, setSavedWebhooks] = useState(false);
  const [savedBudgets, setSavedBudgets] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  async function toggleIntegration(name: string) {
    setSyncing(name);
    await new Promise((r) => setTimeout(r, 900));
    setIntegrations((prev) =>
      prev.map((item) =>
        item.name === name
          ? { ...item, status: item.status === "Connected" ? "Ready" : "Connected", lastSync: item.status === "Connected" ? "Not connected" : "Just now" }
          : item
      )
    );
    setSyncing(null);
  }

  async function saveWebhooks(e: React.FormEvent) {
    e.preventDefault();
    await new Promise((r) => setTimeout(r, 600));
    setSavedWebhooks(true);
    setTimeout(() => setSavedWebhooks(false), 3000);
  }

  async function saveBudgets(e: React.FormEvent) {
    e.preventDefault();
    await new Promise((r) => setTimeout(r, 600));
    setSavedBudgets(true);
    setTimeout(() => setSavedBudgets(false), 3000);
  }

  return (
    <main className="min-h-screen px-4 py-10 md:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </a>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-mint/15 text-mint">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Organization Settings</h1>
            <p className="text-sm text-slate-400">Configure integrations, budgets, and notification webhooks</p>
          </div>
        </div>

        {/* Integrations */}
        <div className="glass mb-6 rounded-lg p-6">
          <div className="mb-4 flex items-center gap-2">
            <PlugZap className="h-4 w-4 text-cyan" />
            <h2 className="font-semibold text-white">AI Tool Integrations</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {integrations.map((item) => {
              const meta = INTEGRATIONS.find((i) => i.name === item.name);
              return (
                <div key={item.name} className="flex items-center justify-between rounded-md border border-line bg-white/[0.03] p-4">
                  <div>
                    <div className="font-medium text-white">{item.name}</div>
                    <div className="mt-0.5 text-xs text-slate-400">{meta?.description}</div>
                    <div className="mt-1 text-xs text-slate-500">Last sync: {item.lastSync}</div>
                  </div>
                  <button
                    onClick={() => toggleIntegration(item.name)}
                    disabled={syncing === item.name}
                    className={clsx(
                      "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition",
                      item.status === "Connected"
                        ? "bg-mint/15 text-mint hover:bg-rose/10 hover:text-rose"
                        : "bg-white/5 text-slate-400 hover:bg-cyan/10 hover:text-cyan"
                    )}
                  >
                    {syncing === item.name ? <RefreshCw className="h-3 w-3 animate-spin" /> : item.status === "Connected" ? <Check className="h-3 w-3" /> : null}
                    {syncing === item.name ? "Syncing..." : item.status}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Webhook URLs */}
        <div className="glass mb-6 rounded-lg p-6">
          <div className="mb-4 flex items-center gap-2">
            <Webhook className="h-4 w-4 text-amber" />
            <h2 className="font-semibold text-white">Alert Webhooks</h2>
            <span className="rounded-full bg-amber/10 px-2 py-0.5 text-xs text-amber">Configure in .env.local</span>
          </div>
          <p className="mb-4 text-sm text-slate-400">
            Set <code className="rounded bg-white/10 px-1 py-0.5 text-xs text-white">SLACK_WEBHOOK_URL</code> and{" "}
            <code className="rounded bg-white/10 px-1 py-0.5 text-xs text-white">MICROSOFT_TEAMS_WEBHOOK_URL</code> in your{" "}
            <code className="rounded bg-white/10 px-1 py-0.5 text-xs text-white">.env.local</code> file to receive budget and security alerts.
          </p>
          <form onSubmit={saveWebhooks} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-400">Slack Webhook URL</label>
              <input
                value={webhooks.slackUrl}
                onChange={(e) => setWebhooks((w) => ({ ...w, slackUrl: e.target.value }))}
                className="w-full rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Microsoft Teams Webhook URL</label>
              <input
                value={webhooks.teamsUrl}
                onChange={(e) => setWebhooks((w) => ({ ...w, teamsUrl: e.target.value }))}
                className="w-full rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber"
                placeholder="https://outlook.office.com/webhook/..."
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-md bg-amber px-4 py-2 text-sm font-semibold text-black"
            >
              <Save className="h-4 w-4" />
              {savedWebhooks ? "Saved!" : "Save Webhooks"}
            </button>
          </form>
        </div>

        {/* Department Budgets */}
        <div className="glass rounded-lg p-6">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-mint" />
            <h2 className="font-semibold text-white">Monthly Department Budgets</h2>
          </div>
          <p className="mb-4 text-sm text-slate-400">
            Alerts will be sent when departments exceed 80% (warning) or 95% (critical) of their monthly budget.
          </p>
          <form onSubmit={saveBudgets} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(budgets).map(([dept, budget]) => (
                <div key={dept}>
                  <label className="mb-1 block text-sm text-slate-400">{dept}</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">$</span>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudgets((b) => ({ ...b, [dept]: Number(e.target.value) }))}
                      className="w-full rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-mint"
                    />
                    <span className="text-xs text-slate-500">/mo</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-md bg-mint px-4 py-2 text-sm font-semibold text-black"
            >
              <Save className="h-4 w-4" />
              {savedBudgets ? "Saved!" : "Save Budgets"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
