"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  ChevronRight, ArrowLeft, HeartPulse, Hospital,
  Eye, EyeOff, AlertCircle, CheckCircle2,
} from "lucide-react";

const criteria = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter",   test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number",             test: (p: string) => /[0-9]/.test(p) },
];

export default function SignupPage() {
  const { signup, user, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ username: "", password: "", confirm: "", clinic_name: "" });
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();

  /* Already logged in → go to dashboard */
  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [authLoading, user, router]);

  const pwStrength = criteria.filter((c) => c.test(form.password));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 8)       { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    try {
      await signup(form.username, form.password, form.clinic_name);
      /* AuthContext.signup() auto-logs in → router.push("/dashboard") fires */
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      if (status === 409 || detail === "Username already exists") {
        setError(
          `Username "${form.username}" is already registered. ` +
          "Please choose a different username or sign in."
        );
      } else if (!navigator.onLine || status === undefined) {
        setError("Cannot reach the Edge Gateway. Make sure the edge server is running.");
      } else {
        setError(detail || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#020202]">
      {/* ── Left Panel ─────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col p-16 relative border-r border-white/5 overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[80%] bg-violet-600/10 mix-blend-screen blur-[120px] rounded-full animate-pulse" style={{ animationDuration: "10s" }} />
        <div className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-cyan-600/5 mix-blend-screen blur-[100px] rounded-full animate-pulse" style={{ animationDuration: "14s" }} />

        <Link href="/" className="flex items-center gap-3 relative z-10 group w-fit">
          <div className="w-10 h-10 rounded-xl border border-violet-500/30 bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
            <HeartPulse size={18} className="text-violet-400" />
          </div>
          <span className="font-mono tracking-widest text-lg text-white/90">MaTriX<span className="text-violet-400">-AI</span></span>
        </Link>

        <div className="mt-auto mb-20 relative z-10 pl-4 border-l border-white/10">
          <div className="w-16 h-16 rounded-2xl border border-violet-500/20 bg-violet-500/10 flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 rounded-2xl bg-violet-500/10 blur-xl animate-pulse" />
            <Hospital size={24} className="text-violet-400 relative z-10" />
          </div>
          <h2 className="text-5xl font-light tracking-tight text-white mb-6 leading-tight">
            Register<br />Clinic Account.
          </h2>
          <p className="text-white/50 text-base leading-relaxed max-w-sm font-light">
            Set up your hybrid edge-cloud triage gateway. Your team can run MedGemma 4B offline and escalate severe cases over the secure cloud API.
          </p>

          {/* Features list */}
          <ul className="mt-8 space-y-3">
            {["Offline triage — no internet required", "Secure JWT session per nurse", "Cloud escalation for high-risk cases"].map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/40 font-light">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500/60 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-24 relative z-10">
        <div className="w-full max-w-md mx-auto">
          <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-12 transition-colors font-mono uppercase tracking-widest w-fit">
            <ArrowLeft size={16} /> Back to home
          </Link>

          <h1 className="text-4xl font-light text-white mb-2 tracking-tight">Set up clinic</h1>
          <p className="text-white/40 text-sm mb-10 font-mono">Initialize your edge workspace</p>

          <form id="signup-form" onSubmit={handleSignup} className="space-y-4">
            {/* Clinic Name */}
            <input
              id="clinic_name"
              type="text"
              placeholder="Clinic / Hospital Name"
              required
              value={form.clinic_name}
              onChange={(e) => setForm({ ...form, clinic_name: e.target.value })}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors font-mono"
            />

            {/* Username */}
            <input
              id="username"
              type="text"
              placeholder="Username"
              required
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors font-mono"
            />

            {/* Password */}
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                placeholder="Password"
                required
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-4 pr-12 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors font-mono"
              />
              <button type="button" onClick={() => setShowPw((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password strength indicators */}
            {form.password.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5">
                {criteria.map((c, i) => (
                  <div key={i} className={`h-1 rounded-full transition-colors ${pwStrength.includes(c) ? "bg-violet-500" : "bg-white/10"}`} />
                ))}
              </div>
            )}

            {/* Confirm Password */}
            <input
              id="confirm_password"
              type={showPw ? "text" : "password"}
              placeholder="Confirm password"
              required
              autoComplete="new-password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className={`w-full bg-white/[0.02] border rounded-xl px-4 py-4 text-white placeholder-white/20 focus:outline-none transition-colors font-mono ${
                form.confirm && form.confirm !== form.password
                  ? "border-rose-500/50"
                  : "border-white/10 focus:border-violet-500/50"
              }`}
            />

            {/* Confirm match indicator */}
            {form.confirm && form.confirm === form.password && (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
                <CheckCircle2 size={14} />
                Passwords match
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <AlertCircle size={16} className="text-rose-400 mt-0.5 flex-shrink-0" />
                <p className="text-rose-400 text-sm font-mono">{error}</p>
              </div>
            )}

            <button
              id="signup-btn"
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-white text-black font-semibold tracking-wide rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
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
