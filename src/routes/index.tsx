import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import PasswordGate from "@/components/PasswordGate";
import OnboardingWizard, { isOnboardingDone } from "@/components/OnboardingWizard";
import TrainingInsights from "@/components/TrainingInsights";

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
