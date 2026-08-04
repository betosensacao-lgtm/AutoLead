# FlowAI Organic Redesign & English Localization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace FlowAI's generic dark-slate/cyan-purple-gradient/glassmorphism visual system with a warm, paper-toned "Botanical/Nature-Tech" design (sage green accent, Fraunces + Public Sans typography, paper grain + organic root-line texture), and translate the entire app from Portuguese to English, per `docs/superpowers/specs/2026-08-04-organic-redesign-design.md`.

**Architecture:** Two shared building blocks (design tokens + two small reusable components) get built first, then each page is rewritten in place against those tokens/components — restyling and translating in the same edit, since it's the same lines of JSX either way. Backend-facing copy (API error strings, the LangGraph agent's prompt and tool descriptions) gets translated in its own task since it's not a styling change. A dead component discovered while reading the codebase (`RealtimeDashboard`, wired to pre-pivot Supabase tables that no longer exist in the app) is removed as part of this pass.

**Tech Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS, `next/font/google` for Fraunces/Public Sans, no new dependencies.

**Testing note:** This is a styling + copy pass with no new business logic — there's no existing UI test harness (the 33 Vitest tests cover only `src/lib/security/*`), and the spec explicitly scopes this as visual/copy only. So "tests" here means `tsc --noEmit` after each file edit (fast feedback that JSX/types are still valid) plus one consolidated manual browser verification pass at the end, rather than red/green unit tests per step.

---

### Task 1: Design tokens, fonts, and global styles

**Files:**
- Modify: `src/styles/globals.css`
- Modify: `tailwind.config.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Rewrite `src/styles/globals.css`**

Replace the entire file with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

body {
  background: #f3efe3;
  color: #26301c;
  -webkit-font-smoothing: antialiased;
}

.bg-grain {
  background-image: radial-gradient(rgba(38, 48, 28, 0.05) 1px, transparent 1px);
  background-size: 3px 3px;
}
```

This removes the old `--background`/`--foreground`/`--muted`/`--border`/`--ring` CSS
variables and the `prefers-color-scheme: dark` override block — the app is
light-only now, and color tokens move to `tailwind.config.ts` instead.

- [ ] **Step 2: Rewrite `tailwind.config.ts`**

Replace the entire file with:

