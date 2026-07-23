"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Activity, X } from "lucide-react";

export function RealtimeDashboard() {
  const [lastEvent, setLastEvent] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel("autolead-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "autolead", table: "leads" },
        (payload) => {
          console.log("Change received on leads!", payload);
          setLastEvent({ type: "lead", data: payload });
          setIsVisible(true);
          toast.info(`Status do Lead atualizado: ${(payload.new as any)?.name || "Desconhecido"}`);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "autolead", table: "lead_messages" },
        (payload) => {
          console.log("Change received on lead_messages!", payload);
          setLastEvent({ type: "message", data: payload });
          setIsVisible(true);
          toast.success(`Nova mensagem de Lead processada!`);
        }
      )
      .subscribe((status) => {
        console.log("Supabase Realtime Status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!isVisible || !lastEvent) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-orange-950/90 backdrop-blur-md border border-orange-700/50 p-4 rounded-xl shadow-2xl z-50 animate-in slide-in-from-bottom-4 w-80">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-orange-400 animate-pulse" />
          <h4 className="text-sm font-semibold text-white">Live Update</h4>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-orange-400/70 hover:text-white transition">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="bg-black/50 p-2 rounded border border-orange-900 max-h-40 overflow-auto">
        <pre className="text-xs text-orange-300 font-mono">
          {JSON.stringify(lastEvent.data.new || lastEvent.data.old, null, 2)}
        </pre>
      </div>
    </div>
  );
}
