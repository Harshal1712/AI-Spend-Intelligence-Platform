"use client";

import { useState } from "react";
import { BrainCircuit, Mail, ArrowLeft, Info, Loader2, ShieldCheck } from "lucide-react";

const DEMO_ACCOUNTS = [
  { role: "CEO", email: "ceo@demo.com", color: "text-amber" },
  { role: "Admin", email: "admin@demo.com", color: "text-rose" },
  { role: "Manager (Maya)", email: "maya@demo.com", color: "text-cyan" },
  { role: "Manager (Jordan)", email: "jordan@demo.com", color: "text-cyan" },
  { role: "Employee (Aarav)", email: "aarav@demo.com", color: "text-mint" },
];

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    // Simulate a brief async operation
    await new Promise((resolve) => setTimeout(resolve, 900));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-[-10%] top-[-8%] h-[420px] w-[420px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.28) 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-[-8%] right-[-8%] h-[360px] w-[360px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(217,119,6,0.22) 0%, transparent 70%)" }}
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
          {!submitted ? (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">Reset your password</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Enter your work email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300" htmlFor="email">
                    Work email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full rounded-lg border border-line bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-white outline-none transition-colors placeholder:text-slate-400 focus:border-cyan focus:ring-2 focus:ring-cyan/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan px-4 py-2.5 text-sm font-semibold text-black shadow-glow transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Submitted state */
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mint/10">
                <ShieldCheck className="h-8 w-8 text-mint" />
              </div>
              <div>
                <p className="font-semibold text-white">Check your email</p>
                <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
                  If <span className="font-medium text-slate-300">{email}</span> is registered, a
                  reset link has been sent.
                </p>
              </div>
            </div>
          )}

          {/* Demo notice — always visible */}
          <div className="mt-6 rounded-xl border border-line bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-amber" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Demo Environment
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              No email system is connected in this demo. All demo accounts use the password{" "}
              <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-slate-300">password</code>
              . Simply go back and sign in directly.
            </p>
            <div className="mt-3 space-y-1.5">
              {DEMO_ACCOUNTS.map((account) => (
                <div
                  key={account.email}
                  className="flex items-center justify-between rounded-lg border border-line bg-white/5 px-3 py-2"
                >
                  <span className={`text-xs font-medium ${account.color}`}>{account.role}</span>
                  <span className="font-mono text-[11px] text-slate-400">{account.email}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Back link */}
          <a
            href="/login"
            className="mt-6 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-cyan"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </a>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          AI Spend Intelligence Platform &copy; {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}
