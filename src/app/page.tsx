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
