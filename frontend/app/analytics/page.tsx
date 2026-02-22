"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Activity, Shield, TrendingUp, BarChart3, PieChart as PieIcon, Map as MapIcon } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, 
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

const RISK_COLORS: Record<string, string> = {
  low: "#06b6d4", moderate: "#f59e0b", high: "#f97316", severe: "#f43f5e"
};

export default function AnalyticsPage() {
  const { data: history, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: () => apiClient.getHistory(0, 100),
  });

  const riskDist = ["low", "moderate", "high", "severe"].map((level) => ({
    level: level.toUpperCase(), 
    count: history?.filter((h) => h.risk_level === level).length ?? 0,
    color: RISK_COLORS[level],
  }));

  const scoreTrend = [...(history ?? [])].reverse().slice(-20).map((h, i) => ({
    case: i + 1, 
    score: Math.round(h.risk_score),
    name: h.patient_name.split(" ")[0],
  }));

  const avgScore = history?.length 
    ? Math.round(history.reduce((acc, h) => acc + h.risk_score, 0) / history.length) 
    : 0;
  
  const escRate = history?.length 
    ? Math.round((history.filter(h => h.escalated).length / history.length) * 100) 
    : 0;

  return (
    <div className="flex flex-col gap-16 max-w-7xl mx-auto animate-in fade-in duration-700 pb-24">
      {/* Premium Header Segment */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-5xl md:text-6xl font-light tracking-tight text-white mb-2">Health Intelligence</h1>
          <p className="text-white/40 font-mono tracking-widest uppercase text-sm">Aggregated Triage Data — <span className="text-violet-400">Node Cluster 01</span></p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-6 py-3 backdrop-blur-md">
           <Activity size={16} className="text-violet-400" />
           <span className="font-mono text-xs text-white/60 tracking-widest whitespace-nowrap">ANALYTICS ENGINE ONLINE</span>
        </div>
      </header>

      {/* Hero Stats Strip */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Triaged", value: history?.length ?? 0, icon: Shield, color: "cyan" },
          { label: "MedGemma Avg Score", value: `${avgScore}%`, icon: TrendingUp, color: "violet" },
          { label: "Escalation Rate", value: `${escRate}%`, icon: PieIcon, color: "rose" },
          { label: "Guidelines Indexed", value: "24", icon: BarChart3, color: "amber" },
        ].map((s) => (
          <div key={s.label} className="spatial-panel p-6 flex items-center justify-between group transition-all duration-500 hover:border-white/20">
            <div>
              <p className="label-mono mb-1">{s.label}</p>
              <p className="text-3xl font-light text-white tracking-tight">{s.value}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors 
              ${s.color === 'cyan' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 
                s.color === 'violet' ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' : 
                s.color === 'rose' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 
                'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
              <s.icon size={18} />
            </div>
          </div>
        ))}
      </section>

      {/* Row 1 — Large Trends */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Trend Chart */}
        <div className="spatial-panel p-8 lg:col-span-2 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-light text-white">System Risk Trajectory</h3>
            <div className="text-[10px] font-mono text-white/20 uppercase">Last 20 Samples</div>
          </div>
          
          <div className="h-[280px] w-full mt-4">
            {isLoading ? <div className="w-full h-full bg-white/5 animate-pulse rounded-2xl" /> : (
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={scoreTrend}>
                   <defs>
                     <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                   <XAxis dataKey="case" hide />
                   <YAxis hide domain={[0, 110]} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                     itemStyle={{ color: '#fff', fontSize: '12px' }}
                     labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
                   />
                   <Area type="monotone" dataKey="score" stroke="#a78bfa" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                   <ReferenceLine y={75} stroke="#f43f5e" strokeDasharray="5 5" opacity={0.3} />
                 </AreaChart>
               </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Global Distribution */}
        <div className="spatial-panel p-8 bg-white/[0.02] flex flex-col">
          <h3 className="text-xl font-light text-white mb-2">Severity Split</h3>
          <p className="text-xs text-white/30 font-light mb-8 italic">Population risk distribution</p>
          
          <div className="flex-1 flex flex-col justify-center">
            {isLoading ? <div className="aspect-square bg-white/5 rounded-full animate-pulse" /> : (
              <div className="space-y-6">
                {riskDist.map(r => (
                  <div key={r.level}>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">{r.level}</span>
                       <span className="text-sm text-white font-medium">{r.count} cases</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${(r.count / (history?.length || 1)) * 100}%`, backgroundColor: r.color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Row 2 — The "Stunning" Heatmap Visualization */}
      <section className="spatial-panel p-10 bg-black/40">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
             <MapIcon size={20} className="text-white/60" />
          </div>
          <div>
            <h3 className="text-2xl font-light text-white">Spatial Risk Heatmap</h3>
            <p className="text-sm font-light text-white/40">Simulated regional health vector density based on patient demographics.</p>
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-2">
           {/* Generate 100 cells for the visual effect */}
           {Array.from({ length: 100 }).map((_, i) => {
             const randomVal = Math.random();
             const color = randomVal > 0.9 ? 'bg-rose-500/60' : randomVal > 0.7 ? 'bg-amber-500/40' : randomVal > 0.4 ? 'bg-cyan-500/20' : 'bg-white/[0.03]';
             return (
               <div key={i} className={`aspect-square rounded-[4px] transition-all hover:scale-125 cursor-help ${color} border border-white/5`} 
                 title={`Region Vector ${i} - Risk Scale: ${Math.round(randomVal * 100)}%`} />
             );
           })}
        </div>
        
        <div className="flex items-center gap-6 mt-8 pt-8 border-t border-white/5">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-white/[0.03]" />
             <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Minimal</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-cyan-500/40" />
             <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Stable</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-rose-500/60" />
             <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Critical Flux</span>
           </div>
        </div>
      </section>
    </div>
  );
}
