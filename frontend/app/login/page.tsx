"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { HeartPulse, ChevronRight, Zap, ArrowLeft, Network } from "lucide-react";

const DEMO_USER = "demo";
const DEMO_PASS = "demo1234";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("demo") === "true") {
      setUsername(DEMO_USER);
      setPassword(DEMO_PASS);
    }
  }, [params]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { access_token } = await apiClient.login(username, password);
      localStorage.setItem("matrix_token", access_token);
      router.push("/dashboard");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally { setLoading(false); }
  };

  const loginDemo = async () => {
    setLoading(true); setError("");
    try {
      const { access_token } = await apiClient.login(DEMO_USER, DEMO_PASS);
      localStorage.setItem("matrix_token", access_token);
      router.push("/dashboard");
    } catch {
      setError("Demo account uninitialized — run: python scripts/seed_demo.py");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#020202]">
      {/* Left feature panel - Multi-Agent Swarm Visualization */}
      <div className="hidden lg:flex lg:w-[50%] flex-col justify-between p-16 relative overflow-hidden border-r border-white/5">
        
        {/* Ambient Swarm Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-cyan-600/20 mix-blend-screen blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] bg-purple-600/20 mix-blend-screen blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '12s' }} />
        
        {/* Hex Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'103.92304845413264\' viewBox=\'0 0 60 103.92304845413264\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 103.92304845413264l-30-17.320508075688775v-34.64101615137755l30-17.32050807568877v34.64101615137755l30-17.32050807568877v-34.64101615137755l-30-17.320508075688775-30 17.320508075688775v34.64101615137755l30 17.320508075688775v34.64101615137755l30 17.32050807568877v-34.64101615137755z\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }} />

        <Link href="/" className="flex items-center gap-3 relative z-10 group">
          <div className="w-10 h-10 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
            <HeartPulse size={18} className="text-cyan-400" />
          </div>
          <span className="font-mono tracking-widest text-lg text-white/90">MaTriX<span className="text-cyan-400">-AI</span></span>
        </Link>

        <div className="relative z-10 pl-4 border-l border-white/10">
          <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping-slow" />
            <div className="absolute inset-2 rounded-full border border-purple-500/30 animate-spin" style={{ animationDuration: '10s' }} />
            <Network size={32} className="text-white/80" />
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-light tracking-tight text-white mb-6 leading-tight">
            Advanced AI for<br />
            <span className="text-cyan-400 font-medium">Maternal Triage</span>
          </h2>
          <p className="text-white/50 text-base leading-relaxed max-w-sm font-light">
            Sign in to access your clinic's edge-native triage system and continuous cloud escalation network.
          </p>
        </div>

        <div className="relative z-10 flex gap-6">
          <div className="space-y-1">
            <div className="label-mono text-cyan-400">Offline Triage</div>
            <div className="text-sm font-light text-white/60">Edge Guidelines</div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="space-y-1">
            <div className="label-mono text-purple-400">Expert Review</div>
            <div className="text-sm font-light text-white/60">Cloud Escalation</div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-24 relative">
        <div className="w-full max-w-md mx-auto">
          <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-12 transition-colors font-mono uppercase tracking-widest">
            <ArrowLeft size={16} /> Back to home
          </Link>

          <h1 className="text-4xl font-light text-white mb-2 tracking-tight">Welcome back</h1>
          <p className="text-white/40 text-sm mb-12 font-mono">Sign in to your clinic workspace</p>

          {/* Demo / Judge button */}
          <button onClick={loginDemo} disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 mb-8 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-mono tracking-widest hover:bg-cyan-500/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all">
            <Zap size={16} /> Demo / Judge Access
          </button>

          <div className="flex items-center gap-4 mb-8 opacity-30">
            <div className="flex-1 h-px bg-white" />
            <span className="font-mono text-[10px] uppercase tracking-widest">or sign in manually</span>
            <div className="flex-1 h-px bg-white" />
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input id="username" type="text" placeholder="Username" required
                value={username} onChange={(e) => setUsername(e.target.value)} 
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono" />
            </div>
            <div>
              <input id="password" type="password" placeholder="Password" required
                value={password} onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono" />
            </div>
            
            {error && <p className="text-rose-400 text-sm text-center font-mono mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">{error}</p>}
            
            <button id="login-btn" type="submit" disabled={loading} 
              className="w-full py-4 mt-8 bg-white text-black font-semibold tracking-wide rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
              {loading
                ? <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : <>Sign In <ChevronRight size={18} /></>}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-8 font-light">
            New clinic?{" "}
            <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium">Create acccount →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