```ts
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "serif"],
      },
      colors: {
        paper: {
          DEFAULT: "#f3efe3",
          raised: "#f9f6ec",
          deep: "#e7e2d2",
        },
        ink: {
          DEFAULT: "#26301c",
          muted: "#55603f",
        },
        sage: {
          DEFAULT: "#6b7f4f",
          dark: "#566a3d",
        },
        border: "rgba(38,48,28,0.14)",
        error: "#a34a3a",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

This drops the old `brand` blue color scale entirely — every page in later
tasks uses `paper`/`ink`/`sage`/`border`/`error` instead.

- [ ] **Step 3: Rewrite `src/app/layout.tsx`**

Replace the entire file with:

```tsx
import type { Metadata } from "next";
import { Fraunces, Public_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "@/styles/globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-display",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "FlowAI — n8n Workflow Automation Hub",
  description: "Create, monitor, and automate n8n workflows using AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${publicSans.variable}`}>
      <body className="antialiased bg-paper text-ink font-sans">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `cd "C:/Claude Code/autolead" && npx tsc --noEmit`
Expected: errors about `paper`/`sage`/etc. classes not existing are impossible
(Tailwind classes aren't typechecked), but this run establishes a clean
baseline before touching any page. Expected: PASS (no errors), since these
three files don't reference any component that doesn't exist yet.

- [ ] **Step 5: Commit**

```bash
cd "C:/Claude Code/autolead"
git add src/styles/globals.css tailwind.config.ts src/app/layout.tsx
git commit -m "feat(design): switch to paper/sage design tokens and Fraunces/Public Sans"
```

---

### Task 2: Shared components — logo mark and organic line motif

**Files:**
- Create: `src/components/logo-mark.tsx`
- Create: `src/components/organic-lines.tsx`

- [ ] **Step 1: Create `src/components/logo-mark.tsx`**

```tsx
import { Workflow } from "lucide-react";

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full border border-sage/40 bg-paper-raised"
      style={{ width: size, height: size }}
    >
      <Workflow className="text-sage" size={Math.round(size * 0.5)} strokeWidth={1.75} />
    </div>
  );
}
```

This replaces the gradient rounded-square badge (`bg-gradient-to-br
from-cyan-500 to-purple-600` with a glow shadow) used today in the landing
nav, login/signup cards, admin sidebar, and chat header.

- [ ] **Step 2: Create `src/components/organic-lines.tsx`**

```tsx
interface OrganicLinesProps {
  variant?: "dense" | "subtle";
  className?: string;
}

export function OrganicLines({ variant = "subtle", className = "" }: OrganicLinesProps) {
  const opacity = variant === "dense" ? 0.5 : 0.25;

  return (
    <svg
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    >
      <g fill="none" stroke="#6b7f4f" strokeWidth="1.3" opacity={opacity}>
        <path d="M40,20 C60,60 30,100 60,140 C80,170 70,210 100,250" />
        <path d="M60,140 C90,150 110,130 140,150" />
        <path d="M100,250 C130,230 140,200 170,190" />
        <path d="M380,10 C350,50 370,90 330,120 C300,145 310,190 270,220" />
        <path d="M330,120 C300,110 280,130 250,120" />
        <path d="M270,220 C240,235 220,220 190,235" />
        <circle cx="60" cy="140" r="2.5" fill="#6b7f4f" stroke="none" />
        <circle cx="140" cy="150" r="2.5" fill="#6b7f4f" stroke="none" />
        <circle cx="330" cy="120" r="2.5" fill="#6b7f4f" stroke="none" />
        <circle cx="270" cy="220" r="2.5" fill="#6b7f4f" stroke="none" />
      </g>
    </svg>
  );
}
```

This is the root/branch line motif from the approved mockups — a
`variant="dense"` version for the landing hero and a `variant="subtle"`
version for smaller surfaces like the login/signup cards.

- [ ] **Step 3: Typecheck**

Run: `cd "C:/Claude Code/autolead" && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
cd "C:/Claude Code/autolead"
git add src/components/logo-mark.tsx src/components/organic-lines.tsx
git commit -m "feat(design): add LogoMark and OrganicLines shared components"
```

---

### Task 3: Landing page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Rewrite `src/app/page.tsx`**

Replace the entire file with:

```tsx
import Link from "next/link";
import { ArrowRight, Cpu, Activity, LayoutGrid } from "lucide-react";
import { LogoMark } from "@/components/logo-mark";
import { OrganicLines } from "@/components/organic-lines";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink relative overflow-hidden font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-paper/90">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={40} />
            <span className="font-display font-semibold text-2xl tracking-tight">
              FlowAI
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/admin/dashboard"
              className="text-sm font-medium text-ink-muted hover:text-ink transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/chat"
              className="group flex items-center gap-2 text-sm bg-sage text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-sage-dark transition-colors"
            >
              Generate a Workflow
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center z-10 relative bg-grain">
        <OrganicLines variant="dense" className="opacity-70" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-paper-raised border border-border text-sage text-sm font-medium mb-8">
            n8n + LangGraph Automation Hub
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-semibold max-w-4xl leading-tight tracking-tight">
            Automations that grow with you.
          </h1>

          <p className="text-lg md:text-xl text-ink-muted max-w-2xl mt-8 leading-relaxed">
            FlowAI pairs AI agents with the n8n engine to generate, tune, and
            run complex automations from plain-language instructions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-12">
            <Link
              href="/chat"
              className="flex items-center justify-center gap-2 bg-sage text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-sage-dark transition-colors"
            >
              Try the AI Generator
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/admin/dashboard"
              className="flex items-center justify-center px-8 py-4 rounded-lg font-semibold text-lg border border-border bg-paper-raised hover:bg-paper-deep transition-colors"
            >
              View Active Workflows
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mt-28">
            {[
              {
                icon: Cpu,
                title: "AI Workflow Generator",
                desc: "Describe your goal in plain language and the LangGraph agent builds the n8n nodes and connections for you.",
              },
              {
                icon: Activity,
                title: "Execution & Monitoring",
                desc: "Track the health, logs, and success rate of every automation run in real time.",
              },
              {
                icon: LayoutGrid,
                title: "n8n Template Gallery",
                desc: "Start from pre-built templates for lead capture, RAG reports, notifications, and webhooks.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="border border-border bg-paper-raised rounded-lg p-8 text-left transition-colors hover:border-sage/40"
              >
                <div className="w-12 h-12 rounded-full bg-paper-deep flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-sage" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">{feature.title}</h3>
                <p className="text-ink-muted text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-ink-muted z-10 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
          <p>© 2026 FlowAI — Automation Intelligence. All rights reserved.</p>
          <div className="flex gap-4 text-xs">
            <span>n8n Engine</span>
            <span>LangGraph AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `cd "C:/Claude Code/autolead" && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
cd "C:/Claude Code/autolead"
git add src/app/page.tsx
git commit -m "feat(design): redesign and translate landing page"
```

---

### Task 4: Login page

**Files:**
- Modify: `src/app/admin/login/page.tsx`

- [ ] **Step 1: Rewrite `src/app/admin/login/page.tsx`**

Replace the entire file with:

```tsx
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
```

- [ ] **Step 2: Typecheck**

Run: `cd "C:/Claude Code/autolead" && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
cd "C:/Claude Code/autolead"
git add src/app/admin/login/page.tsx
git commit -m "feat(design): redesign and translate login page"
```

---

### Task 5: Signup page (redesign + copy fix)

`src/app/admin/signup/page.tsx` is a stale pre-pivot leftover: it uses a
different, older visual system (`bg-brand-600`, `border-border` against CSS
vars that no longer exist after Task 1) and describes the old lead-
qualification product ("Start qualifying leads with AI"). It also submits a
`company` field that `/api/admin/signup` (already bootstrap-only, see the
earlier security-hardening work) never reads — that field is dropped here to
stop the form from lying about what it does.

**Files:**
- Modify: `src/app/admin/signup/page.tsx`

- [ ] **Step 1: Rewrite `src/app/admin/signup/page.tsx`**

Replace the entire file with:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { LogoMark } from "@/components/logo-mark";
import { OrganicLines } from "@/components/organic-lines";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to create account");
        return;
      }

      toast.success("Account created successfully!");
      router.push("/admin/dashboard");
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
          <h1 className="font-display text-2xl font-semibold tracking-tight">Create your admin account</h1>
          <p className="text-sm text-ink-muted mt-1">
            Start generating n8n workflows with AI
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-muted block mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-paper text-sm text-ink placeholder-ink-muted/60 focus:outline-none focus:border-sage transition-colors"
              required
            />
          </div>
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
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sage text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-sage-dark disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-xs text-ink-muted mt-6">
          Already have an account?{" "}
          <Link href="/admin/login" className="text-sage hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `cd "C:/Claude Code/autolead" && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
cd "C:/Claude Code/autolead"
git add src/app/admin/signup/page.tsx
git commit -m "fix(design): redesign signup page, drop unused company field, fix stale copy"
```

---

### Task 6: Admin sidebar / layout

**Files:**
- Modify: `src/app/admin/layout.tsx`

- [ ] **Step 1: Rewrite `src/app/admin/layout.tsx`**

Replace the entire file with:

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Bot,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/logo-mark";

const publicPaths = ["/admin/login", "/admin/signup"];

interface User {
  name: string;
  email: string;
  role: string;
}

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "AI Generator", icon: Bot },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (publicPaths.some((p) => pathname.startsWith(p))) return;

    fetch("/api/admin/me")
      .then((res) => {
        if (!res.ok) return;
        return res.json();
      })
      .then((data) => {
        if (data?.id) setUser(data);
      })
      .catch(console.error);
  }, [pathname]);

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen flex bg-paper text-ink font-sans">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-paper-deep border-r border-border transform transition-transform lg:relative lg:translate-x-0 flex flex-col justify-between",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          {/* Header Brand */}
          <div className="p-5 border-b border-border flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <LogoMark size={36} />
              <span className="font-display font-semibold text-xl tracking-tight">
                FlowAI
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-ink-muted hover:text-ink"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-sage text-white"
                    : "text-ink-muted hover:text-ink hover:bg-paper-raised"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Engine Banner & User Footer */}
        <div className="p-4 border-t border-border space-y-4">
          <div className="bg-paper-raised border border-border rounded-lg p-3 text-xs text-ink-muted flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sage flex-shrink-0" />
            <div>
              <p className="font-medium text-ink">n8n + LangGraph</p>
              <p className="text-[10px]">Automation engine active</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs">
              <p className="font-medium text-ink truncate">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-ink-muted capitalize">{user?.role || "admin"}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-ink-muted hover:text-error transition-colors p-1"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden border-b border-border p-4 flex items-center gap-3 bg-paper-raised">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <span className="font-display font-semibold text-lg">FlowAI</span>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `cd "C:/Claude Code/autolead" && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
cd "C:/Claude Code/autolead"
git add src/app/admin/layout.tsx
git commit -m "feat(design): redesign and translate admin sidebar"
```

---

### Task 7: Admin dashboard

**Files:**
- Modify: `src/app/admin/dashboard/page.tsx`

- [ ] **Step 1: Rewrite `src/app/admin/dashboard/page.tsx`**

Replace the entire file with:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Workflow, PlayCircle, CheckCircle2, Zap, Download, Code, Cpu } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface WorkflowItem {
  id: string;
  name: string;
  description?: string;
  triggerType: string;
  status: "ACTIVE" | "PAUSED" | "DRAFT";
  nodesCount: number;
  definitionJson?: any;
  createdAt?: string;
  lastRunAt?: string;
}

export default function FlowAIDashboardPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJson, setSelectedJson] = useState<{ name: string; json: any } | null>(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  async function fetchWorkflows() {
    try {
      const res = await fetch("/api/admin/workflows");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setWorkflows(data);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("[FETCH WORKFLOWS WARN]", err);
    }
    // Fallback demo data if DB empty
    setWorkflows([
      {
        id: "wf-demo-1",
        name: "Webhook Lead Capture -> HubSpot",
        description: "AI-generated automation to capture and score leads in real time",
        triggerType: "WEBHOOK",
        status: "ACTIVE",
        nodesCount: 5,
        definitionJson: { name: "Webhook Lead Capture -> HubSpot", nodes: [] },
      },
      {
        id: "wf-demo-2",
        name: "Urgent Slack Alert via AI Agent",
        description: "LangGraph agent that scores severity and notifies the Slack channel",
        triggerType: "AI_AGENT",
        status: "ACTIVE",
        nodesCount: 3,
        definitionJson: { name: "Urgent Slack Alert via AI Agent", nodes: [] },
      },
    ]);
    setLoading(false);
  }

  const activeCount = workflows.filter((w) => w.status === "ACTIVE").length || workflows.length;

  const stats = [
    { label: "Workflows Created", value: String(workflows.length), icon: Workflow },
    { label: "Active Workflows", value: String(activeCount), icon: PlayCircle },
    { label: "Success Rate", value: "99.4%", icon: CheckCircle2 },
    { label: "Avg. Duration", value: "320ms", icon: Zap },
  ];

  return (
    <div className="space-y-8 text-ink">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">FlowAI Automation Panel</h1>
          <p className="text-sm text-ink-muted mt-1">
            n8n workflows generated via AI Chat, .json files, and real-time monitoring
          </p>
        </div>
        <Link
          href="/chat"
          className="flex items-center gap-2 bg-sage text-white text-sm px-4 py-2.5 rounded-lg font-medium hover:bg-sage-dark transition-colors"
        >
          <Cpu className="w-4 h-4" />
          Generate New Workflow via Chat
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border border-border bg-paper-raised rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">{stat.label}</span>
              <stat.icon className="w-5 h-5 text-sage" />
            </div>
            <p className="font-display text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Workflows Table */}
      <div className="border border-border bg-paper-raised rounded-lg overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sm">n8n Workflows &amp; .JSON Files</h2>
            <p className="text-xs text-ink-muted mt-0.5">Download the JSON to import it directly into your n8n instance</p>
          </div>
          <span className="text-xs text-sage font-mono bg-paper-deep border border-border px-3 py-1 rounded-full">
            n8n DB Engine: Connected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-ink-muted text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-3 font-medium">Workflow Name</th>
                <th className="text-center px-6 py-3 font-medium">Trigger</th>
                <th className="text-center px-6 py-3 font-medium">n8n Nodes</th>
                <th className="text-center px-6 py-3 font-medium">Status</th>
                <th className="text-right px-6 py-3 font-medium">Action / .JSON File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {workflows.map((wf) => (
                <tr key={wf.id} className="hover:bg-paper-deep/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-paper-deep border border-border text-sage flex items-center justify-center">
                        <Workflow className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">{wf.name}</p>
                        <p className="text-xs text-ink-muted">{wf.description || `ID: ${wf.id.slice(0, 12)}`}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-paper-deep text-ink-muted text-xs px-2.5 py-1 rounded-md font-mono border border-border">
                      {wf.triggerType || "WEBHOOK"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-ink-muted text-xs font-mono">
                    {wf.nodesCount || 3} nodes
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                        wf.status === "ACTIVE"
                          ? "bg-sage/10 text-sage border-sage/30"
                          : "bg-error/10 text-error border-error/30"
                      }`}
                    >
                      {wf.status === "ACTIVE" ? "Active" : "Paused"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          setSelectedJson({
                            name: wf.name,
                            json: wf.definitionJson || { name: wf.name, nodes: [] },
                          })
                        }
                        className="flex items-center gap-1.5 bg-paper hover:bg-paper-deep text-ink-muted text-xs px-3 py-1.5 rounded-md font-medium border border-border transition-colors"
                      >
                        <Code className="w-3.5 h-3.5 text-sage" />
                        View JSON
                      </button>
                      <a
                        href={`/api/admin/workflows/${wf.id}/json`}
                        download
                        className="flex items-center gap-1.5 bg-sage/10 hover:bg-sage/20 text-sage text-xs px-3 py-1.5 rounded-md font-medium border border-sage/30 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download .json
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON View Modal */}
      {selectedJson && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-paper-raised border border-border rounded-lg w-full max-w-2xl overflow-hidden shadow-xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedJson.name}</h3>
                <p className="text-xs text-ink-muted mt-0.5">n8n Workflow JSON structure</p>
              </div>
              <button
                onClick={() => setSelectedJson(null)}
                className="text-ink-muted hover:text-ink text-sm bg-paper-deep px-3 py-1.5 rounded-md"
              >
                Close
              </button>
            </div>
            <pre className="bg-paper p-4 rounded-lg text-xs text-ink font-mono overflow-auto max-h-96 border border-border">
              {JSON.stringify(selectedJson.json, null, 2)}
            </pre>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedJson.json, null, 2));
                  toast.success("JSON copied to clipboard!");
                }}
                className="bg-sage text-white hover:bg-sage-dark px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
              >
                Copy JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

