"use client";
import { useState } from "react";
import { apiClient, CaseSubmission } from "@/lib/api";
import { User, Activity, Stethoscope, ChevronRight, ChevronLeft, AlertCircle, Check, Cpu } from "lucide-react";

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
          {[1, 2, 3].map((num) => (
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

        {step < 3 ? (
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
