"use client";

import { useState } from "react";
import { Workflow, PlayCircle, CheckCircle2, AlertCircle, Cpu, Zap, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface WorkflowItem {
  id: string;
  name: string;
  triggerType: string;
  status: "ACTIVE" | "PAUSED" | "DRAFT";
  nodesCount: number;
  lastRun: string;
  successRate: number;
}

const DEMO_WORKFLOWS: WorkflowItem[] = [
  {
    id: "wf-1",
    name: "Qualificação de Leads Webhook -> HubSpot",
    triggerType: "WEBHOOK",
    status: "ACTIVE",
    nodesCount: 5,
    lastRun: "há 2 min",
    successRate: 99.4,
  },
  {
    id: "wf-2",
    name: "Gerador de Relatórios RAG agendado",
    triggerType: "SCHEDULE",
    status: "ACTIVE",
    nodesCount: 4,
    lastRun: "há 1 hora",
    successRate: 100,
  },
  {
    id: "wf-3",
    name: "Notificação Urgente no Slack via Agente IA",
    triggerType: "AI_AGENT",
    status: "ACTIVE",
    nodesCount: 3,
    lastRun: "há 15 min",
    successRate: 98.1,
  },
  {
    id: "wf-4",
    name: "Sync de Documentos DocMind -> Google Drive",
    triggerType: "EVENT",
    status: "PAUSED",
    nodesCount: 6,
    lastRun: "ontem",
    successRate: 95.0,
  },
];

export default function FlowAIDashboardPage() {
  const [workflows] = useState<WorkflowItem[]>(DEMO_WORKFLOWS);

  const stats = [
    { label: "Workflows Ativos", value: "8", icon: Workflow, color: "text-cyan-400" },
    { label: "Execuções Hoje", value: "1,248", icon: PlayCircle, color: "text-purple-400" },
    { label: "Taxa de Sucesso", value: "99.2%", icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Tempo Médio", value: "340ms", icon: Zap, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-8 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel de Automações FlowAI</h1>
          <p className="text-sm text-slate-400 mt-1">
            Gestão de fluxos n8n, monitoramento de execuções e agente de IA
          </p>
        </div>
        <Link
          href="/chat"
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all"
        >
          <Cpu className="w-4 h-4" />
          Gerar Novo Workflow IA
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border border-slate-800 bg-slate-900/50 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Workflows Table */}
      <div className="border border-slate-800 bg-slate-900/40 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-sm text-slate-200">Workflows n8n Configurados</h2>
          <span className="text-xs text-slate-400">n8n Engine: Conectado</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-3 font-medium">Nome do Workflow</th>
                <th className="text-center px-6 py-3 font-medium">Gatilho</th>
                <th className="text-center px-6 py-3 font-medium">Nós</th>
                <th className="text-center px-6 py-3 font-medium">Status</th>
                <th className="text-center px-6 py-3 font-medium">Taxa de Sucesso</th>
                <th className="text-right px-6 py-3 font-medium">Última Execução</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {workflows.map((wf) => (
                <tr key={wf.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                        <Workflow className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{wf.name}</p>
                        <p className="text-xs text-slate-500">{wf.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-md font-mono">
                      {wf.triggerType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-400 text-xs font-mono">
                    {wf.nodesCount} nós
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        wf.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {wf.status === "ACTIVE" ? "Ativo" : "Pausado"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-semibold text-slate-300">
                    {wf.successRate}%
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400 text-xs">
                    {wf.lastRun}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
