"use client";

import { useState, useEffect } from "react";
import { Activity, Clock, HeartPulse, UserCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { apiClient, HistoryItem } from "@/lib/api";

export default function DashboardPage() {
  const [recentCases, setRecentCases] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        // Fetch 5 most recent
        const cases = await apiClient.getHistory(0, 5);
        setRecentCases(cases);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const severeCount = recentCases.filter((c) => c.risk_level === "severe" || c.risk_level === "high").length;
  const total = recentCases.length;

  return (
    <div className="flex flex-col gap-16 max-w-6xl mx-auto animate-in fade-in duration-700 pb-24">
      {/* Premium Header Segment */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-5xl md:text-6xl font-light tracking-tight text-white mb-2">Clinic Overview</h1>
          <p className="text-white/40 font-mono tracking-widest uppercase text-sm">System Status: <span className="text-cyan-400">Nominal</span></p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-6 py-3 backdrop-blur-md">
           <Activity size={16} className="text-cyan-400 animate-pulse" />
           <span className="font-mono text-xs text-white/60 tracking-widest whitespace-nowrap">LOCAL INFERENCE AGENT ACTIVE</span>
        </div>
      </header>

      {/* Dribbble Style Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="spatial-panel p-8 group relative overflow-hidden transition-all duration-500 hover:border-cyan-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-8 relative z-10">
            <HeartPulse size={24} className="text-cyan-400" />
            <span className="text-xs font-mono text-white/30 uppercase tracking-widest">Total Monitored</span>
          </div>
          <div className="relative z-10">
            <div className="text-6xl font-light tracking-tighter text-white mb-4">{loading ? "-" : total}</div>
            <p className="text-white/40 text-sm font-light">Recent triage cases</p>
          </div>
        </div>

        <div className="spatial-panel p-8 group relative overflow-hidden transition-all duration-500 hover:border-rose-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-8 relative z-10">
            <Activity size={24} className="text-rose-400" />
            <span className="text-xs font-mono text-white/30 uppercase tracking-widest">Escalations</span>
          </div>
          <div className="relative z-10">
            <div className="text-6xl font-light tracking-tighter text-white mb-4">{loading ? "-" : severeCount}</div>
            <p className="text-white/40 text-sm font-light">Cases routed to Cloud API</p>
          </div>
        </div>

        <div className="spatial-panel p-8 bg-black border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="text-sm font-mono text-white/50 tracking-widest uppercase mb-4">Quick Action</div>
            <Link href="/triage" className="w-full py-6 mt-4 bg-white hover:bg-white/90 text-black rounded-xl flex items-center justify-center gap-3 transition-colors font-medium text-lg group">
              Start New Triage <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Extreme Minimalist Recent List */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-light tracking-tight text-white">Recent Activity</h2>
          <Link href="/history" className="text-sm font-mono text-white/40 hover:text-white transition-colors flex items-center gap-2">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="w-full h-24 rounded-2xl bg-white/5 animate-pulse" />
          ) : recentCases.length === 0 ? (
            <div className="text-center py-16 text-white/30 font-light border border-dashed border-white/10 rounded-3xl">
              No recent cases processed.
            </div>
          ) : (
            recentCases.map((item) => (
              <Link href={`/triage?id=${item.visit_id}`} key={item.visit_id} 
                className="group relative flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-colors
                    ${item.risk_level === 'severe' || item.risk_level === 'high' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 group-hover:bg-rose-500/20 group-hover:border-rose-500/40' : 
                      item.risk_level === 'moderate' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 group-hover:bg-amber-500/20 group-hover:border-amber-500/40' : 
                      'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/40'}
                  `}>
                    <UserCircle2 size={24} />
                  </div>
                  <div>
                    <div className="text-lg text-white font-medium mb-1">{item.patient_name}</div>
                    <div className="flex items-center gap-3 text-sm text-white/40 font-mono">
                      <Clock size={12} /> {new Date(item.submitted_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                   <div className="text-right hidden sm:block">
                     <div className="text-sm font-mono tracking-widest uppercase mb-1"
                       style={{ color: item.risk_level === 'severe' ? '#fb7185' : item.risk_level === 'high' ? '#f87171' : item.risk_level === 'moderate' ? '#fbbf24' : '#22d3ee' }}>
                       {item.risk_level}
                     </div>
                     <div className="text-xs text-white/30">Score: {item.risk_score}/10</div>
                   </div>
                   <ArrowRight size={20} className="text-white/20 group-hover:text-white/60 transition-colors group-hover:translate-x-1" />
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
