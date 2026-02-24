"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Cpu, Cloud, Settings, Key, Save, Info, LogOut,
  Wifi, WifiOff, RefreshCw, Activity, Server, Eye,
  ShieldCheck, AlertTriangle, CheckCircle, XCircle, Zap
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api";

// ── Types ───────────────────────────────────────────────────────────────────
type TopologyMode = "OFFLINE" | "HYBRID" | "CLOUD";

interface ServiceStatus {
  online: boolean;
  latency_ms?: number;
  model?: string;
  host?: string;
  error?: string;
}

interface TopologyState {
  mode: TopologyMode;
  fallback_enabled: boolean;
  vision_enabled: boolean;
  executive_agent_enabled: boolean;
  updated_at: number | null;
  updated_by: string | null;
  model_status: {
    edge_4b: ServiceStatus;
    cloud_27b: ServiceStatus;
    vision_3b: ServiceStatus;
  };
}

// ── Mode configs ─────────────────────────────────────────────────────────────
const MODES: {
  id: TopologyMode;
  title: string;
  subtitle: string;
  desc: string;
  color: string;
  icon: React.ReactNode;
  features: string[];
  trade: string;
}[] = [
  {
    id: "OFFLINE",
    title: "Strict Offline",
    subtitle: "Air-Gap Mode",
    desc: "100% local processing. No data leaves the clinic. Ideal for extreme low-connectivity environments.",
    color: "rose",
    icon: <WifiOff size={22} />,
    features: ["MedGemma 4B (Edge Only)", "Rule-based fallback engine", "0 external API calls", "Hardcoded WHO protocols"],
    trade: "No 27B Executive reasoning or Vision analysis"
  },
  {
    id: "HYBRID",
    title: "Hybrid",
    subtitle: "Recommended Default",
    desc: "Edge 4B triages 90% of cases locally. Cloud 27B activates only for critical escalations (Risk Score ≥ 65).",
    color: "amber",
    icon: <Zap size={22} />,
    features: ["MedGemma 4B triage (local)", "27B Executive on critical cases", "PaliGemma Vision (cloud)", "Smart cost routing"],
    trade: "Requires occasional internet for escalations"
  },
  {
    id: "CLOUD",
    title: "Full Cloud",
    subtitle: "Enterprise Mode",
    desc: "All inference routed through private SageMaker G5 instances.  Requires reliable 4G/5G or LAN.",
    color: "cyan",
    icon: <Cloud size={22} />,
    features: ["27B Executive on every case", "Real-time Vision analysis", "Maximum accuracy", "Centralized audit logs"],
    trade: "Requires persistent connectivity"
  },
];

