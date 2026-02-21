"use client";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

const BREADCRUMBS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/triage":    "New Triage Case",
  "/history":   "Case History",
  "/analytics": "Analytics",
  "/settings":  "Settings",
};

export function TopBar() {
  const pathname = usePathname();
  const page = BREADCRUMBS[pathname] ?? "MaTriX-AI";

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/[0.04] flex-shrink-0"
      style={{ background: "rgba(5,8,17,0.6)", backdropFilter: "blur(12px)" }}>
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span>MaTriX-AI</span><span>/</span>
          <span className="text-slate-300 font-medium">{page}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-ghost p-2 rounded-lg text-slate-600 hover:text-slate-300">
          <Search size={15} />
        </button>
        <button className="btn-ghost p-2 rounded-lg text-slate-600 hover:text-slate-300 relative">
          <Bell size={15} />
        </button>
        <div className="w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-[11px] font-bold text-violet-400">
          M
        </div>
      </div>
    </header>
  );
}
