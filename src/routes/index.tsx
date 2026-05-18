import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useState } from "react";
import PasswordGate from "@/components/PasswordGate";
import OnboardingWizard, { isOnboardingDone } from "@/components/OnboardingWizard";
import TrainingInsights from "@/components/TrainingInsights";
import DevResetButton from "@/components/DevResetButton";

const FILTER_DEFAULTS = { site: "all", org: "all", type: "all" as const };

const searchSchema = z.object({
  site: fallback(z.string(), "all").default("all"),
  org: fallback(z.string(), "all").default("all"),
  type: fallback(z.enum(["all", "Employee", "Contractor"]), "all").default("all"),
});

function App() {
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(isOnboardingDone());
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <PasswordGate>
      {done ? (
        <TrainingInsights />
      ) : (
        <OnboardingWizard onComplete={() => setDone(true)} />
      )}
    </PasswordGate>
  );
}

export const Route = createFileRoute("/")({
  validateSearch: zodValidator(searchSchema),
  search: { middlewares: [stripSearchParams(FILTER_DEFAULTS)] },
  component: App,
  head: () => ({
    meta: [
      { title: "Team Training Insight" },
      {
        name: "description",
        content:
          "Mobile-first training insight for line managers — team and individual completion at a glance.",
      },
    ],
  }),
});
