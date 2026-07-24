"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  MessageSquare,
  Target,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { toast } from "sonner";

interface GoogleStatus {
  connected: boolean;
  email: string | null;
}

const publicPaths = ["/admin/login", "/admin/signup"];

interface User {
  name: string;
  email: string;
  role: string;
}

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/sequences", label: "Sequences", icon: MessageSquare },
  { href: "/admin/criteria", label: "Criteria", icon: Target },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function GoogleConnectSection() {
  const [status, setStatus] = useState<GoogleStatus>({ connected: false, email: null });
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/google/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(console.error);
  }, []);

  if (status.connected) {
    return (
      <div className="text-xs">
        <div className="flex items-center gap-1.5 text-green-600 mb-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Google connected
        </div>
        <p className="text-muted-foreground truncate">{status.email}</p>
        <button
          onClick={async () => {
            setDisconnecting(true);
            try {
              await fetch("/api/auth/google/disconnect", { method: "POST" });
              setStatus({ connected: false, email: null });
            } finally {
              setDisconnecting(false);
            }
          }}
          disabled={disconnecting}
          className="text-red-500 hover:text-red-700 mt-1"
        >
          {disconnecting ? "Disconnecting..." : "Disconnect"}
        </button>
      </div>
    );
  }

  return (
    <a
      href="/api/auth/google"
      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
    >
      <ExternalLink size={14} />
      Connect Google Sheets
    </a>
  );
}

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
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then(setUser)
      .catch(() => router.push("/admin/login"));
  }, [pathname, router]);

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  if (!user) return null;

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    toast.success("Session ended");
    router.push("/admin/login");
  }

  return (
    <div className="min-h-dvh flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-muted border-r border-border transform transition-transform lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-display font-bold">AutoLead</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-brand-600 text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-border"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border px-3 py-2">
          <GoogleConnectSection />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden border-b border-border p-4 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <span className="font-display font-bold">AutoLead</span>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
