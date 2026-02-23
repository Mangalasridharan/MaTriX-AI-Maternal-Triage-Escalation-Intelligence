"use client";
import { useState } from "react";
import Link from "next/link";
import {
  HeartPulse, Cpu, Cloud, Database, Shield,
  ArrowRight, Activity, Network, Users, Terminal, Waves, CheckCircle, Zap,
  Stethoscope, Clock, FileText, Lock
} from "lucide-react";

const STATS = [
  { label: "Edge Response", value: "< 2s", sub: "MedGemma 4B Logic" },
  { label: "Vision Pipeline", value: "3B VQA", sub: "PaliGemma Multimodal" },
  { label: "Cloud Synthesis", value: "27B GGUF", sub: "Expert Escalation" },
  { label: "Swarm Agents", value: "4 Nodes", sub: "Vision-Risk-Guide-Exec" },
];

export default function LandingPage() {
  const [activeArchitectureTab, setActiveArchitectureTab] = useState("vision");
  const [activeWorkflowTab, setActiveWorkflowTab] = useState("vision");

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-cyan-500/30 font-sans">
      
      {/* ── Ambient Background Swarm ──────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-900/10 mix-blend-screen blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute top-[40%] right-[-10%] w-[40%] h-[50%] bg-violet-900/10 mix-blend-screen blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '18s', animationDelay: '5s' }} />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[60%] bg-indigo-900/10 mix-blend-screen blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '15s', animationDelay: '2s' }} />
        {/* Hex Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'103.92304845413264\' viewBox=\'0 0 60 103.92304845413264\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 103.92304845413264l-30-17.320508075688775v-34.64101615137755l30-17.32050807568877v34.64101615137755l30-17.32050807568877v-34.64101615137755l-30-17.320508075688775-30 17.320508075688775v34.64101615137755l30 17.320508075688775v34.64101615137755l30 17.32050807568877v-34.64101615137755z\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }} />
      </div>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-black/40 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center">
              <HeartPulse size={14} className="text-cyan-400" />
            </div>
            <span className="font-mono tracking-widest text-sm text-white/90">MaTriX<span className="text-cyan-400">-AI</span></span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#problem" className="hidden md:block text-xs font-mono tracking-widest text-white/40 hover:text-white transition-colors uppercase">Problem</Link>
            <Link href="#architecture" className="hidden md:block text-xs font-mono tracking-widest text-white/40 hover:text-white transition-colors uppercase">Architecture</Link>
            <Link href="#workflow" className="hidden md:block text-xs font-mono tracking-widest text-white/40 hover:text-white transition-colors uppercase">Workflow</Link>
            
            <div className="w-px h-4 bg-white/10 hidden md:block" />

            <Link href="/login" className="text-xs font-mono tracking-widest text-white/60 hover:text-white transition-colors uppercase">Sign In</Link>
            <Link href="/signup" className="text-xs font-mono tracking-widest px-4 py-2 border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 rounded-full hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all uppercase">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 w-full pt-32 pb-32">
        
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 max-w-[1400px] mx-auto">
          <div className="inline-flex items-center gap-3 border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-xs uppercase font-mono tracking-widest px-5 py-2 rounded-full mb-12 shadow-[0_0_30px_rgba(6,182,212,0.1)] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
            Multimodal 4-Agent Swarm: Vision + Triage + Guidelines + Executive
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-[7.5rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40 mb-8 leading-[1.05] max-w-6xl mx-auto">
            Maternal Triage, <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">Vision-Enhanced Swarm.</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/50 font-light max-w-3xl mx-auto leading-relaxed mb-16">
            Beyond binary risk. MaTriX-AI utilizes deep clinical VQA via <strong>PaliGemma 3B</strong> and local reasoning via <strong>MedGemma 4B</strong> to catch emergencies, escalating only to our <strong>Sharded 27B Cloud Agent</strong> for final care synthesis.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-md mx-auto">
            <Link href="/signup" className="group relative overflow-hidden rounded-2xl w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] transition-opacity" />
              <div className="relative px-8 py-5 text-center flex items-center justify-center gap-3 text-white font-medium tracking-wide">
                <HeartPulse size={20} /> Launch Clinical Swarm <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
              </div>
            </Link>
          </div>
          <Link href="/login?demo=true" className="mt-10 label-mono text-white/30 hover:text-cyan-400 transition-colors flex items-center gap-2">
            <Zap size={14} className="text-amber-400" /> [ ENTER_VIRTUAL_TRIAGE ]
          </Link>
        </section>

        {/* ── Stats ─────────────────────────────────────────── */}
        <section className="py-12 border-y border-white/[0.05] bg-white/[0.01] backdrop-blur-3xl">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-px md:divide-x divide-white/5 text-center">
              {STATS.map(({ label, value, sub }) => (
                <div key={label} className="flex flex-col justify-center px-4">
                  <div className="text-5xl md:text-6xl font-light text-white mb-2 tracking-tight">{value}</div>
                  <div className="text-sm font-medium text-cyan-400 mb-2 uppercase tracking-wide">{label}</div>
                  <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── The Problem / Context ───────────────────────────────────────── */}
        <section id="problem" className="py-32 px-6 max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/2">
              <p className="label-mono text-rose-400 mb-6 flex items-center gap-2"><Activity size={16}/> The Global Challenge</p>
              <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-8 leading-tight">
                Maternal Mortality is <br/>
                <span className="text-rose-400 italic font-medium">Largely Preventable.</span>
              </h2>
              <p className="text-white/50 text-lg font-light leading-relaxed mb-6">
                Over 80% of maternal deaths are preventable, primarily driven by severe bleeding (hemorrhage), infections (sepsis), and high blood pressure (preeclampsia).
              </p>
              <p className="text-white/50 text-lg font-light leading-relaxed mb-8">
                MaTriX-AI bridges the gap between arrival and intervention. By combining <strong>Visual Question Answering (VQA)</strong> with local clinical triage, we ensure rural midwives have expert-level secondary opinions running 100% permissionless on local hardware.
              </p>
              <div className="flex gap-4">
                 <div className="flex bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2 rounded-xl text-sm items-center gap-2">
                   <Clock size={16} /> 0ms Latency
                 </div>
                 <div className="flex bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-2 rounded-xl text-sm items-center gap-2">
                   <Waves size={16} /> Multimodal
                 </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full grid grid-cols-2 gap-4">
               <div className="spatial-panel p-8 bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                  <Activity className="text-rose-400 mb-4" size={32} />
                  <h4 className="text-xl mb-2 font-medium">Visual Triage</h4>
                  <p className="text-white/40 text-sm leading-relaxed">PaliGemma analyzes images for edema, hemorrhage, or clinical pallor instantly.</p>
               </div>
               <div className="spatial-panel p-8 bg-black/40 border border-white/5 hover:border-white/10 transition-colors mt-8">
                  <HeartPulse className="text-amber-400 mb-4" size={32} />
                  <h4 className="text-xl mb-2 font-medium">MedGemma 4B</h4>
                  <p className="text-white/40 text-sm leading-relaxed">Local GGUF execution provides triage scores without requiring internet access.</p>
               </div>
               <div className="spatial-panel p-8 bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                  <Shield className="text-violet-400 mb-4" size={32} />
                  <h4 className="text-xl mb-2 font-medium">Guideline Agent</h4>
                  <p className="text-white/40 text-sm leading-relaxed">RAG-powered grounding ensures every protocol matches WHO/NICE evidence standards.</p>
               </div>
               <div className="spatial-panel p-8 bg-black/40 border border-white/5 hover:border-white/10 transition-colors mt-8">
                  <Cloud className="text-cyan-400 mb-4" size={32} />
                  <h4 className="text-xl mb-2 font-medium">27B Synthesis</h4>
                  <p className="text-white/40 text-sm leading-relaxed">High-parameter cloud models provide final executive plans for critical escalations.</p>
               </div>
            </div>
          </div>
        </section>

        {/* ── Tabbed Architecture Showcase ─────────────────────────────── */}
        <section id="architecture" className="py-32 border-t border-white/[0.05] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="text-center mb-16 relative z-10">
              <p className="label-mono text-cyan-400 mb-4 flex justify-center items-center gap-2"><Network size={16}/> Multimodal Hierarchy</p>
              <h2 className="text-4xl md:text-6xl font-light tracking-tight">System Architecture</h2>
              <p className="text-white/40 mt-6 max-w-2xl mx-auto font-light text-lg">
                Our 4-agent swarm moves through a structured hierarchy to provide maximum safety with minimum cloud reliance.
              </p>
            </div>

            <div className="flex flex-col items-center relative z-10">
              <div className="flex flex-wrap justify-center bg-white/[0.02] border border-white/[0.05] rounded-full p-2 mb-16 backdrop-blur-md">
                <button onClick={() => setActiveArchitectureTab("vision")}
                  className={`px-6 py-3 rounded-full text-sm font-mono tracking-widest transition-all ${activeArchitectureTab === "vision" ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02] border border-transparent'}`}>
                  1. VISION AGENT
                </button>
                <button onClick={() => setActiveArchitectureTab("edge")}
                  className={`px-6 py-3 rounded-full text-sm font-mono tracking-widest transition-all ${activeArchitectureTab === "edge" ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02] border border-transparent'}`}>
                  2. EDGE TRIAGE
                </button>
                <button onClick={() => setActiveArchitectureTab("cloud")}
                  className={`px-6 py-3 rounded-full text-sm font-mono tracking-widest transition-all ${activeArchitectureTab === "cloud" ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02] border border-transparent'}`}>
                  3. EXECUTIVE SYNTHESIS
                </button>
              </div>

              <div className="w-full max-w-6xl mx-auto spatial-panel p-8 md:p-16 relative overflow-hidden min-h-[500px] border border-white/5 bg-black/40 backdrop-blur-2xl">
                
                {activeArchitectureTab === "vision" && (
                  <div className="flex flex-col md:flex-row gap-16 items-center animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
                    <div className="flex-1 space-y-6">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                        <Waves size={32} className="text-indigo-400" />
                      </div>
                      <h3 className="text-4xl font-light">PaliGemma Multimodal VQA</h3>
                      <p className="text-white/60 font-light leading-relaxed text-lg">
                        The frontline agent uses <strong>PaliGemma 3B</strong> to analyze clinical imagery. Whether identifying visual signs of severe edema or clinical pallor, the Vision Agent injects visual context directly into the Triage reasoning pipeline.
                      </p>
                      <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-indigo-400 font-mono text-xs">MODEL</span>
                          <span className="text-white text-lg">PaliGemma 3B-Mix</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-indigo-400 font-mono text-xs">SOURCE</span>
                          <span className="text-white text-lg">Ungated Community Stk</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 relative w-full h-[400px] rounded-3xl bg-black border border-white/5 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 to-transparent opacity-50" />
                      <Activity size={64} className="text-indigo-400 animate-pulse" />
                    </div>
                  </div>
                )}

                {activeArchitectureTab === "edge" && (
                  <div className="flex flex-col md:flex-row gap-16 items-center animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
                    <div className="flex-1 space-y-6">
                      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                        <Cpu size={32} className="text-cyan-400" />
                      </div>
                      <h3 className="text-4xl font-light">MedGemma 4B GGUF Nodes</h3>
                      <p className="text-white/60 font-light leading-relaxed text-lg">
                        Our Triage and Guideline Agents run <strong>MedGemma 4B</strong> as optimized local GGUFs. This allows even sub-$500 laptops to provide expert medical reasoning and WHO guideline citations without any dependency on Google's gated servers.
                      </p>
                    </div>
                    <div className="flex-1 relative w-full h-[400px] rounded-3xl bg-black border border-white/5 flex items-center justify-center overflow-hidden">
                       <Cpu size={64} className="text-cyan-400" />
                    </div>
                  </div>
                )}

                {activeArchitectureTab === "cloud" && (
                  <div className="flex flex-col md:flex-row gap-16 items-center animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
                    <div className="flex-1 space-y-6">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                        <Cloud size={32} className="text-amber-400" />
                      </div>
                      <h3 className="text-4xl font-light">Sharded MedGemma 27B</h3>
                      <p className="text-white/60 font-light leading-relaxed text-lg">
                        When flags trigger, the <strong>Executive Agent</strong> synthesizes all inputs into a final care plan. Utilizing <strong>MedGemma 27B</strong>, it provides high-nuance coordination for transfer, stabilization, and senior clinician review.
                      </p>
                    </div>
                    <div className="flex-1 relative w-full h-[400px] rounded-3xl bg-black border border-white/5 flex items-center justify-center">
                       <Cloud size={80} className="text-amber-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Tabbed Workflow Showcase ─────────────────────────────── */}
        <section id="workflow" className="py-32 px-6 max-w-[1400px] mx-auto">
          <div className="text-center mb-16 relative z-10">
            <p className="label-mono text-violet-400 mb-4 flex justify-center items-center gap-2"><Stethoscope size={16}/> User Experience</p>
            <h2 className="text-4xl md:text-6xl font-light tracking-tight">Clinical Workflow</h2>
          </div>

          <div className="flex justify-center border-b border-white/10 mb-12">
             <button onClick={() => setActiveWorkflowTab("vision")}
                className={`px-8 py-4 font-mono text-xs tracking-widest transition-all ${activeWorkflowTab === "vision" ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-white/30 hover:text-white/60'}`}>
                1. MULTIMODAL INTAKE
             </button>
             <button onClick={() => setActiveWorkflowTab("swarm")}
                className={`px-8 py-4 font-mono text-xs tracking-widest transition-all ${activeWorkflowTab === "swarm" ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/30 hover:text-white/60'}`}>
                2. AGENTIC FEEDBACK
             </button>
          </div>

          <div className="min-h-[300px] flex items-center justify-center">
             {activeWorkflowTab === "vision" && (
                <div className="text-center animate-in fade-in duration-500 max-w-3xl">
                   <h3 className="text-3xl font-light mb-6">Vision-First Triage</h3>
                   <p className="text-white/50 text-lg font-light leading-relaxed">
                     Capture vitals and clinical imagery simultaneously. The system uses vision models to detect objective signs that may be missed in subjective charting.
                   </p>
                </div>
             )}
             {activeWorkflowTab === "swarm" && (
                <div className="text-center animate-in fade-in duration-500 max-w-3xl">
                   <h3 className="text-3xl font-light mb-6">Transparent Audit Trail</h3>
                   <p className="text-white/50 text-lg font-light leading-relaxed">
                     Every agent output is wrapped in a Governance layer, displaying exact reasoning, guideline sources, and a cryptographically signed audit hash for clinician review.
                   </p>
                </div>
             )}
          </div>
        </section>

      </main>
      
      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] bg-black">
        <div className="max-w-[1400px] mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 opacity-50">
            <HeartPulse size={16} className="text-white" />
            <span className="font-mono text-sm tracking-widest">MaTriX-AI <span className="opacity-40">v2.1.0 (Multimodal)</span></span>
          </div>
          <p className="text-white/30 text-sm font-light text-center md:text-left">
            Built with Unsloth GGUFs & FAL weights. No tokens required.
          </p>
          <div className="flex items-center gap-2">
             <span className="label-mono text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">Swarm Active</span>
             <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse" />
          </div>
        </div>
      </footer>
    </div>
  );
}
