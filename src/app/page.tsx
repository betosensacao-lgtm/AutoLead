import Link from "next/link";
import { ArrowRight, Bot, Target, Workflow, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 relative overflow-hidden">
      {/* Elementos de fundo dinâmicos (Glow) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-600/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />

      {/* Navbar Glassmorphism */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              AutoLead
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/admin/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/chat"
              className="group relative flex items-center gap-2 text-sm bg-white text-slate-950 px-5 py-2.5 rounded-full font-semibold hover:bg-slate-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Try Chat Demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center z-10 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-8 animate-slide-up">
          <Zap className="w-4 h-4 fill-current" />
          Powered by LangGraph & n8n
        </div>
        
        <h1 className="font-display text-5xl md:text-7xl font-bold max-w-4xl leading-tight tracking-tight animate-slide-up" style={{ animationDelay: "100ms" }}>
          Turn your visitors into{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">
            qualified customers
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mt-8 leading-relaxed animate-slide-up" style={{ animationDelay: "200ms" }}>
          AutoLead uses autonomous AI agents to capture, qualify (BANT), and nurture leads
          across chat, WhatsApp, and legacy systems — 24/7.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-12 animate-slide-up" style={{ animationDelay: "300ms" }}>
          <Link
            href="/chat"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-1 transition-all"
          >
            Experience the AI
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/admin/signup"
            className="flex items-center justify-center px-8 py-4 rounded-full font-semibold text-lg border border-white/10 hover:bg-white/5 transition-colors"
          >
            Create Workspace
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mt-32 animate-slide-up" style={{ animationDelay: "400ms" }}>
          {[
            {
              icon: Target,
              title: "BANT Qualification",
              desc: "Evaluate budget, authority, need, and timeline automatically with zero human intervention.",
              color: "text-brand-400",
              bg: "bg-brand-400/10"
            },
            {
              icon: Workflow,
              title: "Event-Driven Engine",
              desc: "Deep integration with n8n to connect your legacy CRMs to cutting-edge AI pipelines.",
              color: "text-indigo-400",
              bg: "bg-indigo-400/10"
            },
            {
              icon: Bot,
              title: "Multi-Channel Agents",
              desc: "Deploy LangGraph agents on WhatsApp, Email, and Web Chat with shared state memory.",
              color: "text-purple-400",
              bg: "bg-purple-400/10"
            },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="group relative border border-white/5 bg-white/5 backdrop-blur-sm rounded-3xl p-8 text-left transition-all hover:bg-white/10 hover:-translate-y-2 hover:border-white/10"
            >
              <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-display font-semibold text-xl mb-3 text-slate-100">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-500 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
          <p>© 2026 AutoLead AI. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
