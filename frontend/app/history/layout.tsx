"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FloatingDock } from "@/components/layout/FloatingDock";

// The AmbientBackground creates the slow-moving "Aura" effect
function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
      {/* Deep Obsidian Base */}
      <div className="absolute inset-0 bg-[#020202]"></div>
      
      {/* Slow moving auroras */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-700/20 mix-blend-screen blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '12s' }}></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] bg-violet-700/20 mix-blend-screen blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '15s', animationDelay: '2s' }}></div>
      
      {/* Noise overlay for texture */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("matrix_token");
    if (!token) {
      router.push("/login");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/80 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative font-sans text-white pb-32 selection:bg-cyan-500/30">
      <AmbientBackground />
      
      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-6 pt-12">
        {children}
      </main>

      <FloatingDock />
    </div>
  );
}
