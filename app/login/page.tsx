"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { BrainCircuit, Zap, Loader2, LogIn, ChevronRight } from "lucide-react";

const DEMO_USERS = [
  { role: "CEO", email: "ceo@demo.com", password: "password", color: "text-amber", badge: "bg-amber/10 border-amber/20" },
  { role: "Admin", email: "admin@demo.com", password: "password", color: "text-rose", badge: "bg-rose/10 border-rose/20" },
  { role: "Manager", email: "maya@demo.com", password: "password", color: "text-cyan", badge: "bg-cyan/10 border-cyan/20" },
  { role: "Employee", email: "aarav@demo.com", password: "password", color: "text-mint", badge: "bg-mint/10 border-mint/20" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function fillDemo(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/",
      });
      if (result?.ok) {
        window.location.href = "/";
        return;
      }
      setMessage("Invalid email or password. Please try again.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-[-10%] top-[-8%] h-[420px] w-[420px] rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.28) 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-[-8%] right-[-8%] h-[380px] w-[380px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(22,163,74,0.22) 0%, transparent 70%)" }}
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
            <h2 className="text-lg font-semibold text-white">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-400">Sign in to your workspace to continue</p>
          </div>

          {/* Demo credentials */}
          <div className="mb-6 rounded-xl border border-line bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Quick Demo Access
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => fillDemo(user.email, user.password)}
                  className={`group flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-all hover:scale-[1.02] active:scale-[0.99] ${user.badge}`}
                >
                  <span className={`text-xs font-semibold ${user.color}`}>{user.role}</span>
                  <span className="flex w-full items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate">{user.email}</span>
                    <ChevronRight className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-[10px] text-slate-400">
              All demo accounts use password:{" "}
              <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-slate-300">password</code>
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-line bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-slate-400 focus:border-cyan focus:ring-2 focus:ring-cyan/20"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300" htmlFor="password">
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-xs text-cyan transition-opacity hover:opacity-80"
                >
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-line bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-slate-400 focus:border-cyan focus:ring-2 focus:ring-cyan/20"
              />
            </div>

            {message && (
              <div className="flex items-start gap-2 rounded-lg border border-rose/20 bg-rose/8 px-3.5 py-2.5">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose" />
                <p className="text-xs leading-relaxed text-rose">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan px-4 py-2.5 text-sm font-semibold text-black shadow-glow transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="font-medium text-cyan transition-opacity hover:opacity-80">
              Create one free
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
