"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Legend,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

const RISK_COLORS: Record<string, string> = {
  low: "#10b981", moderate: "#f59e0b", high: "#f97316", severe: "#ef4444"
};

export default function AnalyticsPage() {
  const { data: history, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: () => apiClient.getHistory(0, 100),
  });

  /* Derive risk distribution */
  const riskDist = ["low", "moderate", "high", "severe"].map((level) => ({
    level, count: history?.filter((h) => h.risk_level === level).length ?? 0,
    color: RISK_COLORS[level],
  }));

  /* Score trend — last 15 cases */
  const scoreTrend = [...(history ?? [])].reverse().slice(-15).map((h, i) => ({
    case: `#${i + 1}`, score: Math.round(h.risk_score),
    level: h.risk_level,
    name: h.patient_name.split(" ")[0],
  }));

  /* Escalation pie */
  const escPie = [
    { name: "Local",     value: history?.filter((h) => !h.escalated).length ?? 0, color: "#10b981" },
    { name: "Escalated", value: history?.filter((h) => h.escalated).length  ?? 0, color: "#ef4444" },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="heading-lg">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Risk distribution, score trends, and escalation rates</p>
      </div>

      {/* Row 1 — Score trend + Escalation pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Risk score trend (Recharts LineChart) */}
        <div className="bento-tile lg:col-span-2 space-y-3">
          <p className="label-sm">Risk Score Trend — Last 15 Cases</p>
          {isLoading ? <div className="shimmer h-48 w-full rounded-xl" />
            : scoreTrend.length === 0
              ? <p className="text-slate-600 text-xs py-12 text-center">No data yet</p>
              : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={scoreTrend} margin={{ top: 5, right: 8, left: -28, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#475569", fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10, fontSize: 12 }}
                      labelStyle={{ color: "#94a3b8" }} />
                    <ReferenceLine y={70} stroke="#f97316" strokeDasharray="4 3" label={{ value: "High", fill: "#f97316", fontSize: 9, position: "right" }} />
                    <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="4 3" label={{ value: "Severe", fill: "#ef4444", fontSize: 9, position: "right" }} />
                    <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2.5}
                      dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 2, stroke: "#1e1b4b" }}
                      activeDot={{ r: 6 }} name="Risk Score" />
                  </LineChart>
                </ResponsiveContainer>
              )}
        </div>

        {/* Escalation pie */}
        <div className="bento-tile flex flex-col items-center justify-center gap-3">
          <p className="label-sm">Escalation Split</p>
          {isLoading ? <div className="shimmer w-32 h-32 rounded-full" />
            : (
              <>
                <PieChart width={130} height={130}>
                  <Pie data={escPie} cx={60} cy={60} innerRadius={38} outerRadius={58}
                    dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                    {escPie.map((e, i) => <Cell key={i} fill={e.color} opacity={0.9} />)}
                  </Pie>
                </PieChart>
                <div className="flex gap-4 text-xs">
                  {escPie.map((e) => (
                    <div key={e.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: e.color }} />
                      <span className="text-slate-400">{e.name}</span>
                      <span className="font-bold text-white">{e.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
        </div>
      </div>

      {/* Row 2 — Risk Distribution bar chart */}
      <div className="bento-tile space-y-3">
        <p className="label-sm">Risk Level Distribution</p>
        {isLoading ? <div className="shimmer h-40 w-full rounded-xl" />
          : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={riskDist} margin={{ top: 5, right: 8, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="level" tick={{ fill: "#475569", fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: "#475569", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Cases">
                  {riskDist.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
      </div>
    </div>
  );
}
