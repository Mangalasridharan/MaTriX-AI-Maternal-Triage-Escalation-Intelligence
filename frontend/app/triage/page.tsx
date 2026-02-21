"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient, CaseResult } from "@/lib/api";
import { IntakeForm } from "@/components/triage/IntakeForm";
import { RiskCard } from "@/components/triage/RiskCard";
import { GuidelinePanel } from "@/components/triage/GuidelinePanel";
import { EscalationBanner } from "@/components/triage/EscalationBanner";

export default function TriagePage() {
  const [result, setResult]     = useState<CaseResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const params = useSearchParams();
  const caseId = params.get("case");

  /* Load existing case if navigated from history */
  const { data: existing } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => apiClient.getCase(caseId!),
    enabled: !!caseId,
  });

  useEffect(() => { if (existing) setResult(existing as any); }, [existing]);

  return (
    <div className="max-w-7xl space-y-0">
      <div className="mb-6">
        <h1 className="heading-lg">Maternal Triage</h1>
        <p className="text-slate-500 text-sm mt-1">
          MedGemma 4B (edge) · WHO RAG · 27B Cloud Escalation
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Form — sticky left */}
        <div className="xl:col-span-4">
          <div className="sticky top-6">
            <IntakeForm onResult={setResult} isLoading={isLoading} setIsLoading={setIsLoading} />
          </div>
        </div>

        {/* Results — right */}
        <div className="xl:col-span-8 space-y-5">
          {!result && !isLoading && (
            <div className="glass flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center mb-4">
                <span className="text-2xl">🩺</span>
              </div>
              <p className="text-slate-500 font-medium">Submit a case to run AI triage</p>
              <p className="text-slate-700 text-xs mt-1">Complete the 3-step wizard on the left</p>
            </div>
          )}

          {isLoading && (
            <div className="glass py-20 flex flex-col items-center justify-center">
              <div className="relative w-16 h-16 mb-5">
                <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-ping-slow" />
                <div className="w-full h-full rounded-full border-2 border-violet-500/40 border-t-violet-500 animate-spin" />
              </div>
              <p className="text-violet-400 font-semibold">Running AI Workflow…</p>
              <p className="text-slate-600 text-xs mt-2">Risk Agent → Guideline Agent → Router</p>
            </div>
          )}

          {result && (
            <>
              <RiskCard risk={result.risk_output} />
              <EscalationBanner result={result} />
              <GuidelinePanel guide={result.guideline_output} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
