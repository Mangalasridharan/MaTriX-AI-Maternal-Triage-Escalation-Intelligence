"use client";
import { RiskResult } from "@/lib/api";
import { Zap, ShieldAlert, AlertTriangle, Info } from "lucide-react";

const RISK_META = {
  low:      { color: "text-cyan-400",     border: "border-cyan-500/30", bg: "bg-cyan-500/10", shadow: "shadow-[0_0_40px_rgba(6,182,212,0.15)]" },
  moderate: { color: "text-orange-300",  border: "border-orange-500/30", bg: "bg-orange-500/10", shadow: "shadow-[0_0_40px_rgba(249,115,22,0.15)]" },
  high:     { color: "text-amber-400",    border: "border-amber-500/30", bg: "bg-amber-500/10", shadow: "shadow-[0_0_40px_rgba(245,158,11,0.2)]" },
  severe:   { color: "text-rose-500",     border: "border-rose-500/40", bg: "bg-rose-500/10", shadow: "shadow-[0_0_60px_rgba(244,63,94,0.25)]" },
};

export function RiskCard({ risk }: { risk: RiskResult }) {
  const meta = RISK_META[risk.risk_level as keyof typeof RISK_META] ?? RISK_META.moderate;
  const pct = Math.round(risk.risk_score);
  const conf = Math.round(risk.confidence * 100);

  return (
    <div className={`spatial-panel p-8 relative overflow-hidden transition-all duration-1000 ${meta.border} ${meta.bg} ${meta.shadow}`}>
      
      {/* Background Ambient Glow for Severe */}
      {risk.risk_level === "severe" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-rose-500/20 blur-[100px] pointer-events-none rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
      )}

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Core Metric (Left) */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 md:pr-8">
          <p className="label-mono mb-2">AI Risk Index</p>
          <div className="relative">
            <span className={`text-8xl md:text-9xl font-black tracking-tighter ${meta.color} drop-shadow-lg`}>
              {pct}
            </span>
            <span className="absolute top-2 -right-4 text-2xl text-white/30">%</span>
          </div>
          
          <div className={`mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${meta.border} bg-black/40 backdrop-blur-md`}>
            {risk.risk_level === 'severe' ? <ShieldAlert size={14} className={meta.color} /> : <Info size={14} className={meta.color} />}
            <span className={`text-sm uppercase tracking-widest font-bold ${meta.color}`}>{risk.risk_level} Risk</span>
          </div>
        </div>

        {/* Details & Actions (Right) */}
        <div className="md:col-span-8 space-y-8">
          
          {/* Top row: Reasoning & Confidence */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-2 space-y-2">
              <p className="label-mono flex items-center gap-2">Clinical Reasoning</p>
              <p className="text-white/80 leading-relaxed font-light text-lg">{risk.reasoning}</p>
            </div>
            
            <div className="space-y-2 border-l border-white/10 pl-6 border-t sm:border-t-0 pt-6 sm:pt-0">
              <p className="label-mono">Model Confidence</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-light text-white">{conf}</span>
                <span className="text-lg text-white/40 mb-1">%</span>
              </div>
              <div className="w-full h-1 bg-white/10 mx-1 rounded-full overflow-hidden mt-2">
                <div className={`h-full ${meta.color.replace('text-', 'bg-')}`} style={{ width: `${conf}%` }} />
              </div>
            </div>
          </div>

          {/* Bottom row: Immeditate Actions */}
          {risk.immediate_actions?.length > 0 && (
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className={meta.color} />
                <p className={`label-mono ${meta.color}`}>Immediate Local Actions</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {risk.immediate_actions.map((action, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/[0.02] p-4 rounded-2xl border border-white/[0.03]">
                    <span className="text-white/20 font-mono text-xs mt-1">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-sm text-white/70 leading-relaxed">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
