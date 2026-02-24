"use client";
import { CaseResult } from "@/lib/api";
import { CloudLightning, CheckCircle, Clock } from "lucide-react";

export function EscalationBanner({ result }: { result: CaseResult }) {
  if (!result.escalated) {
    return (
      <div className="spatial-panel p-6 border-cyan-500/20 bg-cyan-500/[0.02]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center">
            <CheckCircle size={20} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-medium text-cyan-400">Manageable Locally</h3>
            <p className="text-slate-400 mt-1 font-light">Follow WHO guidelines. No cloud escalation required.</p>
          </div>
        </div>
      </div>
    );
  }

  const plan = result.executive_output;
  return (
    <div className="relative mt-8">
      {/* Massive underlying glow for escalation */}
      <div className="absolute inset-0 bg-rose-500/10 blur-[80px] rounded-3xl pointer-events-none animate-pulse" style={{ animationDuration: '3s' }} />
      
      <div className="spatial-panel border-rose-500/30 overflow-hidden relative z-10">
        
        {/* Header Ribbon */}
        <div className="bg-rose-500/10 border-b border-rose-500/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-500 rounded-full blur-md opacity-50 animate-ping-slow" />
              <div className="relative w-12 h-12 rounded-full border border-rose-500 bg-rose-900/50 flex items-center justify-center">
                <CloudLightning size={20} className="text-rose-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold tracking-tight text-white drop-shadow-md">CLOUD ESCALATION</h3>
                {result.mode === "offline" && (
                  <span className="px-3 py-1 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30 text-[10px] uppercase tracking-widest font-bold">
                    Offline Fallback
                  </span>
                )}
                {plan?.referral_priority && (
                  <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] uppercase tracking-widest font-bold">
                    {plan.referral_priority} Priority
                  </span>
                )}
              </div>
              <p className="text-rose-200/60 text-sm font-light">{result.escalation_reason}</p>
            </div>
          </div>

          {plan?.time_to_transfer_hours && (
            <div className="flex items-center gap-3 pl-4 sm:border-l border-rose-500/20">
              <Clock size={24} className="text-rose-400/50" />
              <div>
                <p className="text-3xl font-black text-rose-400 tracking-tighter shadow-rose-500 drop-shadow-md">{plan.time_to_transfer_hours}h</p>
                <p className="label-mono text-rose-200/50">Transfer</p>
              </div>
            </div>
          )}
        </div>

        {plan && (
          <div className="p-6 space-y-6">
            {/* Executive Summary */}
            <div>
              <p className="label-mono text-rose-400 mb-2 ml-1">Executive Summary</p>
              <p className="text-lg md:text-xl font-light text-white/90 leading-relaxed max-w-4xl break-words whitespace-pre-wrap">"{plan.executive_summary}"</p>
            </div>

            {/* Matrix Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-rose-500/10">
              <div className="space-y-2 p-4 rounded-xl bg-black/40 border border-white/5 hover:border-violet-500/30 transition-colors">
                <p className="label-mono text-violet-400">Care Plan</p>
                <p className="text-sm font-light text-white/70 leading-relaxed break-words whitespace-pre-wrap">{plan.care_plan}</p>
              </div>
              <div className="space-y-2 p-4 rounded-xl bg-black/40 border border-white/5 hover:border-sky-500/30 transition-colors">
                <p className="label-mono text-sky-400">In-Transit Care</p>
                <p className="text-sm font-light text-white/70 leading-relaxed break-words whitespace-pre-wrap">{plan.in_transit_care || "Continuous monitoring during transport."}</p>
              </div>
              <div className="space-y-2 p-4 rounded-xl bg-black/40 border border-white/5 hover:border-amber-500/30 transition-colors">
                <p className="label-mono text-amber-400">Facility Required</p>
                <p className="text-sm font-light text-white/70 leading-relaxed break-words whitespace-pre-wrap">{plan.receiving_facility_requirements || "Tertiary obstetric unit."}</p>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-white/5 bg-white/[0.01] inline-block">
              <p className="text-xs font-mono text-white/40 break-words whitespace-pre-wrap"><span className="text-white/60">JUSTIFICATION:</span> {plan.justification}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
