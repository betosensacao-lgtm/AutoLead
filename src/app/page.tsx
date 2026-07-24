import Link from "next/link";
import { ArrowRight, Bot, Workflow, Zap, Cpu, Activity, LayoutGrid } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Workflow className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              FlowAI
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/admin/dashboard"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/chat"
              className="group flex items-center gap-2 text-sm bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-5 py-2.5 rounded-full font-semibold hover:opacity-90 transition-all shadow-lg shadow-cyan-500/20"
            >
              Gerar Workflow IA
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-8">
          <Zap className="w-4 h-4 fill-current" />
          Hub de Automação de Workflows com n8n + LangGraph
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold max-w-4xl leading-tight tracking-tight">
          Crie e Monitore{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400">
            Workflows Inteligentes
          </span>{" "}
          em Segundos
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mt-8 leading-relaxed">
          O FlowAI combina o poder dos agentes de IA com o motor do n8n para gerar, otimizar e executar automações complexas em linguagem natural.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-12">
          <Link
            href="/chat"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl shadow-cyan-500/25 hover:scale-105 transition-all"
          >
            Experimentar Gerador IA
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/admin/dashboard"
            className="flex items-center justify-center px-8 py-4 rounded-full font-semibold text-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-colors"
          >
            Ver Workflows Ativos
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mt-28">
          {[
            {
              icon: Cpu,
              title: "Gerador de Workflow por IA",
              desc: "Descreva seu objetivo em linguagem natural e o agente LangGraph cria os nós e conexões do n8n automaticamente.",
              color: "text-cyan-400",
              bg: "bg-cyan-400/10",
            },
            {
              icon: Activity,
              title: "Execução & Monitoramento",
              desc: "Acompanhe a saúde, os logs e a taxa de sucesso das execuções de cada automação em tempo real.",
              color: "text-purple-400",
              bg: "bg-purple-400/10",
            },
            {
              icon: LayoutGrid,
              title: "Galeria de Templates n8n",
              desc: "Acesse modelos pré-construídos para qualificação de leads, relatórios RAG, notificações e webhooks.",
              color: "text-teal-400",
              bg: "bg-teal-400/10",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="border border-slate-800 bg-slate-900/40 backdrop-blur-md rounded-3xl p-8 text-left transition-all hover:border-slate-700 hover:bg-slate-900/80"
            >
              <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-semibold text-xl mb-3 text-slate-100">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
          <p>© 2026 FlowAI — Automation Intelligence. Todos os direitos reservados.</p>
          <div className="flex gap-4 text-xs">
            <span className="hover:text-slate-300 cursor-pointer">n8n Engine</span>
            <span className="hover:text-slate-300 cursor-pointer">LangGraph AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
