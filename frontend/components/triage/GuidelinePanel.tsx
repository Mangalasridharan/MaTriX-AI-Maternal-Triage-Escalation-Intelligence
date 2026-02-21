"use client";
import { useState } from "react";
import { GuidelineResult } from "@/lib/api";
import { Activity, Pill, ShieldCheck } from "lucide-react";

const TABS = [
  { key: "stabilization", label: "Stabilization", icon: ShieldCheck, color: "text-violet-400" },
  { key: "monitoring",    label: "Monitoring",    icon: Activity,    color: "text-cyan-400" },
  { key: "medication",    label: "Medication",    icon: Pill,        color: "text-emerald-400" },
] as const;

type TabKey = typeof TABS[number]["key"];

export function GuidelinePanel({ guide }: { guide: GuidelineResult }) {
  const [active, setActive] = useState<TabKey>("stabilization");

  const content: Record<TabKey, string> = {
    stabilization: guide.stabilization_plan,
    monitoring:    guide.monitoring_instructions,
    medication:    guide.medication_guidance,
  };

  const activeTab = TABS.find((t) => t.key === active)!;

  return (
    <div className="spatial-panel p-8 mt-8 border-white/[0.03]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <p className="label-mono flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            AI Retrieval Augmented Generation
          </p>
          <h3 className="text-2xl font-light tracking-tight text-white/90">Clinical Grounding</h3>
        </div>
        
        {guide.guideline_sources && (
          <div className="px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] inline-block">
            <span className="text-[10px] uppercase font-mono tracking-widest text-white/40">
              Source: <span className="text-white/80">{guide.guideline_sources.split(",")[0]?.trim()}</span>
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Spatial Tab Bar (Vertical on Desktop) */}
        <div className="flex md:flex-col gap-2 overflow-x-auto md:w-64 flex-shrink-0 pb-4 md:pb-0 scrollbar-hide">
          {TABS.map(({ key, label, icon: Icon, color }) => {
            const isActive = active === key;
            return (
              <button key={key} onClick={() => setActive(key)}
                className={`relative flex items-center gap-3 w-full p-4 rounded-2xl transition-all duration-500 text-left overflow-hidden group
                  ${isActive ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-transparent border border-transparent hover:bg-white/[0.02]'}`}>
                
                {isActive && (
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${color.replace('text-', 'bg-')} shadow-[0_0_15px_currentColor]`} />
                )}

                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isActive ? color.replace('text-', 'bg-') + '/20' : 'bg-white/5'}`}>
                  <Icon size={14} className={isActive ? color : 'text-white/40 group-hover:text-white/70'} />
                </div>
                
                <span className={`text-sm tracking-wide ${isActive ? 'text-white font-medium' : 'text-white/50 group-hover:text-white/80'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[300px] relative">
          <div key={active} className="animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="space-y-6">
              {content[active]
                ? content[active].split("\n").filter(Boolean).map((line, i) => {
                    const isNumbered = line.match(/^\d+\./);
                    return (
                      <div key={i} className="flex items-start gap-4 group">
                        {isNumbered ? (
                          <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center flex-shrink-0 ${activeTab.color.replace('text-', 'bg-')}/10`}>
                            <span className={`text-xs font-mono ${activeTab.color}`}>
                              {line.match(/^(\d+)\./)?.[1]}
                            </span>
                          </div>
                        ) : (
                          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white/60 transition-colors" />
                          </div>
                        )}
                        <p className={`text-lg font-light leading-relaxed mt-0.5 ${isNumbered ? 'text-white/90' : 'text-white/70'}`}>
                          {line.replace(/^\d+\.\s*/, "")}
                        </p>
                      </div>
                    );
                  })
                : (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50 py-20">
                    <Activity size={32} className="text-white/20" />
                    <p className="label-mono">No data points generated</p>
                  </div>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