Note: the "Copy JSON" confirmation switched from `alert(...)` to
`toast.success(...)` (sonner is already used everywhere else in the app,
including this page's own `<Toaster />` from the root layout) — purely a
consistency fix while this exact line was already being translated.

- [ ] **Step 2: Typecheck**

Run: `cd "C:/Claude Code/autolead" && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
cd "C:/Claude Code/autolead"
git add src/app/admin/dashboard/page.tsx
git commit -m "feat(design): redesign and translate admin dashboard"
```

---

### Task 8: Chat / workflow generator page

**Files:**
- Modify: `src/app/chat/page.tsx`

- [ ] **Step 1: Rewrite `src/app/chat/page.tsx`**

Replace the entire file with:

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";

interface Message {
  role: "user" | "agent";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content:
        "Hi! I'm FlowAI's automation assistant. How can I help you create, integrate, or optimize your n8n workflows today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: data.reply || "Workflow generated and saved." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "Sorry, something went wrong reaching the FlowAI agent. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex flex-col max-w-4xl mx-auto bg-paper text-ink font-sans border-x border-border">
      {/* Header */}
      <header className="border-b border-border p-4 bg-paper-raised flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="text-ink-muted hover:text-ink p-1">
            <ArrowLeft size={18} />
          </Link>
          <LogoMark size={36} />
          <div>
            <h1 className="font-display font-semibold text-base">
              FlowAI Workflow Agent
            </h1>
            <p className="text-xs text-ink-muted">n8n automation powered by LangGraph AI</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-paper">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 text-sm ${msg.role === "agent" ? "justify-start" : "justify-end"}`}
          >
            {msg.role === "agent" && (
              <div className="w-8 h-8 rounded-full bg-paper-deep border border-border text-sage flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-xl rounded-lg p-4 text-sm leading-relaxed border ${
                msg.role === "agent"
                  ? "bg-paper-raised border-border text-ink rounded-bl-none"
                  : "bg-sage/10 border-sage/30 text-ink rounded-br-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 items-center text-xs text-ink-muted">
            <div className="w-6 h-6 rounded-full border border-sage/30 border-t-sage animate-spin" />
            Generating n8n automation...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-border p-4 bg-paper-raised flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Create a workflow that receives leads via webhook and posts to Slack and HubSpot..."
          className="flex-1 px-4 py-3 rounded-lg border border-border bg-paper text-sm text-ink placeholder-ink-muted/60 focus:outline-none focus:border-sage transition-colors"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-sage text-white px-5 py-3 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-sage-dark disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `cd "C:/Claude Code/autolead" && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
cd "C:/Claude Code/autolead"
git add src/app/chat/page.tsx
git commit -m "feat(design): redesign and translate chat/generator page"
```

---

### Task 9: Translate backend-facing copy (API errors, agent prompt, tool descriptions)

**Files:**
- Modify: `src/app/api/admin/login/route.ts`
- Modify: `src/app/api/admin/workflows/route.ts`
- Modify: `src/lib/langgraph/nodes.ts`
- Modify: `src/lib/langgraph/tools.ts`

- [ ] **Step 1: Translate error strings in `src/app/api/admin/login/route.ts`**

Find:
```ts
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
```
Replace with:
```ts
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
```

Find (both occurrences of this exact line — there are two `return`
statements with this message, one after the auto-seed check and one after
password verification):
```ts
      return NextResponse.json({ error: "Email ou senha incorretos" }, { status: 401 });
```
Replace both with:
```ts
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
```

- [ ] **Step 2: Translate default strings in `src/app/api/admin/workflows/route.ts`**

Find:
```ts
    const n8nWf = await n8nClient.createWorkflow(name || "Novo Workflow", nodes || [], {});

    const [created] = await db
      .insert(workflows)
      .values({
        name: name || "Novo Workflow FlowAI",
        description: description || "Criado via FlowAI Studio",
```
Replace with:
```ts
    const n8nWf = await n8nClient.createWorkflow(name || "New Workflow", nodes || [], {});

    const [created] = await db
      .insert(workflows)
      .values({
        name: name || "New FlowAI Workflow",
        description: description || "Created via FlowAI Studio",
```

- [ ] **Step 3: Translate `FLOWAI_PROMPT` and canned replies in `src/lib/langgraph/nodes.ts`**

Find:
```ts
const FLOWAI_PROMPT = `Você é o assistente de IA da plataforma FlowAI.
Sua missão é ajudar o usuário a planejar, criar e automatizar fluxos de trabalho no n8n.

Quando o usuário pedir para criar um fluxo ou automação (ex: "Crie uma automação que recebe leads via Webhook e envia no Slack e HubSpot"):
1. Identifique o gatilho (Webhook, Agendador, Evento)
2. Identifique as integrações necessárias
3. OBRIGATORIAMENTE execute a ferramenta 'create_n8n_workflow' para registrar a automação e gerar o JSON no sistema.

Responda sempre com clareza, em português do Brasil, confirmando que o workflow foi gerado e está disponível no Painel Dashboard com o arquivo JSON para download.`;
```
Replace with:
```ts
const FLOWAI_PROMPT = `You are FlowAI's AI assistant.
Your mission is to help the user plan, create, and automate n8n workflows.

When the user asks you to create a flow or automation (e.g. "Create an automation that receives leads via webhook and sends them to Slack and HubSpot"):
1. Identify the trigger (Webhook, Schedule, Event)
2. Identify the integrations needed
3. You MUST call the 'create_n8n_workflow' tool to register the automation and generate the JSON in the system.

Always respond clearly, in English, confirming that the workflow was generated and is available in the Dashboard panel with the JSON file ready for download.`;
```

Find:
```ts
              "Workflow gerado e salvo com sucesso no banco de dados! O arquivo .json está disponível para download no Dashboard de Automações."
```
Replace with:
```ts
              "Workflow generated and saved successfully! The .json file is available for download in the Automation Dashboard."
```

Find:
```ts
          "Desculpe, ocorreu um erro ao processar sua solicitação de automação. Tente novamente."
```
Replace with:
```ts
          "Sorry, something went wrong while processing your automation request. Please try again."
```

- [ ] **Step 4: Translate tool descriptions in `src/lib/langgraph/tools.ts`**

Find:
```ts
  description: "Cria um novo workflow de automação n8n via IA com os nós e conexões especificados e salva o JSON no banco.",
  schema: z.object({
    name: z.string().describe("Nome do workflow"),
    description: z.string().describe("Descrição do que o workflow faz"),
    triggerType: z.enum(["WEBHOOK", "SCHEDULE", "EVENT", "MANUAL", "AI_AGENT"]).default("WEBHOOK"),
    nodes: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
    })).describe("Lista de nós n8n"),
```
Replace with:
```ts
  description: "Creates a new n8n automation workflow via AI with the specified nodes and connections, and saves the JSON to the database.",
  schema: z.object({
    name: z.string().describe("Workflow name"),
    description: z.string().describe("Description of what the workflow does"),
    triggerType: z.enum(["WEBHOOK", "SCHEDULE", "EVENT", "MANUAL", "AI_AGENT"]).default("WEBHOOK"),
    nodes: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
    })).describe("List of n8n nodes"),
```

Find:
```ts
  description: "Dispara a execução de um workflow n8n ativo.",
  schema: z.object({
    workflowId: z.string().describe("ID do workflow no sistema"),
    inputData: z.record(z.unknown()).optional().describe("Dados de entrada para o disparo"),
```
Replace with:
```ts
  description: "Triggers execution of an active n8n workflow.",
  schema: z.object({
    workflowId: z.string().describe("Workflow ID in the system"),
    inputData: z.record(z.unknown()).optional().describe("Input data for the trigger"),
```

Find:
```ts
  description: "Lista os workflows ativos e seu status de execução.",
```
Replace with:
```ts
  description: "Lists active workflows and their execution status.",
```

- [ ] **Step 5: Typecheck**

Run: `cd "C:/Claude Code/autolead" && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 6: Confirm no Portuguese remains**

Run:
```bash
cd "C:/Claude Code/autolead"
grep -rlP "[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]" src/
```
Expected: no output (empty) — every file with accented Portuguese characters
has now been translated.

- [ ] **Step 7: Commit**

```bash
cd "C:/Claude Code/autolead"
git add src/app/api/admin/login/route.ts src/app/api/admin/workflows/route.ts src/lib/langgraph/nodes.ts src/lib/langgraph/tools.ts
git commit -m "feat(i18n): translate API error strings and LangGraph agent copy to English"
```

---

### Task 10: Remove dead RealtimeDashboard component and its unused Supabase dependency

While reading the codebase for this redesign, `src/components/realtime-
dashboard.tsx` was found to be dead code: it's never imported or rendered
anywhere (confirmed via `grep -rn "RealtimeDashboard" src/`, which only
matches its own definition), and it subscribes to Supabase Realtime changes
on `autolead.leads` / `autolead.lead_messages` — pre-pivot tables from the
old lead-qualification product that the current FlowAI app never writes to.
`src/lib/supabase/client.ts` is only imported by this dead component, so it
becomes dead too once it's removed, and `@supabase/supabase-js` becomes an
unused dependency.

**Files:**
- Delete: `src/components/realtime-dashboard.tsx`
- Delete: `src/lib/supabase/client.ts`
- Modify: `package.json`

- [ ] **Step 1: Confirm nothing references these files before deleting**

Run:
```bash
cd "C:/Claude Code/autolead"
grep -rn "RealtimeDashboard\|lib/supabase" src/ --include="*.tsx" --include="*.ts" | grep -v "src/components/realtime-dashboard.tsx:\|src/lib/supabase/client.ts:"
```
Expected: no output (empty) — nothing outside the two files themselves
references either.

- [ ] **Step 2: Delete the files**

```bash
cd "C:/Claude Code/autolead"
rm src/components/realtime-dashboard.tsx
rm -r src/lib/supabase
```

- [ ] **Step 3: Remove the unused dependency from `package.json`**

Find (in the `dependencies` block):
```json
    "@supabase/supabase-js": "^2.110.8",
```
Delete that line entirely.

- [ ] **Step 4: Reinstall to update the lockfile**

Run: `cd "C:/Claude Code/autolead" && pnpm install`
Expected: completes successfully; `pnpm-lock.yaml` no longer lists
`@supabase/supabase-js`.

- [ ] **Step 5: Typecheck**

Run: `cd "C:/Claude Code/autolead" && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
cd "C:/Claude Code/autolead"
git add -A
git commit -m "chore: remove dead RealtimeDashboard component and unused Supabase dependency"
```

---

### Task 11: Final verification sweep

**Files:** none (verification only)

- [ ] **Step 1: Run the existing test suite**

Run: `cd "C:/Claude Code/autolead" && pnpm test`
Expected: all 33 existing tests still pass (this redesign never touches
`src/lib/security/*`, so this is a regression check, not new coverage).

- [ ] **Step 2: Full typecheck**

Run: `cd "C:/Claude Code/autolead" && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Start the dev server and visually verify every redesigned page**

Use the Browser preview tool (`preview_start` with the `autolead` launch
config, port 3001) to check, at both desktop and mobile widths:
- `/` — landing page renders with paper background, root-line hero texture,
  Fraunces headline, sage CTA button, no leftover Portuguese, no console
  errors
- `/admin/login` — card renders correctly, form submits (test with a wrong
  password — expect the "Incorrect email or password" toast, not a crash)
- `/admin/signup` — matches the new visual system (not the old `bg-brand-600`
  look), copy describes FlowAI, no `company` field
- `/admin/dashboard` (after logging in) — stat cards, workflow table, and the
  "View JSON" modal all render in the new palette with English labels
- `/chat` — bubbles use the new paper/sage palette, sending a message works
  end-to-end

- [ ] **Step 4: Confirm no remaining Portuguese anywhere in `src/`**

Run:
```bash
cd "C:/Claude Code/autolead"
grep -rlP "[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]" src/
```
Expected: no output.

- [ ] **Step 5: Report results**

Summarize to the user: confirm every page was checked, note any visual
issues found and fixed, confirm tests/typecheck are green, and note the
final commit hash is ready to push.
