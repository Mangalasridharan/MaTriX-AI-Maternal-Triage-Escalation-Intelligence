"use client";
import { useState } from "react";
import Link from "next/link";
import {
  HeartPulse, Cpu, Cloud, Database, Shield,
  ArrowRight, Activity, Network, Users, Terminal, Waves, CheckCircle, Zap,
  Stethoscope, Clock, FileText, Lock
} from "lucide-react";

const STATS = [
  { label: "Edge Response", value: "< 2s", sub: "MedGemma 4B Execution" },
  { label: "Guidelines", value: "20+", sub: "WHO/NICE Indexed" },
  { label: "Offline Uptime", value: "100%", sub: "No Internet Required" },
  { label: "Cloud Routing", value: "Automated", sub: "27B Expert Escalation" },
];

export default function LandingPage() {
  const [activeArchitectureTab, setActiveArchitectureTab] = useState("edge");
  const [activeWorkflowTab, setActiveWorkflowTab] = useState("intake");

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
            Powered by MedGemma 4B / Gemma-2-27B Multi-Agent Swarm
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-[7.5rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40 mb-8 leading-[1.05] max-w-6xl mx-auto">
            Maternal Triage, <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">Escalated by AI Swarm.</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/50 font-light max-w-3xl mx-auto leading-relaxed mb-16">
            A hybrid edge-cloud multi-agent architecture. We equip low-resource clinics with offline generative AI to instantly triage maternal emergencies, dynamically escalating to advanced cloud models when critical thresholds are crossed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-md mx-auto">
            <Link href="/signup" className="group relative overflow-hidden rounded-2xl w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] transition-opacity" />
              <div className="relative px-8 py-5 text-center flex items-center justify-center gap-3 text-white font-medium tracking-wide">
                <HeartPulse size={20} /> Deploy Clinic Node <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
              </div>
            </Link>
          </div>
          <Link href="/login?demo=true" className="mt-10 label-mono text-white/30 hover:text-cyan-400 transition-colors flex items-center gap-2">
            <Zap size={14} className="text-amber-400" /> [ TRY_JUDGE_ACCESS ]
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
                Every two minutes, a woman dies during pregnancy or childbirth. Over 80% of these deaths are preventable, primarily driven by severe bleeding, infections, high blood pressure (preeclampsia), and delivery complications.
              </p>
              <p className="text-white/50 text-lg font-light leading-relaxed mb-8">
                The core issue in low-resource settings isn't just a lack of hospitals; it's the <strong>delay in triage and escalation</strong>. Rural clinics often lack the specialized knowledge to instantly identify a deteriorating condition and initiate the correct stabilization protocols before transport.
              </p>
              <div className="flex gap-4">
                 <div className="flex bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2 rounded-xl text-sm items-center gap-2">
                   <Clock size={16} /> Time-Critical
                 </div>
                 <div className="flex bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-xl text-sm items-center gap-2">
                   <Shield size={16} /> Guideline Dependent
                 </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full grid grid-cols-2 gap-4">
               <div className="spatial-panel p-8 bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                  <HeartPulse className="text-rose-400 mb-4" size={32} />
                  <h4 className="text-xl mb-2 font-medium">Hemorrhage</h4>
                  <p className="text-white/40 text-sm leading-relaxed">Leading cause of maternal death. Requires immediate crystalloid fluids and uterotonics.</p>
               </div>
               <div className="spatial-panel p-8 bg-black/40 border border-white/5 hover:border-white/10 transition-colors mt-8">
                  <Activity className="text-amber-400 mb-4" size={32} />
                  <h4 className="text-xl mb-2 font-medium">Preeclampsia</h4>
                  <p className="text-white/40 text-sm leading-relaxed">BP &gt; 140/90. Requires rapid magnesium sulfate administration to prevent seizures.</p>
               </div>
               <div className="spatial-panel p-8 bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                  <Shield className="text-violet-400 mb-4" size={32} />
                  <h4 className="text-xl mb-2 font-medium">Sepsis</h4>
                  <p className="text-white/40 text-sm leading-relaxed">Severe infection. Requires broad-spectrum IV antibiotics within the first hour.</p>
               </div>
               <div className="spatial-panel p-8 bg-black/40 border border-white/5 hover:border-white/10 transition-colors mt-8">
                  <Database className="text-cyan-400 mb-4" size={32} />
                  <h4 className="text-xl mb-2 font-medium">Knowledge Gap</h4>
                  <p className="text-white/40 text-sm leading-relaxed">Midwives may lack instant access to complex WHO/NICE guidelines during emergencies.</p>
               </div>
            </div>
          </div>
        </section>

        {/* ── Tabbed Architecture Showcase ─────────────────────────────── */}
        <section id="architecture" className="py-32 border-t border-white/[0.05] relative">
          {/* Extremely subtle background glow for this section */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="text-center mb-16 relative z-10">
              <p className="label-mono text-cyan-400 mb-4 flex justify-center items-center gap-2"><Network size={16}/> Hybrid Topology</p>
              <h2 className="text-4xl md:text-6xl font-light tracking-tight">System Architecture</h2>
              <p className="text-white/40 mt-6 max-w-2xl mx-auto font-light text-lg">
                MaTriX-AI utilizes an asynchronous, multi-agent LangGraph workflow that distributes compute across local clinic hardware and scalable cloud infrastructure.
              </p>
            </div>

            <div className="flex flex-col items-center relative z-10">
              {/* Tabs */}
              <div className="flex flex-wrap justify-center bg-white/[0.02] border border-white/[0.05] rounded-full p-2 mb-16 backdrop-blur-md">
                <button onClick={() => setActiveArchitectureTab("edge")}
                  className={`px-6 py-3 rounded-full text-sm font-mono tracking-widest transition-all ${activeArchitectureTab === "edge" ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02] border border-transparent'}`}>
                  1. LOCAL EDGE AGENT
                </button>
                <button onClick={() => setActiveArchitectureTab("rag")}
                  className={`px-6 py-3 rounded-full text-sm font-mono tracking-widest transition-all ${activeArchitectureTab === "rag" ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02] border border-transparent'}`}>
                  2. PGVECTOR RAG
                </button>
                <button onClick={() => setActiveArchitectureTab("cloud")}
                  className={`px-6 py-3 rounded-full text-sm font-mono tracking-widest transition-all ${activeArchitectureTab === "cloud" ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02] border border-transparent'}`}>
                  3. CLOUD ESCALATION
                </button>
              </div>

              {/* Tab Content Panels */}
              <div className="w-full max-w-6xl mx-auto spatial-panel p-8 md:p-16 relative overflow-hidden min-h-[500px] border border-white/5 bg-black/40 backdrop-blur-2xl">
                
                {/* EDGE TAB */}
                {activeArchitectureTab === "edge" && (
                  <div className="flex flex-col md:flex-row gap-16 items-center animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
                    <div className="flex-1 space-y-6">
                      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                        <Cpu size={32} className="text-cyan-400" />
                      </div>
                      <h3 className="text-4xl font-light">MedGemma 4B Edge Node</h3>
                      <p className="text-white/60 font-light leading-relaxed text-lg">
                        The entire primary triage engine runs <strong>offline on local clinic hardware</strong>. By utilizing quantized Google Gemma 4B models (running via Ollama), rural clinics without reliable internet can instantly evaluate maternal vitals and symptoms.
                      </p>
                      <p className="text-white/60 font-light leading-relaxed text-lg">
                        This local agent constructs a comprehensive risk profile within 2 seconds, completely mitigating connectivity delays during critical hemorrhage or preeclampsia events.
                      </p>
                      <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-cyan-400 font-mono text-xs">LATENCY</span>
                          <span className="text-white text-lg">Local (0ms transit)</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-cyan-400 font-mono text-xs">PRIVACY</span>
                          <span className="text-white text-lg">100% On-Premise PHI</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Visualizer */}
                    <div className="flex-1 relative w-full h-[400px] rounded-3xl bg-black border border-white/5 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/20 to-transparent opacity-50" />
                      {/* Abstract Local Node Graphic */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-48 h-48 rounded-full border border-cyan-500/30 flex items-center justify-center relative bg-cyan-500/5">
                           <div className="absolute inset-2 border border-cyan-400/20 rounded-full animate-spin-slow" />
                           <div className="absolute inset-6 border border-cyan-400/10 rounded-full animate-reverse-spin" />
                           <Cpu size={48} className="text-cyan-400" />
                        </div>
                        <div className="mt-8 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 font-mono text-xs tracking-widest">
                          INFERENCE EXECUTING
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* RAG TAB */}
                {activeArchitectureTab === "rag" && (
                  <div className="flex flex-col md:flex-row gap-16 items-center animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
                    <div className="flex-1 space-y-6">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                        <Database size={32} className="text-indigo-400" />
                      </div>
                      <h3 className="text-4xl font-light">Clinical RAG Engine</h3>
                      <p className="text-white/60 font-light leading-relaxed text-lg">
                        Generative AI is prone to hallucination. In maternal healthcare, this is unacceptable. The local agent mitigates this by utilizing a <strong>Retrieval-Augmented Generation (RAG)</strong> architecture.
                      </p>
                      <p className="text-white/60 font-light leading-relaxed text-lg">
                        We process patient vitals against a `pgvector` database containing densely embedded chunks of WHO, NICE, and RCOG guidelines. The AI is forced to cite exact stabilization protocols, returning explicit instructions regarding Magnesium Sulfate dosages or fluid resuscitation.
                      </p>
                    </div>
                    
                    {/* Visualizer */}
                    <div className="flex-1 relative w-full h-[400px] rounded-3xl bg-black border border-white/5 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 to-transparent opacity-50" />
                      {/* Search Graphic */}
                      <div className="relative z-10 w-full px-8">
                         <div className="h-10 w-full bg-white/5 border border-white/10 rounded-lg flex items-center px-4 mb-8 relative overflow-hidden">
                            <span className="font-mono text-xs text-white/40">Query // BP 160/110, Proteinuria ++</span>
                            <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-indigo-500/20 to-transparent" />
                         </div>
                         <div className="space-y-3">
                            <div className="h-16 w-full border border-indigo-500/30 bg-indigo-500/10 rounded-lg flex flex-col justify-center px-4 relative overflow-hidden">
                               <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400" />
                               <span className="text-indigo-300 font-mono text-xs mb-1">WHO Protocol 2.1A</span>
                               <span className="text-white/60 text-xs">Cosine Similarity: 0.924</span>
                            </div>
                            <div className="h-16 w-full border border-white/10 bg-white/5 rounded-lg flex flex-col justify-center px-4">
                               <span className="text-white/40 font-mono text-xs mb-1">NICE Guideline NG133</span>
                               <span className="text-white/30 text-xs">Cosine Similarity: 0.811</span>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CLOUD TAB */}
                {activeArchitectureTab === "cloud" && (
                  <div className="flex flex-col md:flex-row gap-16 items-center animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
                    <div className="flex-1 space-y-6">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                        <Cloud size={32} className="text-amber-400" />
                      </div>
                      <h3 className="text-4xl font-light">Cloud Executive API</h3>
                      <p className="text-white/60 font-light leading-relaxed text-lg">
                        If the local Edge node detects a severe complication (e.g., imminent eclampsia or severe sepsis), it triggers a secure, asynchronous escalation to the <strong>Cloud API</strong>.
                      </p>
                      <p className="text-white/60 font-light leading-relaxed text-lg">
                        The Cloud API leverages a massive <strong>Gemma 2 27B Parameter model</strong> running on AWS infrastructure. This model possesses deep clinical nuance to synthesize the raw local data into a highly structured Executive Care Plan, guiding the clinic on stabilization, transport urgency, and receiving-facility requirements.
                      </p>
                    </div>
                    
                    {/* Visualizer */}
                    <div className="flex-1 relative w-full h-[400px] rounded-3xl bg-black border border-white/5 flex items-center justify-center overflow-hidden group">
                      <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-amber-500/10 blur-[100px] group-hover:bg-amber-500/20 transition-all duration-1000" />
                      <div className="relative z-10 flex flex-col items-center">
                         <Cloud size={64} className="text-amber-400 mb-8 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                         <div className="p-6 border border-amber-500/20 bg-amber-500/5 rounded-xl backdrop-blur-md w-64">
                            <div className="font-mono text-amber-400 text-[10px] tracking-widest uppercase mb-4 border-b border-amber-500/20 pb-2">Generating Care Plan</div>
                            <div className="space-y-2">
                               <div className="h-2 bg-amber-500/40 rounded w-full" />
                               <div className="h-2 bg-amber-500/20 rounded w-5/6" />
                               <div className="h-2 bg-amber-500/20 rounded w-4/6" />
                            </div>
                         </div>
                      </div>
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
            <p className="text-white/40 mt-6 max-w-2xl mx-auto font-light text-lg">
              We redesigned the traditional EHR interface into a spatial, immersive layout that reduces cognitive load during high-stress obstetrical emergencies.
            </p>
          </div>

          {/* Workflow Tabs */}
          <div className="flex justify-center border-b border-white/10 mb-12">
             <button onClick={() => setActiveWorkflowTab("intake")}
                className={`px-8 py-4 font-mono text-xs tracking-widest transition-all ${activeWorkflowTab === "intake" ? 'text-violet-400 border-b-2 border-violet-400' : 'text-white/30 hover:text-white/60'}`}>
                1. IMMERSIVE INTAKE
             </button>
             <button onClick={() => setActiveWorkflowTab("triage")}
                className={`px-8 py-4 font-mono text-xs tracking-widest transition-all ${activeWorkflowTab === "triage" ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/30 hover:text-white/60'}`}>
                2. AI TRIAGE RESULTS
             </button>
             <button onClick={() => setActiveWorkflowTab("history")}
                className={`px-8 py-4 font-mono text-xs tracking-widest transition-all ${activeWorkflowTab === "history" ? 'text-white border-b-2 border-white' : 'text-white/30 hover:text-white/60'}`}>
                3. TIMELINE & ANALYTICS
             </button>
          </div>

          <div className="min-h-[400px] flex items-center justify-center">
             {activeWorkflowTab === "intake" && (
                <div className="text-center animate-in fade-in duration-500 max-w-3xl">
                   <div className="w-20 h-20 mx-auto rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mb-8">
                     <FileText size={32} className="text-violet-400" />
                   </div>
                   <h3 className="text-3xl font-light mb-6">Typeform-Style Patient Admission</h3>
                   <p className="text-white/50 text-lg font-light leading-relaxed">
                     Traditional medical forms are dense and overwhelming. Our intake flow presents one clean, massive question at a time. It guides nurses through capturing vitals, gestational age, and symptoms with extreme clarity, ensuring accurate data entry even in chaotic environments.
                   </p>
                </div>
             )}
             {activeWorkflowTab === "triage" && (
                <div className="text-center animate-in fade-in duration-500 max-w-3xl">
                   <div className="w-20 h-20 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-8">
                     <HeartPulse size={32} className="text-cyan-400" />
                   </div>
                   <h3 className="text-3xl font-light mb-6">Spatial Risk Profiling</h3>
                   <p className="text-white/50 text-lg font-light leading-relaxed">
                     Once submitted, the UI transforms into a fullscreen spatial overlay. The risk severity dictates the ambient light (Cyan for Safe, Rose for Critical). It displays a large gauge, exact clinical reasoning, and tabbed WHO guidelines for immediate drug administration or stabilization tasks.
                   </p>
                </div>
             )}
             {activeWorkflowTab === "history" && (
                <div className="text-center animate-in fade-in duration-500 max-w-3xl">
                   <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/20 flex items-center justify-center mb-8">
                     <Activity size={32} className="text-white" />
                   </div>
                   <h3 className="text-3xl font-light mb-6">Longitudinal Tracking</h3>
                   <p className="text-white/50 text-lg font-light leading-relaxed">
                     All cases are logged into an Apple Health-style timeline. Clinicians can review historical patient interactions, track blood pressure trends over time via integrated Recharts plotting, and monitor the overall risk distribution of the clinic population.
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
            <span className="font-mono text-sm tracking-widest">MaTriX-AI <span className="opacity-40">v2.0.0</span></span>
          </div>
          <p className="text-white/30 text-sm font-light text-center md:text-left">
            Built for low-resource maternal care. Powered by MedGemma 4B & Gemma-2-27b.
          </p>
          <div className="flex items-center gap-6">
            <span className="label-mono text-white/30 flex items-center gap-2"><Lock size={12}/> Secure Endpoints</span>
            <div className="flex items-center gap-2">
               <span className="label-mono text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">System Online</span>
               <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse" />
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
