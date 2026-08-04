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
