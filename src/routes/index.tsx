import { createFileRoute } from "@tanstack/react-router";
import FitnessRings from "@/components/FitnessRings";

export const Route = createFileRoute("/")({
  component: FitnessRings,
  head: () => ({
    meta: [
      { title: "Activity Rings — People, Technical, Safety, Business" },
      {
        name: "description",
        content:
          "Apple Fitness-inspired dynamic rings tracking People, Technical, Safety, and Business progress.",
      },
    ],
  }),
});
