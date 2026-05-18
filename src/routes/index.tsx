import { createFileRoute, Link } from "@tanstack/react-router";
import PasswordGate from "@/components/PasswordGate";
import Shell from "@/components/Shell";
import { data, TIER_META, type RiskTier } from "@/lib/training-data";

const TIERS: RiskTier[] = ["high", "medium", "low"];

function TierCard({ tier }: { tier: RiskTier }) {
  const meta = TIER_META[tier];
  const count =
    tier === "high"
      ? data.risks.highCount
      : tier === "medium"
        ? data.risks.mediumCount
        : data.risks.lowCount;
  const top = data.risks.items[tier].slice(0, 3);
  return (
    <Link
      to="/risks/$tier"
      params={{ tier }}
      className={`block rounded-2xl ${meta.bg} ${meta.border} border p-4 shadow-sm`}
    >
      <div className={`text-lg font-semibold ${meta.text}`}>
        <span className="mr-2" aria-hidden>{meta.icon}</span>
        {count} {meta.label} findings
      </div>
      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{meta.blurb}</p>
      {top.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-slate-800 dark:text-slate-200">
          {top.map((r, i) => (
            <li key={i} className="truncate">• {r.title}</li>
          ))}
        </ul>
      )}
      <div className={`mt-3 text-sm font-medium ${meta.text}`}>
        Review {tier}-risk items →
      </div>
    </Link>
  );
}

function LandingPage() {
  return (
    <PasswordGate>
      <Shell>
        <header className="mb-5">
          <h1 className="text-2xl font-semibold tracking-tight">Before you start</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            A short diagnostic for {data.viewer.name}'s team. Read these, then go to the
            dashboard.
          </p>
        </header>
        <div className="space-y-3">
          {TIERS.map((t) => (
            <TierCard key={t} tier={t} />
          ))}
        </div>
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="block w-full text-center rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 font-medium min-h-[44px]"
          >
            Continue to dashboard
          </Link>
        </div>
      </Shell>
    </PasswordGate>
  );
}

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Team Training Insight — Dan Kelleher" },
      {
        name: "description",
        content:
          "Risk landing for a line manager: high / medium / low-risk training findings across direct reports.",
      },
    ],
  }),
});
