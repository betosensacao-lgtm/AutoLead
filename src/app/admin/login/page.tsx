"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { LogoMark } from "@/components/logo-mark";
import { OrganicLines } from "@/components/organic-lines";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Login failed");
        return;
      }

      window.location.href = "/admin/dashboard";
    } catch {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-paper text-ink font-sans relative overflow-hidden bg-grain">
      <OrganicLines variant="subtle" className="opacity-40" />
      <div className="relative z-10 w-full max-w-sm border border-border bg-paper-raised p-8 rounded-lg shadow-sm">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-fit">
            <LogoMark size={48} />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">FlowAI Studio</h1>
          <p className="text-sm text-ink-muted mt-1">
            Sign in to your automation workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-muted block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-paper text-sm text-ink placeholder-ink-muted/60 focus:outline-none focus:border-sage transition-colors"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-muted block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-paper text-sm text-ink placeholder-ink-muted/60 focus:outline-none focus:border-sage transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sage text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-sage-dark disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-ink-muted mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/admin/signup" className="text-sage hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
