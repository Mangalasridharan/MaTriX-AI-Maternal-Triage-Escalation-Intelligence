"use client";
import { Camera, Search, AlertCircle, CheckCircle2 } from "lucide-react";

interface VisionOutput {
  status: string;
  findings: string;
  model: string;
}

export function VisionResultCard({ result }: { result: VisionOutput | null | undefined }) {
  if (!result || result.status === "skipped") return null;

  const isFailed = result.status === "failed";

  return (
    <div className={`spatial-panel p-6 border-cyan-500/20 bg-cyan-500/5 relative overflow-hidden group animate-in slide-in-from-right-4 duration-500`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500
          ${isFailed ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'}`}>
          {isFailed ? <AlertCircle size={20} /> : <Camera size={20} />}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-light text-white flex items-center gap-2">
              Vision Agent Feedback
              {!isFailed && <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">PaliGemma 3B</span>}
            </h3>
            <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
              VQA Multimodal
            </div>
          </div>
          
          <div className="bg-black/20 rounded-2xl p-4 border border-white/[0.03] space-y-3">
            <div className="flex items-center gap-2 text-cyan-400/80">
              <Search size={14} />
              <p className="text-[10px] font-mono uppercase tracking-widest">Visual Inspection Log</p>
            </div>
            
            <p className={`text-sm leading-relaxed ${isFailed ? 'text-rose-400/80 italic' : 'text-white/70 font-light'}`}>
              {result.findings}
            </p>
            
            {!isFailed && (
              <div className="flex items-center gap-2 pt-2 text-[10px] font-mono text-emerald-400/60 uppercase tracking-widest border-t border-white/5">
                <CheckCircle2 size={10} />
                Findings injected into Risk Agent Context
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
