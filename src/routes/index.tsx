import { createFileRoute } from "@tanstack/react-router";
import TrainingInsights from "@/components/TrainingInsights";
import PasswordGate from "@/components/PasswordGate";
import OnboardingWizard, { useOnboarding } from "@/components/OnboardingWizard";

function IndexPage() {
  const { mounted, done, markDone } = useOnboarding();

  return (
    <PasswordGate>
      {!mounted ? null : !done ? (
        <OnboardingWizard onComplete={markDone} />
      ) : (
        <TrainingInsights />
      )}
    </PasswordGate>
  );
}

export const Route = createFileRoute("/")({
  component: IndexPage,
  head: () => ({
    meta: [
      { title: "Training Insights — People, Technical, Safety, Business" },
      {
        name: "description",
        content:
          "Drill into training required vs completed across your org with Apple Fitness-style rings.",
      },
    ],
  }),
});
