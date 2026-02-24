"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, LayoutDashboard, History, Settings,
  HeartPulse, LogOut, ChevronRight, type LucideIcon
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface NavItem { icon: LucideIcon; label: string; href: string; badge?: string; }

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Triage",   href: "/" },
  { icon: Activity,        label: "Monitor",  href: "/monitor" },
  { icon: History,          label: "History",  href: "/history" },
  { icon: Settings,        label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // If user data isn't loaded yet, default to Clinic Triage label
  const clinicDisplay = user?.clinic_name || "Clinic Triage";
  const userRole = user ? `@${user.username}` : "MaTriX-AI";

  return (
    <aside className="sidebar group" aria-label="Sidebar navigation">
      {/* Brand logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.04] mb-2">
        <div className="w-8 h-8 rounded-lg bg-violet-600/30 border border-violet-500/40 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-violet-500/20 blur animate-pulse" />
          <HeartPulse size={15} className="text-violet-400 relative z-10" />
        </div>
        <div className="sidebar-label flex flex-col min-w-0">
          <span className="text-sm font-black text-gradient leading-none truncate">{clinicDisplay}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 truncate uppercase tracking-widest">{userRole}</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 overflow-hidden">
        {NAV_ITEMS.map(({ icon: Icon, label, href, badge }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`sidebar-item rounded-xl ${active ? "active" : ""}`}>
              <Icon size={18} className="flex-shrink-0" />
              <span className="sidebar-label text-sm font-medium flex items-center gap-2">
                {label}
                {badge && (
                  <span className="ml-auto text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full px-1.5 py-0.5 font-bold">
                    {badge}
                  </span>
                )}
              </span>
              {active && <ChevronRight size={12} className="ml-auto opacity-40 sidebar-label" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section — system status + logout */}
      <div className="px-2 pb-4 border-t border-white/[0.04] pt-3 mt-2 space-y-1">
        {/* Status pill */}
        <div className="sidebar-item rounded-xl opacity-70 cursor-default">
          <div className="w-[18px] h-[18px] flex items-center justify-center flex-shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 inline-block" />
          </div>
          <span className="sidebar-label text-xs text-slate-500">Edge Online</span>
        </div>

        {/* Logout */}
        <button onClick={logout}
          className="sidebar-item rounded-xl w-full hover:!text-rose-400 hover:!bg-rose-500/10">
          <LogOut size={18} className="flex-shrink-0" />
          <span className="sidebar-label text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
