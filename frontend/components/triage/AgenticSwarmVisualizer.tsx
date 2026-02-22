"use client";
import { useEffect, useState } from "react";
import { Cpu, BookOpen, Route, CloudLightning, ShieldCheck, CheckCircle2, Circle } from "lucide-react";

interface Step {
  id: string;
  name: string;
  desc: string;
  icon: any;
  status: "pending" | "current" | "done";
  latency?: string;
}

export function AgenticSwarmVisualizer({ active }: { active: boolean }) {
  const [steps, setSteps] = useState<Step[]>([
    { id: "risk", name: "Risk Agent", desc: "Local MedGemma 4B Analysis", icon: Cpu, status: "pending" },
    { id: "rag", name: "Guideline RAG", desc: "WHO/NICE context retrieval", icon: BookOpen, status: "pending" },
    { id: "router", name: "Agentic Router", desc: "Escalation logic branch", icon: Route, status: "pending" },
    { id: "cloud", name: "Executive Agent", desc: "27B Cloud Synthesis", icon: CloudLightning, status: "pending" },
  ]);

  useEffect(() => {
    if (!active) {
      setSteps(s => s.map(step => ({ ...step, status: "pending", latency: undefined })));
      return;
    }

    // Simulate Agent progress locally for UI feedback
    const sequence = async () => {
      // Risk Agent
      setSteps(s => s.map((st, i) => i === 0 ? { ...st, status: "current" } : st));
      await new Promise(r => setTimeout(r, 800));
      setSteps(s => s.map((st, i) => i === 0 ? { ...st, status: "done", latency: "0.8s" } : i === 1 ? { ...st, status: "current" } : st));

      // RAG
      await new Promise(r => setTimeout(r, 600));
      setSteps(s => s.map((st, i) => i === 1 ? { ...st, status: "done", latency: "0.6s" } : i === 2 ? { ...st, status: "current" } : st));

      // Router
      await new Promise(r => setTimeout(r, 400));
      setSteps(s => s.map((st, i) => i === 2 ? { ...st, status: "done", latency: "0.4s" } : i === 3 ? { ...st, status: "current" } : st));

      // Final
      await new Promise(r => setTimeout(r, 500));
      setSteps(s => s.map((st, i) => i === 3 ? { ...st, status: "done", latency: "0.5s" } : st));
    };

    sequence();
  }, [active]);

  return (
    <div className="spatial-panel p-8 bg-black/40 border-white/5">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-light text-white">Agentic Workflow</h3>
          <p className="text-xs font-mono text-white/30 uppercase tracking-widest mt-1">Multi-Agent StateGraph Execution</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <div className={`w-2 h-2 rounded-full ${active ? 'bg-cyan-400 animate-pulse' : 'bg-white/20'}`} />
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-tighter">Monitoring Swarm</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {steps.map((step, i) => (
          <div key={step.id} className={`relative p-5 rounded-2xl border transition-all duration-500
            ${step.status === 'current' ? 'bg-white/[0.05] border-white/20 scale-105 z-10' : 
              step.status === 'done' ? 'bg-black/20 border-white/10 opacity-100' : 'bg-transparent border-white/5 opacity-40'}`}>
            
            <div className="flex items-start justify-between mb-4">
               <div className={`p-2 rounded-lg ${step.status === 'done' ? 'bg-white/10 text-white' : 'bg-white/5 text-white/40'}`}>
                 <step.icon size={18} />
               </div>
               {step.status === 'done' ? (
                 <CheckCircle2 size={16} className="text-cyan-400" />
               ) : step.status === 'current' ? (
                 <div className="w-4 h-4 rounded-full border-2 border-cyan-500/40 border-t-cyan-400 animate-spin" />
               ) : (
                 <Circle size={14} className="text-white/10" />
               )}
            </div>

            <h4 className="text-sm font-medium text-white mb-1">{step.name}</h4>
            <p className="text-[10px] text-white/30 leading-tight mb-2">{step.desc}</p>
            
            {step.latency && (
              <span className="text-[9px] font-mono text-cyan-400/60 uppercase">Latency: {step.latency}</span>
            )}

            {/* Connecting line */}
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-[1px] bg-white/5" />
            )}
          </div>
        ))}
      </div>

      {active && (
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <ShieldCheck size={16} className="text-cyan-400" />
             <span className="text-xs text-white/60 font-light">Self-Correction Policy Active: <span className="text-white">Enabled</span></span>
           </div>
           <div className="text-[10px] font-mono text-white/20 uppercase">State-Key: 125ad898-9622</div>
        </div>
      )}
    </div>
  );
}
