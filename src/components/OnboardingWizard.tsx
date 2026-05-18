import { useMemo, useState } from "react";
import { data } from "@/lib/training-data";
type RiskTier = "high" | "medium" | "low";

const STORAGE_KEY = "onboarding-done";

export function isOnboardingDone(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "1";
}

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [previewTier, setPreviewTier] = useState<RiskTier | null>(null);
  const { viewer, issuesSummary } = data;

  const next = () => setStep((s) => s + 1);
  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    onComplete();
  };

  const tiers: { tier: RiskTier; icon: string; label: string; count: number }[] = [
    { tier: "high", icon: "🔴", label: "High", count: issuesSummary.byTier.high },
    { tier: "medium", icon: "🟡", label: "Medium", count: issuesSummary.byTier.medium },
    { tier: "low", icon: "🟢", label: "Low", count: issuesSummary.byTier.low },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-screen-sm px-4 py-8">
        <div className="flex gap-1 mb-6" aria-label="Onboarding progress">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-cyan-500" : "bg-slate-800"}`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold tracking-tight">
              Hi {viewer.fullName.split(" ")[0]}.
            </h1>
            <p className="text-slate-300">
              A fast, honest picture of how your team is tracking against required
              training — and what to trust in the numbers.
            </p>
            <button
              onClick={next}
              className="w-full rounded-2xl bg-cyan-500 text-slate-950 font-medium py-3 min-h-[44px]"
            >
              Continue
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight">
              Before you trust the numbers, here's what we found.
            </h2>
            <div className="flex gap-2">
              {tiers.map((t) => (
                <button
                  key={t.tier}
                  onClick={() =>
                    setPreviewTier(previewTier === t.tier ? null : t.tier)
                  }
                  className={`flex-1 rounded-full px-3 py-2 text-sm border min-h-[44px] ${
                    previewTier === t.tier
                      ? "bg-slate-800 border-slate-600"
                      : "bg-slate-900 border-slate-800"
                  }`}
                >
                  <span aria-hidden className="mr-1">{t.icon}</span>
                  {t.count} {t.label}
                </button>
              ))}
            </div>
            {previewTier && (
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 text-sm">
                <div className="text-slate-400 text-xs mb-1 uppercase tracking-wide">
                  Top {previewTier} findings
                </div>
                <ul className="space-y-1">
                  {getRisksByTier(previewTier)
                    .slice(0, 3)
                    .map((r, i) => (
                      <li key={i} className="text-slate-200">• {r.title}</li>
                    ))}
                </ul>
              </div>
            )}
            {issuesSummary.description && (
              <p className="text-slate-300 text-sm">{issuesSummary.description}</p>
            )}
            <ul className="space-y-2 text-sm text-slate-300">
              {issuesSummary.topConcerns.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-slate-500">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={next}
              className="w-full rounded-2xl bg-cyan-500 text-slate-950 font-medium py-3 min-h-[44px]"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight">How to read this</h2>
            <p className="text-slate-300">
              Your ring shows your team's training as the default. Tap{" "}
              <span className="font-medium text-slate-100">Individual</span> to switch
              to your own.
            </p>
            <p className="text-slate-300">
              The same toggle works for every team member who supervises others.
            </p>
            <button
              onClick={next}
              className="w-full rounded-2xl bg-cyan-500 text-slate-950 font-medium py-3 min-h-[44px]"
            >
              Continue
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">Ready.</h2>
            <p className="text-slate-300">Let's look at your team.</p>
            <button
              onClick={finish}
              className="w-full rounded-2xl bg-cyan-500 text-slate-950 font-medium py-3 min-h-[44px]"
            >
              Show me my team
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
