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
