"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, User as UserIcon, ArrowRight, ShieldCheck, Sparkles, Check } from "lucide-react";
import { Button } from "@/views/components/Button";
import { Input } from "@/views/components/Input";
import { Alert } from "@/views/components/Alert";

export const LoginView: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedDemo, setCopiedDemo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid login credentials. Please try again.");
        setIsLoading(false);
        return;
      }

      // Redirect according to role returned from controller
      router.push(data.redirectTo || "/");
      router.refresh();
    } catch (err: any) {
      setError("An unexpected connection error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string, label: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
    setCopiedDemo(label);
    setTimeout(() => setCopiedDemo(null), 2500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-xl shadow-indigo-500/25 mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Tuition Class LMS Portal
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Enterprise Systems Technologies & Architectures (IT 403061)
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white">Account Login</h2>
              <p className="text-xs text-slate-400">Sign in with your system credentials</p>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure Session
            </span>
          </div>

          {error && (
            <Alert
              type="error"
              message={error}
              className="mb-5 bg-rose-950/50 border-rose-900/80 text-rose-300"
              onDismiss={() => setError(null)}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              placeholder="e.g. admin or Kavindu"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<UserIcon className="w-4 h-4" />}
              autoComplete="username"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 font-semibold shadow-indigo-600/30"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to LMS
            </Button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Demo Credentials (Quick Fill)
              </span>
              {copiedDemo && (
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 animate-fade-in">
                  <Check className="w-3 h-3" /> Filled {copiedDemo}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("admin", "AdminPassword@123", "Admin")}
                className="flex flex-col text-left p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-indigo-500/50 transition-all text-xs"
              >
                <span className="font-bold text-indigo-400">Admin / Teacher</span>
                <span className="text-[11px] text-slate-400 font-mono">admin : AdminPassword@123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("Kavindu", "age@200", "Student")}
                className="flex flex-col text-left p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-emerald-500/50 transition-all text-xs"
              >
                <span className="font-bold text-emerald-400">Sample Student</span>
                <span className="text-[11px] text-slate-400 font-mono">Kavindu : age@200</span>
              </button>
            </div>
            <p className="mt-2.5 text-center text-[11px] text-slate-500">
              Generated password formula: Last 3 chars of Last Name + @ + First 3 digits of NIC
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Tuition Class Student Management & LMS • MVC Architecture
        </p>
      </div>
    </div>
  );
};
