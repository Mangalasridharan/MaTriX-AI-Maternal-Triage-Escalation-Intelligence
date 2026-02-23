"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Stethoscope, Clock, BarChart3, Settings, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { name: "Overview", href: "/dashboard", icon: Activity },
  { name: "Triage", href: "/triage", icon: Stethoscope },
  { name: "History", href: "/history", icon: Clock },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function FloatingDock() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem("matrix_token");
    router.push("/login");
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <nav className="flex items-center gap-1 p-2 bg-black/60 backdrop-blur-3xl border border-white/[0.08] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-full transition-all duration-500 overflow-hidden group
                ${isActive ? "text-white" : "text-white/40 hover:text-white hover:bg-white/[0.04]"}`}
            >
              {/* Active animated glow background */}
              {isActive && (
                <div className="absolute inset-0 bg-white/[0.08] rounded-full">
                  <div className="absolute top-0 w-8 h-[2px] bg-white left-1/2 -translate-x-1/2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                </div>
              )}
              
              <Icon size={20} className={`mb-1 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] font-medium tracking-wide">{item.name}</span>
            </Link>
          );
        })}
        
        {/* Separator */}
        <div className="w-[1px] h-8 bg-white/10 mx-1" />
        
        {/* Settings */}
        <Link href="/settings" className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-500 overflow-hidden group
          ${pathname === "/settings" ? "text-white bg-white/[0.08]" : "text-white/40 hover:text-white hover:bg-white/[0.04]"}`}>
          <Settings size={18} className="transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
        </Link>
        
        {/* Sign Out */}
        <button onClick={handleSignOut} className="relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-500 overflow-hidden group text-white/40 hover:text-rose-400 hover:bg-rose-500/10">
          <LogOut size={18} className="transition-transform duration-300 group-hover:scale-110" />
        </button>
      </nav>
    </div>
  );
}
