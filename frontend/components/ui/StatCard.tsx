"use client";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  color?: "violet" | "rose" | "amber" | "orange" | "emerald" | "cyan";
  isLoading?: boolean;
  delta?: { value: string; up: boolean };
}

const COLOR_CONFIG = {
  violet:  { icon: "bg-violet-500/10 border-violet-500/30 text-violet-400" , value: "text-violet-400" },
  rose:    { icon: "bg-rose-500/10  border-rose-500/30  text-rose-400",     value: "text-rose-400"   },
  amber:   { icon: "bg-amber-500/10 border-amber-500/30 text-amber-400",    value: "text-amber-400"  },
  orange:  { icon: "bg-orange-500/10 border-orange-500/30 text-orange-400", value: "text-orange-400" },
  emerald: { icon: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400", value: "text-emerald-400" },
  cyan:    { icon: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",       value: "text-cyan-400"   },
};

export function StatCard({ label, value, sub, icon: Icon, color = "violet", isLoading, delta }: StatCardProps) {
  const c = COLOR_CONFIG[color];

  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between">
        <div>
          <p className="label-xs mb-2">{label}</p>
          {isLoading
            ? <div className="shimmer w-16 h-8 rounded mt-1" />
            : <div className={`stat-value ${c.value}`}>{value}</div>}
        </div>
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${c.icon}`}>
          <Icon size={16} />
        </div>
      </div>

      {delta && !isLoading && (
        <div className={`stat-delta mt-1 ${delta.up ? "up" : "down"}`}>
          {delta.value}
        </div>
      )}

      {sub && <p className="text-[11px] text-slate-600 mt-auto pt-2">{sub}</p>}
    </div>
  );
}
