"use client";
import { useState } from "react";
import { apiClient, CaseSubmission } from "@/lib/api";
import { User, Activity, Stethoscope, ChevronRight, ChevronLeft, AlertCircle, Check, Camera, Image as ImageIcon, X } from "lucide-react";

/* ── 3-Step Wizard Form ────────────────────────────────────────────
   Step 1: Patient Info   (User icon)
   Step 2: Vital Signs    (Activity icon)
   Step 3: Symptoms       (Stethoscope icon)
   UI pattern: stepped wizard with animated progress bar
──────────────────────────────────────────────────────────────────── */

const STEPS = [
  { id: 1, label: "Patient",  icon: User },
  { id: 2, label: "Vitals",   icon: Activity },
  { id: 3, label: "Symptoms", icon: Stethoscope },
  { id: 4, label: "Vision",   icon: Camera },
];

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
  const [image, setImage]       = useState<string | null>(null);

  const toggleSym = (k: string) =>
    setSymptoms((s) => s.includes(k) ? s.filter((x) => x !== k) : [...s, k]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const canNext = () => {
    if (step === 1) return name && age && ga;
    if (step === 2) return sys && dia;
    return true;
  };

  const handleSubmit = async () => {
    setError(""); setIsLoading(true);
    try {
      const payload: CaseSubmission = {
        name, age: +age, gestational_age_weeks: +ga, notes: notes || undefined,
        vitals: { systolic: +sys, diastolic: +dia, heart_rate: hr ? +hr : undefined, proteinuria: protein },
        symptoms,
        image_data: image || undefined,
      };
      onResult(await apiClient.submitCase(payload));
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Submission failed.");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="glass p-6 space-y-6">
      {/* ── Step indicator ── */}
      <div className="flex items-center gap-0 mb-2">
        {STEPS.map((s, idx) => {
          const done    = step > s.id;
          const active  = step === s.id;
          const Icon    = s.icon;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex flex-col items-center gap-1.5 flex-shrink-0 ${active ? "opacity-100" : done ? "opacity-90" : "opacity-40"}`}>
                <div className={done ? "step-dot-done" : active ? "step-dot-active" : "step-dot-pending"}>
                  {done
                    ? <Check size={13} className="text-emerald-400" strokeWidth={3} />
                    : <Icon size={13} className={active ? "text-white" : "text-slate-600"} />}
                </div>
                <span className="label-xs">{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="step-connector mx-2" />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Patient Info ── */}
      {step === 1 && (
        <div className="space-y-5 pt-2 tab-panel">
          <p className="label-sm text-violet-400">Patient Information</p>

          <div className="field-wrap">
            <input id="name" type="text" placeholder="Full name" value={name}
              onChange={(e) => setName(e.target.value)} className="field-input" required />
            <label htmlFor="name" className="field-label">Patient Name</label>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="field-wrap">
              <input id="age" type="number" placeholder="28" value={age}
                onChange={(e) => setAge(e.target.value)} className="field-input" required />
              <label htmlFor="age" className="field-label">Age (years)</label>
            </div>
            <div className="field-wrap">
              <input id="ga" type="number" placeholder="34" value={ga}
                onChange={(e) => setGa(e.target.value)} className="field-input" required />
              <label htmlFor="ga" className="field-label">Gestation (wks)</label>
            </div>
          </div>

          <div className="field-wrap">
            <textarea id="notes" placeholder="Clinical notes…" rows={2} value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="field-input resize-none" />
            <label htmlFor="notes" className="field-label">Clinical Notes</label>
          </div>
        </div>
      )}

      {/* ── Step 2: Vital Signs ── */}
      {step === 2 && (
        <div className="space-y-5 pt-2 tab-panel">
          <p className="label-sm text-violet-400">Vital Signs</p>

          {/* BP display */}
          <div className="bento-tile flex items-center gap-4">
            <div className="flex-1">
              <p className="label-xs mb-2">Systolic (mmHg)</p>
              <input id="systolic" type="number" placeholder="140" value={sys}
                onChange={(e) => setSys(e.target.value)} className="input-std text-2xl font-black h-14" />
            </div>
            <div className="text-3xl text-slate-700 font-thin">/</div>
            <div className="flex-1">
              <p className="label-xs mb-2">Diastolic (mmHg)</p>
              <input id="diastolic" type="number" placeholder="90" value={dia}
                onChange={(e) => setDia(e.target.value)} className="input-std text-2xl font-black h-14" />
            </div>
          </div>

          {/* BP warning */}
          {sys && +sys >= 140 && (
            <div className="flex items-center gap-2 text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
              <AlertCircle size={14} /> Elevated BP — review symptoms carefully
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="label-xs mb-2">Heart Rate (bpm)</p>
              <input id="hr" type="number" placeholder="88" value={hr}
                onChange={(e) => setHr(e.target.value)} className="input-std" />
            </div>
            <div>
              <p className="label-xs mb-2">Proteinuria</p>
              <select id="proteinuria" value={protein}
                onChange={(e) => setProtein(e.target.value)} className="input-std">
                {["none","trace","1+","2+","3+"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Symptoms ── */}
      {step === 3 && (
        <div className="space-y-4 pt-2 tab-panel">
          <p className="label-sm text-violet-400">Presenting Symptoms</p>
          <p className="text-xs text-slate-600">Select all that apply. Red-marked symptoms trigger escalation.</p>
          <div className="grid grid-cols-2 gap-2">
            {SYMPTOM_LIST.map(({ key, label, danger }) => {
              const checked = symptoms.includes(key);
              return (
                <label key={key} id={`sym-${key}`}
                  className={`symptom-chip ${checked ? (danger ? "checked danger" : "checked") : ""}`}
                  onClick={() => toggleSym(key)}>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all
                    ${checked
                      ? danger ? "bg-rose-500 border-rose-500" : "bg-violet-500 border-violet-500"
                      : "border-slate-700"}`}>
                    {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-xs leading-tight">{label}</span>
                  {danger && <span className="ml-auto text-[9px] text-rose-500/70">⚠</span>}
                </label>
              );
            })}
          </div>

          {symptoms.some((s) => ["headache","visual_disturbance","convulsions"].includes(s)) && (
            <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
              <AlertCircle size={14} />
              Neurological symptoms detected — escalation likely
            </div>
          )}
        </div>
      )}

      {/* ── Step 4: Vision Scan ── */}
      {step === 4 && (
        <div className="space-y-6 pt-2 tab-panel">
          <div className="flex flex-col items-center text-center space-y-2">
            <p className="label-sm text-violet-400">Vision Agent Analysis</p>
            <p className="text-xs text-slate-500 max-w-[240px]">Upload an image of symptoms (e.g. pitting edema) for PaliGemma 3B VQA analysis.</p>
          </div>

          {!image ? (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl h-48 cursor-pointer hover:border-violet-500/40 hover:bg-white/[0.02] transition-all group">
              <ImageIcon size={32} className="text-slate-600 group-hover:text-violet-400 transition-colors mb-3" />
              <span className="text-sm font-medium text-slate-500 group-hover:text-slate-300">Click to upload photo</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          ) : (
            <div className="relative group rounded-3xl overflow-hidden border border-white/10 aspect-video bg-black flex items-center justify-center">
               <img src={image} alt="Clinical preview" className="max-h-full object-contain" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <button onClick={() => setImage(null)} className="p-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors">
                    <X size={20} />
                  </button>
               </div>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">Multimodal swarm enabled</span>
             </div>
             <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                Vision findings will be automatically injected into the Risk Agent's reasoning context.
             </p>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">{error}</div>
      )}

      {/* ── Navigation ── */}
      <div className="flex gap-3 pt-2 border-t border-white/[0.04]">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="btn-ghost flex-none">
            <ChevronLeft size={15} /> Back
          </button>
        )}
        {step < 4 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canNext()}
            className="btn-primary flex-1">
            Continue <ChevronRight size={15} className="ml-auto" />
          </button>
        ) : (
          <button id="submit-case-btn" onClick={handleSubmit} disabled={isLoading}
            className="btn-primary flex-1 py-4">
            {isLoading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <>Run AI Triage <ChevronRight size={15} className="ml-auto" /></>}
          </button>
        )}
      </div>
    </div>
  );
}
