import { createFileRoute } from "@tanstack/react-router";
import TrainingInsights from "@/components/TrainingInsights";
import PasswordGate from "@/components/PasswordGate";

function IndexPage() {
  return (
    <PasswordGate>
      <TrainingInsights />
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
