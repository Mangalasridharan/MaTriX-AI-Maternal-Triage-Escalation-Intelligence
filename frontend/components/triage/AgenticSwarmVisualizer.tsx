"use client";
import { useEffect, useState } from "react";
import { Cpu, BookOpen, Camera, CloudLightning, ShieldCheck, CheckCircle2, Circle, TerminalSquare } from "lucide-react";

interface Step {
  id: string;
  name: string;
  desc: string;
  icon: any;
  status: "pending" | "current" | "done";
  latency?: string;
  logs: string[];
}

export function AgenticSwarmVisualizer({ active, completed }: { active: boolean; completed?: boolean }) {
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [logs, setLogs] = useState<string[]>([]);
  
  const [steps, setSteps] = useState<Step[]>([
    { id: "vision", name: "Vision Agent", desc: "PaliGemma 3B VQA", icon: Camera, status: "pending", logs: [] },
    { id: "risk", name: "Risk Agent", desc: "Local MedGemma 4B GGUF", icon: Cpu, status: "pending", logs: [] },
    { id: "rag", name: "Guideline Agent", desc: "WHO/ACOG RAG Citation", icon: BookOpen, status: "pending", logs: [] },
    { id: "exec", name: "Executive Agent", desc: "Cloud 27B Care Plan", icon: CloudLightning, status: "pending", logs: [] },
  ]);

  useEffect(() => {
    if (!active) {
      if (completed) {
        setSteps(s => s.map(step => ({ ...step, status: "done" })));
        setActiveStepIndex(4);
        setLogs(prev => [...prev.filter(l => !l.includes("standby")), "[SYSTEM] 4-Agent Multimodal Swarm: SUCCESS"]);
      } else {
        setSteps(s => s.map(step => ({ ...step, status: "pending", latency: undefined })));
        setActiveStepIndex(-1);
        setLogs(["[SYSTEM] Swarm standing by..."]);
      }
      return;
    }

    setLogs(["[SYSTEM] Initiating Multimodal Swarm sequence..."]);
    
    // Simulate Agent progress locally for UI feedback
    let isCancelled = false;

    const sequence = async () => {
      const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
      const addLog = (log: string) => {
        if (!isCancelled) setLogs(prev => [...prev, log]);
      };

      // 1. Vision Agent
      setActiveStepIndex(0);
      setSteps(s => s.map((st, i) => i === 0 ? { ...st, status: "current" } : st));
      addLog("[VISION] Loading PaliGemma 3B... Analyzing clinical image.");
      await wait(1200);
      addLog("[VISION] Edema patterns detected. Visual context injected.");
      setSteps(s => s.map((st, i) => i === 0 ? { ...st, status: "done", latency: "1.2s" } : st));

      // 2. Risk Agent
      setActiveStepIndex(1);
      setSteps(s => s.map((st, i) => i === 1 ? { ...st, status: "current" } : st));
      addLog("[EDGE] MedGemma-4B GGUF executing offline...");
      await wait(900);
      addLog("[EDGE] Risk score compiled with visual context.");
      setSteps(s => s.map((st, i) => i === 1 ? { ...st, status: "done", latency: "0.9s" } : st));
      
      // 3. RAG
      setActiveStepIndex(2);
      setSteps(s => s.map((st, i) => i === 2 ? { ...st, status: "current" } : st));
      addLog("[RAG] Retrieval: Searching WHO Pre-eclampsia guidelines...");
      await wait(600);
      addLog("[RAG] Grounding confirmed: NICE NG133 citation retrieved.");
      setSteps(s => s.map((st, i) => i === 2 ? { ...st, status: "done", latency: "0.6s" } : st));

      // 4. Executive
      setActiveStepIndex(3);
      setSteps(s => s.map((st, i) => i === 3 ? { ...st, status: "current" } : st));
      addLog("[CLOUD] Escalating to MedGemma 27B for executive synthesis...");
      await wait(1500);
      addLog("[CLOUD] Strategy generated: Refer to Level 3 Facility.");
      setSteps(s => s.map((st, i) => i === 3 ? { ...st, status: "done", latency: "1.5s" } : st));
      
      setActiveStepIndex(4); // All done
      addLog("[SYSTEM] 4-Agent Multimodal Swarm complete.");
    };

    sequence();
    return () => { isCancelled = true; };
  }, [active]);

  return (
    <div className="spatial-panel p-8 bg-black border-white/10 relative overflow-hidden">
      {/* Background ambient pulse for the active swarm */}
      {active && (
        <div className="absolute inset-0 bg-cyan-900/10 mix-blend-screen blur-[100px] animate-pulse pointer-events-none" />
      )}

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-xl font-light text-white">Live Swarm Orchestration</h3>
          <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest mt-1">Multi-Agent LangGraph</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <div className={`w-2 h-2 rounded-full ${active ? 'bg-cyan-400 animate-pulse outline outline-cyan-400/30' : 'bg-white/20'}`} />
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-tighter">
            {active ? "Processing Flow" : "Standby"}
          </span>
        </div>
      </div>

      <div className="relative mt-8 mb-12 flex justify-between z-10 hidden md:flex">
        {/* The Animated Data Flow Lines */}
        <div className="absolute top-1/2 left-10 right-10 h-[2px] bg-white/5 -translate-y-1/2 z-0">
           {activeStepIndex >= 0 && activeStepIndex < steps.length && (
             <div 
               className="h-full bg-cyan-400 shadow-[0_0_15px_#22d3ee] transition-all duration-700 ease-in-out"
               style={{ width: `${(activeStepIndex / (steps.length - 1)) * 100}%` }}
             />
           )}
        </div>

        {steps.map((step, i) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            {/* Node Circle */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500
              ${step.status === 'current' 
                  ? 'bg-black border-2 border-cyan-400 scale-110 shadow-[0_0_30px_rgba(34,211,238,0.3)] text-cyan-400' 
                  : step.status === 'done' 
                      ? 'bg-white/5 border border-white/20 text-white' 
                      : 'bg-black/50 border border-white/5 text-white/30'}`}>
                {step.status === 'done' ? <CheckCircle2 size={24} className="text-emerald-400" /> : <step.icon size={28} className={step.status === 'current' ? 'animate-pulse' : ''} />}
            </div>
            
            <div className="mt-4 text-center">
              <h4 className={`text-sm font-medium transition-colors ${step.status === 'current' ? 'text-cyan-400' : step.status === 'done' ? 'text-white' : 'text-white/40'}`}>{step.name}</h4>
              <p className="text-[10px] text-white/40 mt-1 max-w-[100px] mx-auto leading-tight">{step.desc}</p>
              {step.latency && <span className="text-[10px] font-mono tracking-widest text-emerald-400/60 block mt-1">{step.latency}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Stacked View */}
      <div className="flex md:hidden flex-col gap-4 relative z-10 mb-8">
        {steps.map((step, i) => (
          <div key={step.id} className={`flex items-center gap-4 p-4 border rounded-xl 
            ${step.status === 'current' ? 'bg-cyan-900/10 border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : step.status === 'done' ? 'bg-white/5 border-white/20' : 'bg-black/50 border-white/5 opacity-50'}`}>
            <step.icon size={24} />
            <div>
              <h4 className="text-base font-medium">{step.name}</h4>
              <p className="text-xs text-white/50">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Live Terminal */}
      <div className="bg-black/80 rounded-xl border border-white/10 overflow-hidden relative z-10 mt-4">
        <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center gap-2">
           <TerminalSquare size={14} className="text-white/40" />
           <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Agentic Stream</span>
        </div>
        <div className="p-4 h-40 overflow-y-auto font-mono text-xs text-white/60 space-y-2 flex flex-col justify-end">
           {logs.map((log, i) => (
             <div key={i} className="animate-in fade-in slide-in-from-bottom-2">
                <span className="text-cyan-500/50 mr-2">{'>'}</span>
                <span className={log.includes('[CRITIQUE]') ? 'text-violet-300' : log.includes('[RAG]') ? 'text-blue-300' : log.includes('complete') ? 'text-emerald-400' : 'text-white/70'}>
                  {log}
                </span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
