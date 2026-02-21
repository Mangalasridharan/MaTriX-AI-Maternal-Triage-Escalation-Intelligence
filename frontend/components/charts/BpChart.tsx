"use client";
import { BpPoint } from "@/lib/api";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface Props { data: BpPoint[]; patientName?: string; }

export function BpChart({ data, patientName }: Props) {
  const formatted = [...data].reverse().map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    Systolic: d.systolic, Diastolic: d.diastolic,
  }));

  const lastSys = data[0]?.systolic ?? null;
  const isCritical = lastSys !== null && lastSys >= 160;
  const isHigh     = lastSys !== null && lastSys >= 140 && lastSys < 160;

  return (
    <div id="bp-chart" className={`bento-tile space-y-4 ${isCritical ? "glow-red" : isHigh ? "glow-amber" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="label-sm">Blood Pressure Trend</p>
          {patientName && <p className="text-xs text-slate-600 mt-0.5">{patientName}</p>}
        </div>
        {lastSys !== null && (
          <div className={`flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1 border
            ${isCritical ? "bg-rose-500/15 border-rose-500/30 text-rose-400" :
              isHigh ? "bg-amber-500/15 border-amber-500/30 text-amber-400" :
              "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"}`}>
            <TrendingUp size={11} /> {lastSys}/{data[0]?.diastolic} mmHg
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="h-40 flex items-center justify-center">
          <p className="text-slate-700 text-xs">No BP history recorded yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={formatted} margin={{ top: 5, right: 12, left: -26, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 10 }} />
            <YAxis domain={[40, 220]} tick={{ fill: "#475569", fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: "#94a3b8" }} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
            <ReferenceLine y={160} stroke="#ef4444" strokeDasharray="4 3"
              label={{ value: "Severe ≥160", fill: "#ef4444", fontSize: 9, position: "insideTopRight" }} />
            <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="4 3"
              label={{ value: "High ≥140", fill: "#f59e0b", fontSize: 9, position: "insideTopRight" }} />
            <Line type="monotone" dataKey="Systolic" stroke="#f43f5e" strokeWidth={2.5}
              dot={{ r: 4, fill: "#f43f5e", strokeWidth: 0 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Diastolic" stroke="#818cf8" strokeWidth={2}
              dot={{ r: 3, fill: "#818cf8", strokeWidth: 0 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
