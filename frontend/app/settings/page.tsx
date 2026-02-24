"use client";
import { useState } from "react";
import { Cpu, Cloud, Settings, Key, Save, Info, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { logout, user } = useAuth();
  const [clinicalMode, setClinicalMode] = useState("HYBRID");
  const [clinicName, setClinicName]   = useState(user?.clinic_name || "My Clinic");
  const [edgeUrl, setEdgeUrl]         = useState(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");
  const [cloudUrl, setCloudUrl]       = useState("http://localhost:9000");
  const [saved, setSaved]             = useState(false);

  const handleSignOut = () => logout();

  const save = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("matrix_clinic", clinicName);
      localStorage.setItem("matrix_edge_url", edgeUrl);
      localStorage.setItem("matrix_topology", clinicalMode);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const SECTIONS = [
    {
      title: "Clinic Identity", icon: Info, color: "violet",
      desc: "Identifier used during Cloud Escalation",
      fields: [
        { label: "Clinic / Hospital Name", value: clinicName, set: setClinicName, type: "text", id: "clinic-name" },
      ]
    },
    {
      title: "Edge Server", icon: Cpu, color: "cyan",
      desc: "Local FastAPI service running MedGemma 4B via Ollama",
      fields: [
        { label: "Edge API URL", value: edgeUrl, set: setEdgeUrl, type: "url", id: "edge-url" },
      ]
    },
    {
      title: "Cloud Service", icon: Cloud, color: "amber",
      desc: "HuggingFace Inference Endpoint on AWS (Gemma-2-27B)",
      fields: [
        { label: "Cloud API URL", value: cloudUrl, set: setCloudUrl, type: "url", id: "cloud-url" },
      ]
    },
  ];

  return (
    <div className="flex flex-col gap-12 max-w-3xl mx-auto animate-in fade-in duration-700 pb-24">
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-2">System Config</h1>
          <p className="text-white/40 font-mono tracking-widest uppercase text-sm">Node & Routing Parameters</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-6 py-3 backdrop-blur-md">
           <Settings size={16} className="text-white/60 animate-[spin_4s_linear_infinite]" />
           <span className="font-mono text-xs text-white/60 tracking-widest whitespace-nowrap">LOCAL OVERRIDES</span>
        </div>
      </header>

      <div className="space-y-8">
        {SECTIONS.map(({ title, icon: Icon, color, desc, fields }) => (
          <div key={title} className={`spatial-panel p-8 md:p-10 group transition-all duration-500
            ${color === "violet" ? "hover:border-violet-500/30" : color === "cyan" ? "hover:border-cyan-500/30" : "hover:border-amber-500/30"}`}>
            
            <div className="flex items-start gap-6 mb-8 border-b border-white/5 pb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors duration-500
                ${color === "violet" ? "bg-violet-500/10 border-violet-500/30 text-violet-400 group-hover:bg-violet-500/20" : 
                  color === "cyan" ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500/20" : 
                  "bg-amber-500/10 border-amber-500/30 text-amber-400 group-hover:bg-amber-500/20"}`}>
                <Icon size={24} />
              </div>
              <div className="pt-1">
                <h3 className="text-2xl font-light text-white mb-2">{title}</h3>
                {desc && <p className="text-sm font-light text-white/40">{desc}</p>}
              </div>
            </div>
            
            <div className="space-y-6">
              {fields.map((f) => (
                <div key={f.id} className="relative">
                  <label htmlFor={f.id} className="label-mono text-white/50 block mb-3 uppercase tracking-widest">{f.label}</label>
                  <input 
                    id={f.id} 
                    type={f.type} 
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)} 
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-5 py-4 font-mono text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.04] transition-all placeholder:text-white/20" 
                    placeholder="Enter value"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Dynamic Topology Configurator */}
        <div className="spatial-panel p-8 md:p-10 hover:border-emerald-500/30 transition-all duration-500 group">
          <div className="flex items-start gap-6 mb-8 border-b border-white/5 pb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors duration-500">
              <Settings size={24} />
            </div>
            <div className="pt-1">
              <h3 className="text-2xl font-light text-white mb-2">Network Topology</h3>
              <p className="text-sm font-light text-white/40">Configure Model Routing Architecture</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: "OFFLINE",
                title: "Strict Offline",
                desc: "100% Edge Processing. No 27B Exec Agent. Failsafe Mode.",
                color: "rose"
              },
              {
                id: "HYBRID",
                title: "Hybrid (Default)",
                desc: "Edge 4B Triage + Cloud 27B Escalation. Cost Optimized.",
                color: "amber"
              },
              {
                id: "CLOUD",
                title: "Full Cloud",
                desc: "All agents run on SageMaker G5. Requires persistent 5G.",
                color: "cyan"
              }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setClinicalMode(mode.id)}
                className={`flex flex-col gap-2 p-5 rounded-xl border text-left transition-all duration-300
                  ${clinicalMode === mode.id 
                    ? `bg-${mode.color}-500/20 border-${mode.color}-500/50` 
                    : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`font-mono tracking-widest text-sm uppercase ${clinicalMode === mode.id ? `text-${mode.color}-400` : "text-white"}`}>
                    {mode.title}
                  </span>
                  {clinicalMode === mode.id && <div className={`w-2 h-2 rounded-full animate-pulse bg-${mode.color}-400 shadow-lg`} />}
                </div>
                <span className="text-xs font-light text-white/50 leading-relaxed max-w-[90%]">
                  {mode.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="flex items-start gap-4 p-6 rounded-2xl bg-amber-500/[0.05] border border-amber-500/20 text-sm text-amber-400/80 font-light leading-relaxed backdrop-blur-md">
        <Key size={18} className="flex-shrink-0 mt-0.5 text-amber-400" />
        <div>
          JWT secret keys and API routing tokens are securely loaded from <code className="font-mono bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-300">edge/.env</code> and <code className="font-mono bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-300">cloud/.env</code> via Edge Node environment variables. They are not stored in browser session memory.
        </div>
      </div>

      <div className="spatial-panel p-8 md:p-10 hover:border-rose-500/30 transition-all duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <LogOut size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-light text-white">User Session</h3>
              <p className="text-sm font-light text-white/40">Terminate current clinic session</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="px-8 py-3 rounded-xl border border-rose-500/30 text-rose-400 text-sm font-mono tracking-widest hover:bg-rose-500/10 transition-all">
            SIGN OUT
          </button>
        </div>
      </div>

      <button onClick={save} className="spatial-btn spatial-btn-primary w-full py-5 text-lg flex items-center justify-center gap-3">
        <Save size={20} />
        {saved ? "Parameters Synchronized ✓" : "Synchronize System Parameters"}
      </button>
    </div>
  );
}
