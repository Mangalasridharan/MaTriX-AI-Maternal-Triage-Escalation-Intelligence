"use client";
import { RiskResult } from "@/lib/api";
import { TrendingUp, TrendingDown, Minus, Zap } from "lucide-react";

/* ── Bento-Box Metric Grid — Vercel/Linear design method ────────────
   4 metric tiles arranged in a bento layout:
   - Big gauge tile (spans 2 rows)
   - Risk level tile  
   - Confidence bar tile
   - Immediate actions tile
────────────────────────────────────────────────────────────────────── */

const RISK_META = {
  low:      { color: "#10b981", label: "Low Risk",     bg: "rgba(16,185,129,0.12)" },
  moderate: { color: "#f59e0b", label: "Moderate Risk",bg: "rgba(245,158,11,0.12)" },
  high:     { color: "#f97316", label: "High Risk",    bg: "rgba(249,115,22,0.12)" },
  severe:   { color: "#ef4444", label: "Severe Risk",  bg: "rgba(239,68,68,0.15)"  },
};

export function RiskCard({ risk }: { risk: RiskResult }) {
  const meta   = RISK_META[risk.risk_level as keyof typeof RISK_META] ?? RISK_META.moderate;
  const pct    = Math.round(risk.risk_score);
  const R      = 56;
  const circ   = 2 * Math.PI * R;
  const dash   = (pct / 100) * circ;
  const conf   = Math.round(risk.confidence * 100);

  const TrendIcon = pct >= 70 ? TrendingUp : pct >= 40 ? Minus : TrendingDown;
  const glowClass = { low: "glow-green", moderate: "glow-amber", high: "glow-orange", severe: "glow-red" }[risk.risk_level] ?? "";

  return (
    <div id="risk-card" className="space-y-3">
      <p className="label-sm">AI Risk Assessment</p>

      {/* Bento grid */}
      <div className="grid grid-cols-3 grid-rows-2 gap-3">

        {/* TILE 1 — SVG gauge (spans 2 rows × 1 col) */}
        <div className={`bento-tile row-span-2 flex flex-col items-center justify-center gap-3 ${glowClass} severity-${risk.risk_level}`}>
          <div className="relative w-36 h-36">
            {/* Outer ping for severe */}
            {risk.risk_level === "severe" && (
              <div className="absolute inset-0 rounded-full border-2 border-rose-500/30 animate-ping-slow" />
            )}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              {/* Track */}
              <circle cx="64" cy="64" r={R} fill="none" stroke="#1e293b" strokeWidth="8" />
              {/* Fill */}
              <circle cx="64" cy="64" r={R} fill="none" stroke={meta.color} strokeWidth="8"
                strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 6px ${meta.color}66)`, transition: "stroke-dasharray 1s ease" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black tabular-nums" style={{ color: meta.color }}>{pct}</span>
              <span className="text-[10px] text-slate-600 font-medium mt-0.5">Risk Score</span>
            </div>
          </div>
          <span className={`badge badge-${risk.risk_level}`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
            {meta.label}
          </span>
        </div>

        {/* TILE 2 — Confidence */}
        <div className="stat-card col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="label-xs">Confidence</p>
              <div className="stat-value mt-1 text-white">{conf}<span className="text-sm text-slate-500 font-normal">%</span></div>
            </div>
            <div className={`stat-delta ${conf >= 70 ? "down" : "up"}`}>
              <TrendIcon size={11} />
              {conf >= 70 ? "High" : conf >= 50 ? "Med" : "Low"}
            </div>
          </div>
          <div className="progress-track h-1.5 mt-auto">
            <div className="progress-fill h-1.5" style={{ width: `${conf}%`, background: meta.color }} />
          </div>
        </div>

        {/* TILE 3 — Reasoning */}
        <div className="bento-tile col-span-2 flex flex-col gap-2">
          <p className="label-xs">Clinical Reasoning</p>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{risk.reasoning}</p>
        </div>

        {/* TILE 4 — FULL WIDTH — Immediate actions */}
        {risk.immediate_actions?.length > 0 && (
          <div className="bento-tile col-span-3 space-y-2.5">
            <div className="flex items-center gap-2">
              <Zap size={13} className="text-amber-400" />
              <p className="label-xs text-amber-400">Immediate Actions</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {risk.immediate_actions.slice(0, 4).map((action, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-violet-500 mt-0.5 flex-shrink-0 font-bold text-[10px]">{String(i+1).padStart(2,"0")}</span>
                  <span className="leading-relaxed">{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
