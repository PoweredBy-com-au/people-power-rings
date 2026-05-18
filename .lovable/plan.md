## Goal

When the user drills into an individual person, show a list of their training modules with a toggle that defaults to "Completed" and can switch to "Incomplete". Each category (People, Technical, Safety, Business) gets named dummy modules so the list feels real.

## Changes

### 1. `src/lib/training-data.ts` — add module-level dummy data

- Add `Module` type: `{ id, name, category, completed, completedAt? }`.
- Add a curated pool of realistic module names per category, e.g.:
  - People: "Inclusive Leadership", "Giving Effective Feedback", "Conflict Resolution Basics"…
  - Technical: "Secure Coding 101", "Cloud Fundamentals", "Incident Response Drill"…
  - Safety: "Fire Safety Refresher", "Ergonomics at the Desk", "Hazard Reporting"…
  - Business: "Anti-Bribery & Corruption", "Data Privacy (GDPR)", "Financial Controls Overview"…
- Extend `makePerson` to also generate a `modules: Module[]` list. For each category, create `required` modules using names from the pool (deterministic via the existing seed), and mark the first `completed` as `completed: true`, with a fake `completedAt` date in the last ~120 days.
- Extend `OrgNode.training` -> also expose `modules` on persons (or add `modules?: Module[]` to `OrgNode`).

### 2. `src/components/TrainingInsights.tsx` — add the toggle list in person focus

When `isPersonFocus` is true, below the existing module breakdown render a new section:

- Header with a `ToggleGroup` (same style as the existing Team/Individual toggle) with two values: `completed` (default) and `incomplete`.
- A list of module rows filtered by the selected toggle, grouped or tagged by category (colored dot + category label on each row).
- Each row shows: module name, category chip, and either "Completed · {date}" or "Not started".
- Empty state when no modules match (e.g., "All caught up — no incomplete modules").

Keep the existing `ModuleBreakdown` summary above it so the user still sees the per-category percentages.

## Technical notes

- All changes are presentation + dummy data. No backend, no routing changes.
- Use existing design tokens (`bg-white/5`, `border-white/10`, category colors from `CATEGORIES`).
- Default toggle state: `useState<"completed" | "incomplete">("completed")`; reset when `currentId` changes (piggyback on the existing effect).
