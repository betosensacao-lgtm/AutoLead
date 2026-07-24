"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Workflow,
  LogOut,
  Menu,
  X,
  Bot,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/cn";

const publicPaths = ["/admin/login", "/admin/signup"];

interface User {
  name: string;
  email: string;
  role: string;
}

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard FlowAI", icon: LayoutDashboard },
  { href: "/chat", label: "Gerador IA (LangGraph)", icon: Bot },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>({
    name: "Consultor IA",
    email: "admin@flowai.com",
    role: "admin",
  });
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
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/90 border-r border-slate-800 backdrop-blur-md transform transition-transform lg:relative lg:translate-x-0 flex flex-col justify-between",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          {/* Header Brand */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Workflow className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                FlowAI
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
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
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                  pathname === item.href
                    ? "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Engine Banner & User Footer */}
        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-200">n8n + LangGraph</p>
              <p className="text-[10px]">Motor de automação ativo</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs">
              <p className="font-medium text-slate-200 truncate">{user?.name || "Consultor IA"}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role || "admin"}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 transition-colors p-1"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden border-b border-slate-800 p-4 flex items-center gap-3 bg-slate-900/50 backdrop-blur-md">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <span className="font-bold text-lg">FlowAI</span>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
