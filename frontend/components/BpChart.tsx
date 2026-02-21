"use client";
import { BpPoint } from "@/lib/api";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Legend,
} from "recharts";

export function BpChart({ data }: { data: BpPoint[] }) {
  const formatted = [...data].reverse().map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    systolic: d.systolic,
    diastolic: d.diastolic,
  }));

  return (
    <div id="bp-chart" className="glass-card p-6">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">BP Trend</h2>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={formatted} margin={{ top: 5, right: 10, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 11 }} />
          <YAxis domain={[40, 220]} tick={{ fill: "#64748b", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12 }}
            labelStyle={{ color: "#94a3b8" }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
          {/* Danger reference lines */}
          <ReferenceLine y={160} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: "160 (severe)", fill: "#f43f5e", fontSize: 10 }} />
          <ReferenceLine y={140} stroke="#fb923c" strokeDasharray="4 4" label={{ value: "140 (high)", fill: "#fb923c", fontSize: 10 }} />
          <Line type="monotone" dataKey="systolic" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4, fill: "#f43f5e" }} name="Systolic" />
          <Line type="monotone" dataKey="diastolic" stroke="#818cf8" strokeWidth={2} dot={{ r: 4, fill: "#818cf8" }} name="Diastolic" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
