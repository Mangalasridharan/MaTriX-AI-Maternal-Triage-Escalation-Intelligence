"use client";
import { CaseResult, ExecutivePlan } from "@/lib/api";
import { CloudLightning, CheckCircle, AlertTriangle, Clock, Building2, Truck } from "lucide-react";

/* ── System Notification Drawer — macOS/iOS alert design method ─────
   Safe: compact green confirmation banner
   Escalated: expanding red drawer with sections:
     - Header bar with severity badge
     - Executive summary (prominent)
     - Three info panels (care plan, transfer, facility)
────────────────────────────────────────────────────────────────────── */

export function EscalationBanner({ result }: { result: CaseResult }) {
  if (!result.escalated) {
    return (
      <div id="escalation-banner-safe"
        className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] glow-green">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
          <CheckCircle size={18} className="text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-emerald-400">Case manageable locally</p>
          <p className="text-xs text-slate-500 mt-0.5">No cloud escalation required. Serving from Edge Swarm.</p>
        </div>
        <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
          Local Decision
        </span>
      </div>
    );
  }

  const plan = result.executive_output;
  return (
    <div id="escalation-banner-active" className="alert-drawer glow-red">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-rose-500/20"
        style={{ background: "linear-gradient(90deg, rgba(239,68,68,0.12) 0%, transparent 60%)" }}>
        <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center flex-shrink-0 animate-ping-slow"
          style={{ animationDelay: "0ms" }}>
        </div>
        <div className="absolute">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
            <CloudLightning size={17} className="text-rose-400" />
          </div>
        </div>
        <div className="ml-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-rose-400 font-black text-sm tracking-wider uppercase">ESCALATED</span>
            <span className={`badge ${result.cloud_connected ? 'badge-severe' : 'bg-slate-700 text-slate-300'}`}>
              {result.cloud_connected ? 'Cloud-Enhanced Decision' : 'Local Decision (Offline Mode)'}
            </span>
            {plan?.referral_priority && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {plan.referral_priority} priority
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{result.escalation_reason}</p>
        </div>

        {plan?.time_to_transfer_hours && (
          <div className="ml-auto flex items-center gap-1.5 bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-2 flex-shrink-0">
            <Clock size={13} className="text-slate-400" />
            <div>
              <p className="text-lg font-black text-white leading-none">{plan.time_to_transfer_hours}h</p>
              <p className="text-[9px] text-slate-600 leading-none mt-0.5">Transfer</p>
            </div>
          </div>
        )}
      </div>

      {plan && (
        <div className="p-5 space-y-4">
          {/* Executive Summary */}
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4">
            <p className="label-xs text-rose-400 mb-2">Executive Summary (27B Model)</p>
            <p className="text-sm text-slate-300 leading-relaxed">{plan.executive_summary}</p>
          </div>

          {/* Three info panels */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Care Plan */}
            <div className="bento-tile border-l-[3px] border-l-violet-500">
              <p className="label-xs text-violet-400 mb-2">Care Plan</p>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-5">{plan.care_plan}</p>
            </div>

            {/* In-Transit */}
            <div className="bento-tile border-l-[3px] border-l-sky-500">
              <div className="flex items-center gap-1.5 mb-2">
                <Truck size={11} className="text-sky-400" />
                <p className="label-xs text-sky-400">In-Transit Care</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-5">
                {plan.in_transit_care || "Continuous monitoring during transport."}
              </p>
            </div>

            {/* Facility */}
            <div className="bento-tile border-l-[3px] border-l-amber-500">
              <div className="flex items-center gap-1.5 mb-2">
                <Building2 size={11} className="text-amber-400" />
                <p className="label-xs text-amber-400">Facility Required</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-5">
                {plan.receiving_facility_requirements || "Tertiary obstetric unit."}
              </p>
            </div>
          </div>

          {/* Justification */}
          <div className="flex items-start gap-2.5 text-xs text-slate-500 bg-slate-900/40 rounded-xl px-4 py-3 border border-slate-800/60">
            <AlertTriangle size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <span><span className="text-slate-400 font-semibold">Justification:</span> {plan.justification}</span>
          </div>
        </div>
      )}
    </div>
  );
}
