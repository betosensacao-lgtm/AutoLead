"use client";

import { useState, useRef, useEffect } from "react";
import { Workflow, Send, Bot, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "agent";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content:
        "Olá! Sou o assistente de inteligência de automação do FlowAI. Como posso te ajudar a criar, integrar ou otimizar seus workflows no n8n hoje?",
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
        { role: "agent", content: data.reply || "Workflow gerado e registrado no sistema." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "Desculpe, ocorreu um erro ao consultar o agente FlowAI. Tente novamente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex flex-col max-w-4xl mx-auto bg-slate-950 text-slate-100 font-sans border-x border-slate-800 shadow-2xl">
      {/* Header */}
      <header className="border-b border-slate-800 p-4 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-white p-1">
            <ArrowLeft size={18} />
          </Link>
          <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Workflow className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-100 flex items-center gap-2">
              FlowAI Workflow Agent <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </h1>
            <p className="text-xs text-slate-400">Automação de fluxos n8n via LangGraph IA</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 text-sm ${msg.role === "agent" ? "justify-start" : "justify-end"}`}
          >
            {msg.role === "agent" && (
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-xl rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === "agent"
                  ? "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none"
                  : "bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-br-none shadow-lg shadow-cyan-600/20"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 items-center text-xs text-slate-500">
            <div className="w-6 h-6 rounded-full border border-cyan-500/30 border-t-cyan-400 animate-spin" />
            Gerando automação n8n...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-slate-800 p-4 bg-slate-900/50 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex: Crie um workflow que recebe leads por Webhook e envia no Slack e HubSpot..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-800 bg-slate-900 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-5 py-3 rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/20"
        >
          <Send className="w-4 h-4" />
          Enviar
        </button>
      </form>
    </div>
  );
}
