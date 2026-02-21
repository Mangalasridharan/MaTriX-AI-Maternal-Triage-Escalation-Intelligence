"use client";
import { Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { HistoryItem } from "@/lib/api";

const COLORS: Record<string, string> = {
  low: "#10b981", moderate: "#f59e0b", high: "#f97316", severe: "#ef4444",
};

export function RiskDistributionChart({ data }: { data: HistoryItem[] }) {
  const distribution = ["low", "moderate", "high", "severe"].map((level) => ({
    level: level.charAt(0).toUpperCase() + level.slice(1),
    count: data.filter((d) => d.risk_level === level).length,
    fill: COLORS[level],
  }));

  const total = data.length;

  return (
    <div className="bento-tile space-y-4">
      <div className="flex items-center justify-between">
        <p className="label-sm">Risk Distribution</p>
        <span className="text-xs text-slate-600">{total} total cases</span>
      </div>

      {total === 0 ? (
        <div className="h-32 flex items-center justify-center">
          <p className="text-slate-700 text-xs">No case data available</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={distribution} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="level" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10, fontSize: 12 }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Cases">
                {distribution.map((d, i) => (
                  <Cell key={i} fill={d.fill} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Mini legend */}
          <div className="flex gap-3 flex-wrap pt-1">
            {distribution.map((d) => (
              <div key={d.level} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                {d.level} <span className="font-bold text-slate-300">{d.count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
