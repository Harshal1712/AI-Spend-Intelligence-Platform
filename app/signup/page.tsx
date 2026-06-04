"use client";

import { useState } from "react";
import { BrainCircuit, Loader2, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";

const ROLES = ["Employee", "Manager", "CEO", "Admin"] as const;
type Role = (typeof ROLES)[number];

interface FormState {
  name: string;
  email: string;
  password: string;
  role: Role;
  department: string;
  team: string;
}

export default function SignupPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    role: "Employee",
    department: "",
    team: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function update(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("idle");
    setMessage("");
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setStatus("success");
        setMessage(data.message ?? "Account created successfully! You can now sign in.");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Could not create account. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-line bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-slate-400 focus:border-cyan focus:ring-2 focus:ring-cyan/20";
  const labelClass = "mb-1.5 block text-xs font-medium text-slate-300";

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed right-[-10%] top-[-8%] h-[420px] w-[420px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(22,163,74,0.28) 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-[-8%] left-[-8%] h-[380px] w-[380px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%)" }}
      />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan shadow-glow">
            <BrainCircuit className="h-7 w-7 text-white" strokeWidth={1.7} />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-white">AI Spend Intelligence</h1>
            <p className="mt-1 text-sm text-slate-400">Enterprise AI Cost &amp; Productivity Command Center</p>
          </div>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 shadow-card">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Create your account</h2>
            <p className="mt-1 text-sm text-slate-400">
              Join your team on the AI Spend Intelligence Platform
            </p>
          </div>

          {status === "success" ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mint/10">
                <CheckCircle2 className="h-8 w-8 text-mint" />
              </div>
              <div>
                <p className="font-semibold text-white">Account created!</p>
                <p className="mt-1 text-sm text-slate-400">{message}</p>
              </div>
              <a
                href="/login"
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-cyan px-5 py-2.5 text-sm font-semibold text-black shadow-glow transition-all hover:opacity-90"
              >
                Sign in to your account
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className={labelClass} htmlFor="name">Full name</label>
                <input
                  id="name"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={update("name")}
                  placeholder="Jane Smith"
                  className={inputClass}
                />
              </div>

              {/* Email */}
              <div>
                <label className={labelClass} htmlFor="email">Work email</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={update("email")}
                  placeholder="jane@company.com"
                  className={inputClass}
                />
              </div>

              {/* Password */}
              <div>
                <label className={labelClass} htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={update("password")}
                  placeholder="Min. 8 characters"
                  className={inputClass}
                />
              </div>

              {/* Role */}
              <div>
                <label className={labelClass} htmlFor="role">Role</label>
                <select
                  id="role"
                  value={form.role}
                  onChange={update("role")}
                  className={inputClass}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Department & Team — side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} htmlFor="department">Department</label>
                  <input
                    id="department"
                    value={form.department}
                    onChange={update("department")}
                    placeholder="Engineering"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="team">Team</label>
                  <input
                    id="team"
                    value={form.team}
                    onChange={update("team")}
                    placeholder="Platform"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Error message */}
              {status === "error" && message && (
                <div className="flex items-start gap-2 rounded-lg border border-rose/20 bg-rose/8 px-3.5 py-2.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
                  <p className="text-xs leading-relaxed text-rose">{message}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan px-4 py-2.5 text-sm font-semibold text-black shadow-glow transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create account
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer link */}
          <p className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <a href="/login" className="font-medium text-cyan transition-opacity hover:opacity-80">
              Sign in
            </a>
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          AI Spend Intelligence Platform &copy; {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}
