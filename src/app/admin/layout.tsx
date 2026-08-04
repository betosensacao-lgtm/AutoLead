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
