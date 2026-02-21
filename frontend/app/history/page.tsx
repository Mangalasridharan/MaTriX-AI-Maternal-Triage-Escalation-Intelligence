"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import { RefreshCw, Activity, ArrowRight } from "lucide-react";

export default function HistoryPage() {
  const router = useRouter();
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["history"],
    queryFn: () => apiClient.getHistory(0, 50),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-20">
      
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-10 border-b border-white/[0.05] pb-8">
        <div>
          <h1 className="title-hero">Intake Log</h1>
          <p className="label-mono mt-4 text-white/50">Historical Triage Records</p>
        </div>
        <button onClick={() => refetch()} disabled={isFetching}
          className={`spatial-btn px-6 py-3 border border-white/10 hover:bg-white/[0.02] text-sm flex items-center gap-2 transition-all ${isFetching ? 'opacity-50' : ''}`}>
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} /> Sync Log
        </button>
      </div>

      {isLoading && (
        <div className="space-y-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex gap-6 py-4 border-b border-white/[0.02]">
              <div className="shimmer w-24 h-6 rounded opacity-10" />
              <div className="flex-1 space-y-3">
                <div className="shimmer w-48 h-6 rounded opacity-10" />
                <div className="shimmer w-32 h-4 rounded opacity-10" />
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.length === 0 && (
        <div className="py-32 text-center">
          <div className="w-20 h-20 rounded-full border border-white/5 flex items-center justify-center mx-auto mb-6 bg-white/[0.01]">
            <Activity size={32} className="text-white/20" />
          </div>
          <p className="text-slate-400 text-lg font-light">The clinical log is stark.</p>
          <button onClick={() => router.push("/triage")} className="mt-4 label-mono text-cyan-400 hover:text-cyan-300">Initiate First Intake</button>
        </div>
      )}

      {/* Spatial Timeline */}
      <div className="space-y-2 relative">
        {data?.map((item) => {
          const isSevere = item.risk_level === 'severe';
          const isHigh = item.risk_level === 'high';
          const isModerate = item.risk_level === 'moderate';
          
          const colorCode = isSevere ? 'text-rose-400' : isHigh ? 'text-amber-400' : isModerate ? 'text-orange-300' : 'text-cyan-400';
          const bgGlow = isSevere ? 'bg-rose-500/10 border-rose-500/30' : 'bg-transparent border-transparent hover:border-white/10';

          return (
            <div key={item.visit_id} 
              onClick={() => router.push(`/triage?case=${item.visit_id}`)}
              className={`group flex flex-col md:flex-row gap-6 md:gap-12 p-6 rounded-3xl border transition-all duration-500 cursor-pointer relative overflow-hidden ${bgGlow}`}>
              
              {/* Date Column */}
              <div className="w-32 flex-shrink-0 flex flex-col pt-1">
                <span className="text-xl md:text-2xl font-light text-white/90">
                  {new Date(item.submitted_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </span>
                <span className="label-mono mt-1 text-white/30">
                  {new Date(item.submitted_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-light tracking-tight text-white">{item.patient_name}</h3>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="label-mono text-white/40">ID {item.visit_id.substring(0, 8)}</span>
                    {item.escalated && (
                      <span className="px-2 py-[2px] rounded border border-rose-500/30 bg-rose-500/10 text-[9px] font-mono text-rose-400 uppercase tracking-widest">
                        Escalated
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-8 md:text-right">
                  <div className="flex flex-col md:items-end">
                    <span className={`text-4xl font-light tabular-nums tracking-tighter ${colorCode}`}>
                      {Math.round(item.risk_score)}
                    </span>
                    <span className="label-mono mt-1 text-white/30">{item.risk_level} Risk</span>
                  </div>
                  
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-500
                    ${isSevere ? 'border-rose-500/30 group-hover:bg-rose-500/20' : 'border-white/10 group-hover:border-white/30 group-hover:bg-white/[0.02]'}`}>
                    <ArrowRight size={18} className={isSevere ? 'text-rose-400' : 'text-white/30 group-hover:text-white/70'} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