// ── Status Dot ───────────────────────────────────────────────────────────────
function StatusDot({ online, latency }: { online: boolean; latency?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${online ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`} />
      <span className={`font-mono text-xs ${online ? "text-emerald-400" : "text-rose-400"}`}>
        {online ? `${latency ?? "?"}ms` : "OFFLINE"}
      </span>
    </div>
  );
}

// ── Service Card ─────────────────────────────────────────────────────────────
function ServiceCard({
  icon, label, model, host, status, locked
}: {
  icon: React.ReactNode; label: string; model: string; host: string;
  status?: ServiceStatus; locked?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between p-5 rounded-xl border transition-all duration-300
      ${status?.online ? "bg-white/[0.03] border-white/10" : "bg-rose-500/5 border-rose-500/20"}
      ${locked ? "opacity-40" : ""}`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border
          ${status?.online ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"}`}>
          {icon}
        </div>
        <div>
          <div className="font-mono text-xs text-white/40 uppercase tracking-widest mb-1">{label}</div>
          <div className="text-sm text-white font-light">{model}</div>
          <div className="font-mono text-xs text-white/30 truncate max-w-[180px] mt-0.5">{host}</div>
        </div>
      </div>
      <div className="text-right shrink-0">
        <StatusDot online={status?.online ?? false} latency={status?.latency_ms} />
        {locked && <div className="font-mono text-xs text-white/30 mt-1">BLOCKED</div>}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { logout, user } = useAuth();
  const [clinicName, setClinicName] = useState(user?.clinic_name || "My Clinic");
  const [edgeUrl, setEdgeUrl] = useState(
    (typeof window !== "undefined" && localStorage.getItem("matrix_edge_url")) ||
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  );

  const [topology, setTopology] = useState<TopologyState | null>(null);
  const [selectedMode, setSelectedMode] = useState<TopologyMode>("HYBRID");
  const [fallbackEnabled, setFallbackEnabled] = useState(true);
  const [visionEnabled, setVisionEnabled] = useState(true);
  const [execEnabled, setExecEnabled] = useState(true);
  const [dataCollectionEnabled, setDataCollectionEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch topology status from backend ────────────────────────────────────
  const fetchTopology = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const data = await apiClient.getTopology();
      setTopology(data);
      setSelectedMode(data.mode);
      setFallbackEnabled(data.fallback_enabled);
      setVisionEnabled(data.vision_enabled);
      setExecEnabled(data.executive_agent_enabled);
      setDataCollectionEnabled(data.data_collection_enabled || false);
      setError(null);
    } catch (e) {
      setError("Cannot reach Edge service. Check your Edge URL in settings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchTopology(); }, [fetchTopology]);

  // ── Apply topology to backend ─────────────────────────────────────────────
  const applyTopology = async () => {
    setSaving(true);
    try {
      const result = await apiClient.setTopology({
        mode: selectedMode,
        fallback_enabled: fallbackEnabled,
        vision_enabled: visionEnabled,
        executive_agent_enabled: execEnabled,
        data_collection_enabled: dataCollectionEnabled,
      });
      setTopology(result);
      if (typeof window !== "undefined") {
        localStorage.setItem("matrix_clinic", clinicName);
        localStorage.setItem("matrix_edge_url", edgeUrl);
        localStorage.setItem("matrix_topology", selectedMode);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError("Failed to apply topology. Edge service may be unreachable.");
    } finally {
      setSaving(false);
    }
  };

  const activeModeConfig = MODES.find(m => m.id === selectedMode);

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto animate-in fade-in duration-700 pb-24">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-2">System Config</h1>
          <p className="text-white/40 font-mono tracking-widest uppercase text-sm">Topology · Routing · Fallbacks</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono tracking-widest uppercase
            ${topology?.model_status.edge_4b.online
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${topology?.model_status.edge_4b.online ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`} />
            {topology?.model_status.edge_4b.online ? "Edge Online" : "Edge Offline"}
          </div>
          <button onClick={() => fetchTopology(true)} className="p-2 rounded-full border border-white/10 hover:border-white/20 text-white/40 hover:text-white transition-all">
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-light">
          <AlertTriangle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* ── Network Topology Selector ─────────────────────────────────────── */}
      <section className="spatial-panel p-8 md:p-10 hover:border-emerald-500/30 transition-all duration-500 group">
        <div className="flex items-start gap-5 mb-8 border-b border-white/5 pb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors duration-500">
            <Activity size={24} />
          </div>
          <div className="pt-1">
            <h3 className="text-2xl font-light text-white mb-1">Network Topology</h3>
            <p className="text-sm font-light text-white/40">Controls which models are active and how data is routed</p>
            {topology?.updated_at && (
              <p className="font-mono text-xs text-white/20 mt-1">
                Last updated by <span className="text-white/40">{topology.updated_by}</span> at{" "}
                {new Date(topology.updated_at * 1000).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`flex flex-col gap-3 p-6 rounded-2xl border text-left transition-all duration-300 group/card
                ${selectedMode === mode.id
                  ? mode.color === "rose" ? "bg-rose-500/15 border-rose-500/50"
                    : mode.color === "amber" ? "bg-amber-500/15 border-amber-500/50"
                    : "bg-cyan-500/15 border-cyan-500/50"
                  : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border
                  ${selectedMode === mode.id
                    ? mode.color === "rose" ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                      : mode.color === "amber" ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                      : "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                    : "bg-white/5 border-white/10 text-white/40"}`}>
                  {mode.icon}
                </div>
                {selectedMode === mode.id && (
                  <CheckCircle size={16} className={
                    mode.color === "rose" ? "text-rose-400" : mode.color === "amber" ? "text-amber-400" : "text-cyan-400"
                  } />
                )}
              </div>
              <div>
                <div className={`font-mono text-sm font-medium uppercase tracking-widest
                  ${selectedMode === mode.id
                    ? mode.color === "rose" ? "text-rose-400" : mode.color === "amber" ? "text-amber-300" : "text-cyan-400"
                    : "text-white"}`}>
                  {mode.title}
                </div>
                <div className="text-xs text-white/40 mt-0.5">{mode.subtitle}</div>
              </div>
              <p className="text-xs font-light text-white/50 leading-relaxed">{mode.desc}</p>
            </button>
          ))}
        </div>

        {/* Detail panel for selected mode */}
        {activeModeConfig && (
          <div className={`rounded-2xl p-6 border grid md:grid-cols-2 gap-6 transition-all duration-300
            ${selectedMode === "OFFLINE" ? "bg-rose-500/5 border-rose-500/20"
              : selectedMode === "HYBRID" ? "bg-amber-500/5 border-amber-500/20"
              : "bg-cyan-500/5 border-cyan-500/20"}`}>
            <div>
              <div className="font-mono text-xs text-white/30 uppercase tracking-widest mb-3">Active Capabilities</div>
              <div className="flex flex-col gap-2">
                {activeModeConfig.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white/70 font-light">
                    <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-mono text-xs text-white/30 uppercase tracking-widest mb-3">Trade-off</div>
              <div className="flex items-start gap-2 text-sm text-white/50 font-light">
                <XCircle size={13} className="text-rose-400 shrink-0 mt-0.5" />
                {activeModeConfig.trade}
              </div>

              {/* Toggles */}
              <div className="mt-4 flex flex-col gap-3">
                {[
                  { label: "Rule-based Fallback", val: fallbackEnabled, set: setFallbackEnabled, always: false },
                  { label: "Vision Agent (PaliGemma)", val: visionEnabled, set: setVisionEnabled, always: selectedMode === "OFFLINE" },
                  { label: "Executive Agent (27B)", val: execEnabled, set: setExecEnabled, always: selectedMode === "OFFLINE" },
                  { label: "Share Data for AI Fine-Tuning", val: dataCollectionEnabled, set: setDataCollectionEnabled, always: false },
                ].map(({ label, val, set, always }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className={`text-xs font-light ${always ? "text-white/20" : "text-white/50"}`}>{label}</span>
                    <button
                      disabled={always}
                      onClick={() => set(!val)}
                      className={`w-10 h-5 rounded-full transition-all duration-300 relative
                        ${(always ? false : val) ? "bg-emerald-500/60" : "bg-white/10"}
                        ${always ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300
                        ${(always ? false : val) ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Live Model Status ─────────────────────────────────────────────── */}
      <section className="spatial-panel p-8 md:p-10 hover:border-violet-500/30 transition-all duration-500 group">
        <div className="flex items-start gap-5 mb-8 border-b border-white/5 pb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center border bg-violet-500/10 border-violet-500/30 text-violet-400 group-hover:bg-violet-500/20 transition-colors duration-500">
            <Server size={24} />
          </div>
          <div className="pt-1">
            <h3 className="text-2xl font-light text-white mb-1">Live Model Status</h3>
            <p className="text-sm font-light text-white/40">Real-time health probe for all inference endpoints</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <ServiceCard
            icon={<Cpu size={18} />}
            label="Edge 4B · Risk + Guideline"
            model={topology?.model_status.edge_4b.model ?? "MedGemma-4B (Ollama)"}
            host={topology?.model_status.edge_4b.host ?? "http://localhost:11434"}
            status={topology?.model_status.edge_4b}
          />
          <ServiceCard
            icon={<Cloud size={18} />}
            label="Cloud 27B · Executive Agent"
            model={topology?.model_status.cloud_27b.model ?? "MedGemma-27B (SageMaker)"}
            host={topology?.model_status.cloud_27b.host ?? "http://localhost:9000"}
            status={topology?.model_status.cloud_27b}
            locked={selectedMode === "OFFLINE"}
          />
          <ServiceCard
            icon={<Eye size={18} />}
            label="Vision 3B · PaliGemma"
            model={topology?.model_status.vision_3b.model ?? "PaliGemma-3B (SageMaker)"}
            host={topology?.model_status.vision_3b.host ?? "Cloud /vision_analysis"}
            status={topology?.model_status.vision_3b}
            locked={selectedMode === "OFFLINE" || !visionEnabled}
          />
        </div>
      </section>

      {/* ── Clinic Identity ───────────────────────────────────────────────── */}
      <section className="spatial-panel p-8 md:p-10 hover:border-cyan-500/30 transition-all duration-500 group">
        <div className="flex items-start gap-5 mb-8 border-b border-white/5 pb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center border bg-cyan-500/10 border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors duration-500">
            <Info size={24} />
          </div>
          <div className="pt-1">
            <h3 className="text-2xl font-light text-white mb-1">Clinic Identity</h3>
            <p className="text-sm font-light text-white/40">Used in audit logs and cloud escalation payloads</p>
          </div>
        </div>
        <div className="space-y-5">
          {[
            { label: "Clinic / Hospital Name", value: clinicName, set: setClinicName, id: "clinic-name" },
            { label: "Edge API URL", value: edgeUrl, set: setEdgeUrl, id: "edge-url" },
          ].map(f => (
            <div key={f.id}>
              <label htmlFor={f.id} className="label-mono text-white/50 block mb-2 uppercase tracking-widest text-xs">{f.label}</label>
              <input
                id={f.id} value={f.value}
                onChange={e => f.set(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-5 py-4 font-mono text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.04] transition-all placeholder:text-white/20"
                placeholder="Enter value"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Security note */}
      <div className="flex items-start gap-4 p-6 rounded-2xl bg-amber-500/[0.05] border border-amber-500/20 text-sm text-amber-400/80 font-light leading-relaxed">
        <Key size={18} className="flex-shrink-0 mt-0.5 text-amber-400" />
        <div>
          JWT secret keys and API tokens are loaded from <code className="font-mono bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-300">edge/.env</code> and <code className="font-mono bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-300">cloud/.env</code> via environment variables. They are never stored in browser memory.
        </div>
      </div>

      {/* Sign out */}
      <div className="spatial-panel p-8 hover:border-rose-500/30 transition-all duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <LogOut size={24} />
            </div>
            <div>
              <h3 className="text-xl font-light text-white">User Session</h3>
              <p className="text-sm font-light text-white/40">{user?.username || "Clinic operator"} · {user?.clinic_name || "Demo Clinic"}</p>
            </div>
          </div>
          <button onClick={logout} className="px-8 py-3 rounded-xl border border-rose-500/30 text-rose-400 text-sm font-mono tracking-widest hover:bg-rose-500/10 transition-all">
            SIGN OUT
          </button>
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={applyTopology}
        disabled={saving}
        className="spatial-btn spatial-btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 disabled:opacity-60"
      >
        {saving ? <RefreshCw size={20} className="animate-spin" /> : saved ? <ShieldCheck size={20} /> : <Save size={20} />}
        {saving ? "Applying to Edge Node..." : saved ? `✓ ${selectedMode} Mode Active` : "Apply Topology & Save"}
      </button>
    </div>
  );
}
