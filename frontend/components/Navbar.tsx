"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, History, LogOut, HeartPulse, type LucideIcon } from "lucide-react";


export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("matrix_token");
    router.push("/login");
  };

  const link = (href: string, label: string, Icon: LucideIcon) => (
    <Link href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
        ${pathname === href
          ? "bg-violet-500/20 text-violet-300"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"}`}>
      <Icon size={16} /> {label}
    </Link>
  );

  return (
    <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600/30 border border-violet-500/40 flex items-center justify-center">
              <HeartPulse size={16} className="text-violet-400" />
            </div>
            <span className="font-bold text-sm tracking-tight">
              <span className="gradient-text">MaTriX</span>
              <span className="text-slate-400">-AI</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {link("/", "Triage", Activity)}
            {link("/history", "History", History)}
            <button onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150 ml-2">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
