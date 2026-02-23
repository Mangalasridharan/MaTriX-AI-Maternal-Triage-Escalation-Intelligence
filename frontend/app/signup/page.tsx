"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { ChevronRight, ArrowLeft, Check, HeartPulse, Hospital } from "lucide-react";

export default function SignupPage() {
  const [form, setForm] = useState({ username: "", password: "", confirm: "", clinic_name: "" });
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true); setError("");
    try {
      await apiClient.signup(form.username, form.password, form.clinic_name);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      console.error("Signup error:", err);
      const detail = err?.response?.data?.detail;
      if (detail === "Username already exists") {
        setError("This account already exists. Please choose a different username.");
      } else {
        setError(detail || "Initialisation failed. Please check your connection to the Edge Gateway.");
      }
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020202]">
        <div className="text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 rounded-full border border-cyan-500/40 bg-cyan-500/10 flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
            <Check size={40} className="text-cyan-400 relative z-10" strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-light tracking-tight text-white mb-2">Account Created</h2>
          <p className="font-mono text-cyan-400/50 uppercase tracking-widest text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#020202]">
      {/* ── Visual Left Panel ────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col p-16 relative border-r border-white/5 overflow-hidden">
        
        {/* Ambient Glows */}
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[80%] bg-violet-600/10 mix-blend-screen blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '10s' }} />
        
        <Link href="/" className="flex items-center gap-3 relative z-10 group w-fit">
          <div className="w-10 h-10 rounded-xl border border-violet-500/30 bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
            <HeartPulse size={18} className="text-violet-400" />
          </div>
          <span className="font-mono tracking-widest text-lg text-white/90">MaTriX<span className="text-violet-400">-AI</span></span>
        </Link>

        <div className="mt-auto mb-32 relative z-10 pl-4 border-l border-white/10">
          <div className="w-16 h-16 rounded-2xl border border-violet-500/20 bg-violet-500/10 flex items-center justify-center mb-8 relative">
            <Hospital size={24} className="text-violet-400" />
          </div>
          <h2 className="text-5xl font-light tracking-tight text-white mb-6 leading-tight">
            Register<br />Clinic Account.
          </h2>
          <p className="text-white/50 text-base leading-relaxed max-w-sm font-light">
            Set up your hybrid edge-cloud triage gateway. This will allow your team to run MedGemma 4B offline and escalate severe cases over the secure API.
          </p>
        </div>
      </div>

      {/* ── Form Right Panel ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-24 relative z-10">
        <div className="w-full max-w-md mx-auto">
          
          <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-12 transition-colors font-mono uppercase tracking-widest w-fit">
            <ArrowLeft size={16} /> Back to home
          </Link>

          <h1 className="text-4xl font-light text-white mb-2 tracking-tight">Set up clinic</h1>
          <p className="text-white/40 text-sm mb-12 font-mono">Initialize your edge workspace</p>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <input type="text" placeholder="Clinic / Hospital Name" required value={form.clinic_name} onChange={(e) => setForm({ ...form, clinic_name: e.target.value })} 
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors font-mono" />
            </div>
            <div>
              <input type="text" placeholder="Username" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} 
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors font-mono" />
            </div>
            <div>
              <input type="password" placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} 
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors font-mono" />
            </div>
            <div>
              <input type="password" placeholder="Verify password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} 
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors font-mono" />
            </div>

            {error && <p className="text-rose-400 text-sm text-center font-mono mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading} 
              className="w-full py-4 mt-8 bg-white text-black font-semibold tracking-wide rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
              {loading
                ? <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : <>Create Account <ChevronRight size={18} /></>}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-8 font-light">
            Already registered?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
