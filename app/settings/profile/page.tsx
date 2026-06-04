"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { BrainCircuit, User, Save, KeyRound, ArrowLeft } from "lucide-react";
import { clsx } from "clsx";

export default function ProfileSettingsPage() {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    name: session?.user?.name ?? "",
    email: session?.user?.email ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    // Simulate save — in production this would call an API
    await new Promise((resolve) => setTimeout(resolve, 800));
    setStatus({ type: "success", message: "Profile updated successfully." });
    setLoading(false);
  }

  async function handleChangePassword(event: React.FormEvent) {
    event.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setStatus({ type: "error", message: "New passwords do not match." });
      return;
    }
    if (form.newPassword.length < 6) {
      setStatus({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }
    setLoading(true);
    setStatus(null);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setStatus({ type: "success", message: "Password changed successfully." });
    setForm((f) => ({ ...f, currentPassword: "", newPassword: "", confirmPassword: "" }));
    setLoading(false);
  }

  const role = (session?.user as { role?: string })?.role ?? "Employee";

  return (
    <main className="min-h-screen px-4 py-10 md:px-10">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </a>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan/15 text-cyan">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Profile Settings</h1>
            <p className="text-sm text-slate-400">Manage your account and personal preferences</p>
          </div>
        </div>

        {/* Role badge */}
        <div className="glass mb-6 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Current Role</div>
              <div className="mt-1 text-sm text-slate-400">Your access level determines what data you can see</div>
            </div>
            <span className={clsx(
              "rounded-full px-3 py-1 text-sm font-semibold",
              role === "Admin" || role === "CEO" ? "bg-mint/15 text-mint" :
              role === "Manager" ? "bg-cyan/15 text-cyan" : "bg-amber/15 text-amber"
            )}>{role}</span>
          </div>
        </div>

        {/* Profile form */}
        <div className="glass mb-6 rounded-lg p-6">
          <div className="mb-4 flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-cyan" />
            <h2 className="font-semibold text-white">Personal Information</h2>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-400">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan"
                placeholder="your@email.com"
              />
            </div>
            {status && (
              <div className={clsx("rounded-md p-3 text-sm", status.type === "success" ? "bg-mint/10 text-mint" : "bg-rose/10 text-rose")}>
                {status.message}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-md bg-cyan px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>

        {/* Password form */}
        <div className="glass rounded-lg p-6">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-amber" />
            <h2 className="font-semibold text-white">Change Password</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-400">Current Password</label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                className="w-full rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">New Password</label>
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                className="w-full rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan"
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Confirm New Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                className="w-full rounded-md border border-line bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan"
                placeholder="Repeat new password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-md bg-amber px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
            >
              <KeyRound className="h-4 w-4" />
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
