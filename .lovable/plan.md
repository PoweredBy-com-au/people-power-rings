
## Goal

Replace the current Apple Fitness–style org training app with the V1 spec from `lovable_prompt.md`: a mobile-first read-only dashboard for line manager Dan Kelleher, driven entirely by the attached `dan_team_data.json`. Four routes, one big ring, calm honest tone, no four-category split, no org hierarchy.

This is a significant pivot. The existing People/Technical/Safety/Business taxonomy, multi-level drill-down, and synthetic org data get retired.

## Data

- Copy `user-uploads://dan_team_data.json` to `src/data/dan_team_data.json` and import it statically.
- Add `src/lib/training-data.ts` (replace the existing file) exposing strongly-typed `AppData`, `Person`, `PersonItem`, `RiskItem`, `ItemReference`, plus small helpers:
  - `getData()` → typed `AppData`
  - `getPersonById(id)`
  - `getRisksByTier(tier)`
  - `sortPeopleByCompletion(people)` (ascending — worst first)

## Routes (TanStack Start, file-based)

All routes use a shared `max-w-screen-sm` centred layout, slate-50 background, dark mode via `dark:` variants. Keep `PasswordGate`. Remove `OnboardingWizard` from the landing flow for V1 (the risk landing IS the onboarding).

1. `src/routes/index.tsx` — Risk landing
   - Three stacked tier cards (high / medium / low) with count, blurb, top-3 risk titles, CTA → `/risks/{tier}`.
   - "Continue to dashboard" button → `/dashboard`.
   - Tier colors: red-600, amber-600, green-600 with 10–15% tint backgrounds.

2. `src/routes/dashboard.tsx` — Team dashboard
   - Header: viewer name + role + site (small).
   - Hero `Ring` ~240px showing `hardFacts.completionPct`, calm cyan, shifting amber when <50%.
   - Three stat tiles (overdue / due soon / items required) — each filters the team list below via URL query `?filter=`.
   - "Hard facts" panel (collapsible, expanded) — 4 lines from `hardFacts`.
   - "Inferred from TNA" panel (collapsible, collapsed) — confidence note popover, 2 lines from `inferredFacts`. Warning border if confidence is `low`.
   - Risk badges row: 3 pills → `/risks/{tier}`.
   - Team list: 8 person cards sorted by `completionPct` asc, mini-ring + name + role + site + risk badges + stats. Tap → `/person/{studentId}`.

3. `src/routes/person.$studentId.tsx` — Person detail
   - Header with name, jobTitle, site, contractor pill.
   - Hero ring for that person.
   - Stats row: assigned / completed / overdue / due soon.
   - TNA caveat banner when `tnaNameMatch` is `none` or starts with `fuzzy` (calm amber).
   - Items list with filter tabs (All / Overdue / Due soon / Incomplete / Completed), status icons (⚠️ ✓ 🟡), expandable detail (curriculum, assignment type, completion date).
   - "This person's risk findings" — risks whose `affectedPeople` includes this name.

4. `src/routes/risks.$tier.tsx` — Risk detail
   - Scrollable list of risk items for the tier with tier-coloured left border.
   - Category filter chip row (URL-synced `?category=`).
   - Each card: title, detail, `Affects: a, b, c +N more`, `Action: ...`.

## Components

- `src/components/Ring.tsx` — SVG ring, size + percent + color logic (cyan→amber under 50). Respects `prefers-reduced-motion`. Accessible label.
- `src/components/PersonCard.tsx`
- `src/components/StatTile.tsx`
- `src/components/RiskTierCard.tsx` (landing) and `RiskItemCard.tsx` (detail)
- `src/components/CollapsiblePanel.tsx` — thin wrapper over shadcn `Collapsible` for the Hard Facts / Inferred panels.
- Reuse existing shadcn `Card`, `Badge`, `Tabs`, `Popover`, `Collapsible`, `Button`.

## Cleanup

- Delete: `src/components/TrainingInsights.tsx`, `src/components/FitnessRings.tsx`, `src/components/OnboardingWizard.tsx` (and its hook usage on `/`), the old org/category code in `training-data.ts`.
- Update `src/routes/index.tsx` head meta to "Team Training Insight — Dan Kelleher".
- Per-route `head()` with unique title/description on every route.

## Visual / a11y

- Tailwind tokens: `bg-slate-50 dark:bg-slate-950`, cards `bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4`.
- Ring stroke fills over 1.2s `cubic-bezier(0.4,0,0.2,1)`; disabled under `prefers-reduced-motion`.
- 44px min touch targets, 16px base body, icon+colour for all status (never colour alone), `aria-label` on rings.
- Filter state lives in URL query so deep links work.

## Out of scope (V1)

No four-category split, no org hierarchy, no editing, no charts beyond rings, no backend.
