"use client";
import { HistoryItem } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { RefreshCw, AlertTriangle } from "lucide-react";

const BADGE_STYLE: Record<string, string> = {
  low: "badge-low", moderate: "badge-moderate",
  high: "badge-high", severe: "badge-severe",
};

export function HistoryTable({ onSelect }: { onSelect: (id: string) => void }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["history"],
    queryFn: () => apiClient.getHistory(),
  });

  return (
    <div id="history-table" className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Case History</h2>
        <button onClick={() => refetch()} className="text-slate-500 hover:text-violet-400 transition-colors">
          <RefreshCw size={15} />
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        </div>
      )}

      {data && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
                <th className="text-left pb-2">Patient</th>
                <th className="text-left pb-2">Date</th>
                <th className="text-left pb-2">Risk</th>
                <th className="text-left pb-2">Score</th>
                <th className="text-left pb-2">Escalated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.map((item) => (
                <tr key={item.visit_id}
                  onClick={() => onSelect(item.visit_id)}
                  className="cursor-pointer hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 font-medium text-slate-200">{item.patient_name}</td>
                  <td className="py-2.5 text-slate-500 text-xs">
                    {new Date(item.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="py-2.5">
                    <span className={`${BADGE_STYLE[item.risk_level] || ""} px-2 py-0.5 rounded-full text-xs font-semibold uppercase`}>
                      {item.risk_level}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-300">{Math.round(item.risk_score)}</td>
                  <td className="py-2.5">
                    {item.escalated
                      ? <AlertTriangle size={14} className="text-rose-400" />
                      : <span className="text-slate-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
