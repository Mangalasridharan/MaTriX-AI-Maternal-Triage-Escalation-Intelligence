"use client";
import { useState } from "react";
import { GuidelineResult } from "@/lib/api";
import { BookOpen, Activity, Pill } from "lucide-react";

/* ── Tabbed Card — Apple Health / iOS Settings design method ─────────
   Three tabs with animated active indicator:
     ① Stabilization Plan
     ② Monitoring Instructions  
     ③ Medication Guidance
────────────────────────────────────────────────────────────────────── */

const TABS = [
  { key: "stabilization", label: "Stabilization", icon: BookOpen, color: "violet" },
  { key: "monitoring",    label: "Monitoring",    icon: Activity,  color: "cyan" },
  { key: "medication",    label: "Medication",    icon: Pill,      color: "emerald" },
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
    <div id="guideline-panel" className="glass p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="label-sm text-cyan-400">WHO Clinical Plan</p>
        {guide.guideline_sources && (
          <span className="text-[10px] text-slate-600 bg-slate-800/60 px-2 py-1 rounded-full border border-slate-700/40">
            {guide.guideline_sources.split(",")[0]?.trim()}
          </span>
        )}
      </div>

      {/* Tab bar */}
      <div className="tab-bar">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActive(key)}
            className={`tab flex items-center justify-center gap-1.5 ${active === key ? "active" : ""}`}>
            <Icon size={13} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Content area */}
      <div key={active} className="tab-panel min-h-[120px]">
        {/* Section header */}
        <div className={`flex items-center gap-2 mb-3 pb-3 border-b border-${activeTab.color}-500/20`}>
          <activeTab.icon size={15} className={`text-${activeTab.color}-400`} />
          <span className={`text-xs font-semibold text-${activeTab.color}-400`}>{activeTab.label}</span>
        </div>

        {/* Paragraphs / lines */}
        <div className="space-y-2">
          {content[active]
            ? content[active].split("\n").filter(Boolean).map((line, i) => (
                <div key={i} className={`flex items-start gap-3 text-sm text-slate-300 leading-relaxed`}>
                  {line.match(/^\d+\./) ? (
                    <>
                      <span className={`text-${activeTab.color}-500 font-bold text-xs mt-0.5 w-5 flex-shrink-0`}>
                        {line.match(/^(\d+)\./)?.[1]}.
                      </span>
                      <span>{line.replace(/^\d+\.\s*/, "")}</span>
                    </>
                  ) : (
                    <>
                      <span className={`text-${activeTab.color}-600 mt-1.5 flex-shrink-0`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current block" />
                      </span>
                      <span>{line}</span>
                    </>
                  )}
                </div>
              ))
            : <p className="text-slate-600 text-sm">No data available.</p>
          }
        </div>
      </div>
    </div>
  );
}
