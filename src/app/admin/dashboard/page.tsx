"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp, Flame, MessageSquare } from "lucide-react";

interface Stats {
  totalLeads: number;
  todayLeads: number;
  hotLeads: number;
  totalMessages: number;
  avgScore: number;
  stageDistribution: { stage: string; count: number }[];
  channelDistribution: { channel: string; count: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  const cards = [
    { label: "Total Leads", value: stats?.totalLeads ?? 0, icon: Users, color: "text-blue-600" },
    { label: "Today", value: stats?.todayLeads ?? 0, icon: TrendingUp, color: "text-green-600" },
    { label: "Hot Leads", value: stats?.hotLeads ?? 0, icon: Flame, color: "text-orange-600" },
    { label: "Messages", value: stats?.totalMessages ?? 0, icon: MessageSquare, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your lead generation performance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="border border-border rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="font-display text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-border rounded-xl p-4">
          <h2 className="font-display font-semibold mb-4">Lead Stages</h2>
          {stats?.stageDistribution.length ? (
            <div className="space-y-3">
              {stats.stageDistribution.map((item) => (
                <div key={item.stage} className="flex items-center gap-3">
                  <span className="text-sm w-28 font-medium">{item.stage}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-brand-600 rounded-full h-2 transition-all"
                      style={{
                        width: `${(item.count / Math.max(...stats.stageDistribution.map((s) => s.count))) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No leads yet</p>
          )}
        </div>

        <div className="border border-border rounded-xl p-4">
          <h2 className="font-display font-semibold mb-4">Channels</h2>
          {stats?.channelDistribution.length ? (
            <div className="space-y-3">
              {stats.channelDistribution.map((item) => (
                <div key={item.channel} className="flex items-center gap-3">
                  <span className="text-sm w-28 font-medium capitalize">{item.channel}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 rounded-full h-2 transition-all"
                      style={{
                        width: `${(item.count / Math.max(...stats.channelDistribution.map((s) => s.count))) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
