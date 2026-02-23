"use client";
import { useState, useRef, ChangeEvent } from "react";
import { apiClient, CaseSubmission } from "@/lib/api";
import { User, Activity, Stethoscope, ChevronRight, ChevronLeft, AlertCircle, Check, Cpu, Upload, X, ImageIcon } from "lucide-react";

const SYMPTOM_LIST = [
  { key: "headache",               label: "Severe Headache",           danger: true  },
  { key: "visual_disturbance",     label: "Visual Disturbance",        danger: true  },
  { key: "epigastric_pain",        label: "Epigastric Pain",           danger: true  },
  { key: "oedema",                 label: "Significant Oedema",        danger: false },
  { key: "fetal_movement_reduced", label: "Reduced Fetal Movements",   danger: false },
  { key: "convulsions",            label: "Convulsions / Seizures",     danger: true  },
  { key: "dyspnea",                label: "Shortness of Breath",       danger: false },
  { key: "bleeding",               label: "Vaginal Bleeding",          danger: true  },
];

interface Props {
  onResult: (r: any) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
}

export function IntakeForm({ onResult, isLoading, setIsLoading }: Props) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  /* form state */
  const [name, setName]   = useState("");
  const [age, setAge]     = useState("");
  const [ga, setGa]       = useState("");
  const [notes, setNotes] = useState("");
  const [sys, setSys]         = useState("");
  const [dia, setDia]         = useState("");
  const [hr, setHr]           = useState("");
  const [protein, setProtein] = useState("none");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [visionResult, setVisionResult] = useState<any>(null);
  const [isVisionLoading, setIsVisionLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      // Strip prefix for API if needed, but usually the whole data URL is fine if the backend handles it.
      // Our backend says "base64", let's provide the raw base64 part.
      setSelectedImage(base64String.split(',')[1]); 
    };
    reader.readAsDataURL(file);
  };

  const runVisionAnalysis = async () => {
    if (!selectedImage || isVisionLoading) return;
    setIsVisionLoading(true);
    setError("");
    try {
      const res = await apiClient.analyzeVision(selectedImage, "Analyze this maternal clinical image for signs of risk such as edema, blood loss, or anomalies.");
      setVisionResult(res);
    } catch (e) {
      setError("Vision analysis failed. Ensure Cloud service (PaliGemma) is online.");
    } finally {
      setIsVisionLoading(false);
    }
  };

  const toggleSym = (k: string) =>
    setSymptoms((s) => s.includes(k) ? s.filter((x) => x !== k) : [...s, k]);

  const canNext = () => {
    if (step === 1) return name && age && ga;
    if (step === 2) return sys && dia;
    return true;
  };

  const handleSubmit = async () => {
    if (!sys || !dia || !name || !age || !ga) {
      setError("Please ensure all required clinical and patient profile fields are filled.");
      return;
    }
    setError(""); setIsLoading(true);
    try {
      const payload: CaseSubmission = {
        name, age: +age, gestational_age_weeks: +ga, notes: notes || undefined,
        vitals: { systolic: +sys, diastolic: +dia, heart_rate: hr ? +hr : undefined, proteinuria: protein },
        symptoms,
        image_data: selectedImage || undefined,
      };
      onResult(await apiClient.submitCase(payload));
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      if (Array.isArray(detail)) {
        // Handle Pydantic validation error array
        setError(detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(", "));
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError("Submission failed. Please check your inputs.");
      }
    } finally { setIsLoading(false); }
  };

  return (
    <div className="flex flex-col h-full justify-center max-w-2xl mx-auto w-full px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Immersive Step Counter */}
      <div className="mb-12 flex justify-center">
        <div className="flex items-center gap-3 px-6 py-2 rounded-full border border-white/[0.05] bg-white/[0.02] backdrop-blur-md">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`w-2 h-2 rounded-full transition-all duration-500 ${step === num ? 'w-8 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : step > num ? 'bg-white/40' : 'bg-white/10'}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative w-full">
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter text-white/90">Patient Profile</h2>
            <div className="space-y-6">
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="spatial-input text-2xl" autoFocus />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} className="spatial-input text-xl" />
                <input type="number" placeholder="Gestation (Wks)" value={ga} onChange={(e) => setGa(e.target.value)} className="spatial-input text-xl" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter text-white/90">Hemodynamics</h2>
            
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 flex items-center justify-center gap-6">
              <input type="number" placeholder="SYS" value={sys} onChange={(e) => setSys(e.target.value)} 
                className="w-32 bg-transparent text-center text-5xl font-black text-white focus:outline-none placeholder-white/10" autoFocus />
              <span className="text-5xl font-thin text-white/10">/</span>
              <input type="number" placeholder="DIA" value={dia} onChange={(e) => setDia(e.target.value)} 
                className="w-32 bg-transparent text-center text-5xl font-black text-white focus:outline-none placeholder-white/10" />
            </div>
            
            {sys && +sys >= 140 && (
              <div className="flex justify-center animate-in fade-in zoom-in duration-500">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm">
                   <AlertCircle size={14} /> Elevated Blood Pressure Detected
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Heart Rate (BPM)" value={hr} onChange={(e) => setHr(e.target.value)} className="spatial-input" />
              <select value={protein} onChange={(e) => setProtein(e.target.value)} className="spatial-input appearance-none">
                <option value="none" className="bg-black">Proteinuria: None</option>
                <option value="trace" className="bg-black">Proteinuria: Trace</option>
                <option value="1+" className="bg-black">Proteinuria: 1+</option>
                <option value="2+" className="bg-black">Proteinuria: 2+</option>
                <option value="3+" className="bg-black">Proteinuria: 3+</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter text-white/90">Clinical Symptoms</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SYMPTOM_LIST.map(({ key, label, danger }) => {
                const checked = symptoms.includes(key);
                return (
                  <button key={key} onClick={() => toggleSym(key)}
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 text-left
                      ${checked 
                        ? danger ? "border-rose-500 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.15)]" : "border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                        : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]"}`}>
                    <span className={`text-sm md:text-base ${checked ? 'text-white' : 'text-white/60'}`}>{label}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${checked ? (danger ? 'border-rose-500 bg-rose-500' : 'border-cyan-500 bg-cyan-500') : 'border-white/20'}`}>
                      {checked && <Check size={12} className="text-black" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {symptoms.some((s) => ["headache","visual_disturbance","convulsions"].includes(s)) && (
              <div className="flex justify-center animate-in fade-in zoom-in duration-500">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-400 text-sm">
                  <AlertCircle size={14} /> Critical Neurological Signs
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter text-white/90">Multi-Modal Vision</h2>
            
            <div className="bg-black/40 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                 <ImageIcon className="text-violet-400" size={28} />
               </div>
               <h3 className="text-xl font-light text-white mb-2">Upload Clinical Imagery</h3>
               <p className="text-white/40 text-sm max-w-sm mb-8 leading-relaxed">
                 Inject visual context directly into the edge pipeline. <b>PaliGemma 3B (Cloud VLM)</b> will analyze edema or estimate risk from visual signs.
               </p>
               
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleImageSelect} 
                 accept="image/*" 
                 className="hidden" 
               />

               {!imagePreview ? (
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="w-full max-w-sm border-2 border-dashed border-white/10 rounded-2xl p-10 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all cursor-pointer group flex flex-col items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                     <Upload className="text-white/30 group-hover:text-violet-400" size={20} />
                   </div>
                   <div className="space-y-1">
                     <p className="text-white/60 font-medium">Click to select image</p>
                     <p className="text-white/20 text-[10px] uppercase tracking-widest font-mono">PNG, JPG up to 10MB</p>
                   </div>
                 </div>
               ) : (
                 <div className="w-full max-w-md space-y-4">
                   <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-black/50">
                     <img src={imagePreview} alt="Preview" className="w-full h-48 object-contain" />
                     <button 
                       onClick={() => { setImagePreview(null); setSelectedImage(null); setVisionResult(null); }}
                       className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white/70 hover:text-white hover:bg-rose-500 transition-all opacity-0 group-hover:opacity-100">
                       <X size={16} />
                     </button>
                   </div>
                   
                   {!visionResult && (
                     <button
                       onClick={runVisionAnalysis}
                       disabled={isVisionLoading}
                       className={`w-full py-4 rounded-xl font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all
                         ${isVisionLoading 
                           ? 'bg-cyan-500/20 text-cyan-400 cursor-wait' 
                           : 'bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]'}`}>
                       {isVisionLoading ? (
                         <>
                           <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                           PaliGemma Analyzing...
                         </>
                       ) : (
                         <>
                           <Cpu size={14} /> Run PaliGemma Vision Analysis
                         </>
                       )}
                     </button>
                   )}
                 </div>
               )}

               {visionResult && (
                 <div className="mt-6 w-full max-w-md p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-left animate-in zoom-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-emerald-400 font-mono text-[10px] uppercase tracking-widest">VLM Analysis Result</h4>
                      <div className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_5px_#10b981]" />
                    </div>
                    <p className="text-white/90 text-sm font-light leading-relaxed italic">
                      "{visionResult.analysis || visionResult.summary}"
                    </p>
                    {visionResult.findings?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {visionResult.findings.map((f: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-400/10 text-emerald-300 text-[9px] border border-emerald-400/10 font-mono uppercase tracking-tighter">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                 </div>
               )}
               
               <div className="mt-8 flex justify-center">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] text-white/30 text-[9px] font-mono uppercase tracking-widest">
                   {isVisionLoading ? "Synchronizing Cloud..." : "Standard Vision Buffer Idle"}
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-8 p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Navigation Controls */}
      <div className="mt-12 flex items-center justify-between">
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
            <ChevronLeft size={16} /> Previous
          </button>
        ) : <div />}

        {step < 4 ? (
          <button 
            onClick={() => setStep(step + 1)} 
            disabled={!canNext()}
            className={`spatial-btn px-8 py-4 ${canNext() ? 'spatial-btn-primary' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}>
            Continue <ChevronRight size={16} className="ml-2" />
          </button>
        ) : (
          <button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="spatial-btn px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] group">
            {isLoading ? (
              <span className="flex items-center gap-3">
                <Cpu size={18} className="animate-pulse" /> Dispatched to Multi-Agent Swarm
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Cpu size={18} /> Run AI Intelligence Swarm <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
