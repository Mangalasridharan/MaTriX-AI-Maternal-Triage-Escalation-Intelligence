"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient, CaseResult } from "@/lib/api";
import { IntakeForm } from "@/components/triage/IntakeForm";
import { RiskCard } from "@/components/triage/RiskCard";
import { GuidelinePanel } from "@/components/triage/GuidelinePanel";
import { EscalationBanner } from "@/components/triage/EscalationBanner";
import { AgenticSwarmVisualizer } from "@/components/triage/AgenticSwarmVisualizer";
import { VisionResultCard } from "@/components/triage/VisionResultCard";

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
          Vision Agent (PaliGemma) · Edge Logic (4B) · Cloud Executive (27B)
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
          {(isLoading || result) && (
            <AgenticSwarmVisualizer active={isLoading} completed={!!result} />
          )}

          {!result && !isLoading && (
            <div className="spatial-panel flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <span className="text-3xl">🩺</span>
              </div>
              <h3 className="text-xl font-light text-white mb-2">Ready for Analysis</h3>
              <p className="text-white/40 text-sm max-w-xs mx-auto">Submit a case via the Intake Wizard to trigger the Agentic Swarm workflow.</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                 <RiskCard risk={result.risk_output} />
                 <VisionResultCard result={result.vision_output} />
              </div>
              <EscalationBanner result={result} />
              <GuidelinePanel guide={result.guideline_output} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
