"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  stage: string;
  score: number;
  scoreCategory: string;
  channel: string;
  createdAt: string;
}

const stageColors: Record<string, string> = {
  NEW: "bg-gray-100 text-gray-800",
  CAPTURED: "bg-blue-100 text-blue-800",
  QUALIFYING: "bg-yellow-100 text-yellow-800",
  QUALIFIED: "bg-green-100 text-green-800",
  NURTURING: "bg-purple-100 text-purple-800",
  HOT: "bg-orange-100 text-orange-800",
  CONVERTED: "bg-emerald-100 text-emerald-800",
  LOST: "bg-red-100 text-red-800",
};

const scoreColors: Record<string, string> = {
  COLD: "text-blue-600",
  WARM: "text-yellow-600",
  HOT: "text-orange-600",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (stageFilter) params.set("stage", stageFilter);
    params.set("page", String(page));

    fetch(`/api/admin/leads?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setLeads(data.leads);
        setTotalPages(data.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, stageFilter, page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Leads</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and monitor your leads
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search leads..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
        >
          <option value="">All stages</option>
          <option value="NEW">New</option>
          <option value="CAPTURED">Captured</option>
          <option value="QUALIFYING">Qualifying</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="NURTURING">Nurturing</option>
          <option value="HOT">Hot</option>
          <option value="CONVERTED">Converted</option>
          <option value="LOST">Lost</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground animate-pulse">Loading...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="border border-border rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No leads found</p>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Company</th>
                <th className="text-left p-3 font-medium">Stage</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Score</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Channel</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="p-3">
                    <Link href={`/admin/leads/${lead.id}`} className="hover:text-brand-600 transition-colors">
                      <span className="font-medium">{lead.name ?? "Unknown"}</span>
                      {lead.email && (
                        <p className="text-xs text-muted-foreground">{lead.email}</p>
                      )}
                    </Link>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">
                    {lead.company ?? "—"}
                  </td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${stageColors[lead.stage] ?? "bg-gray-100"}`}>
                      {lead.stage}
                    </span>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <span className={`font-medium ${scoreColors[lead.scoreCategory] ?? ""}`}>
                      {lead.score}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground capitalize hidden lg:table-cell">
                    {lead.channel}
                  </td>
                  <td className="p-3 text-muted-foreground text-xs hidden lg:table-cell">
                    {formatDate(new Date(lead.createdAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
