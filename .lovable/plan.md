## Goal

Adopt the V5 dataset (`dan_team_data-5.json`, 422 people across 4 org levels) and extend the existing single-route `TrainingInsights` to drill down at any depth using `managedById`. Keep the JSON-imported data-loading approach. Reset filters on drill-down. Persist filter state in URL search params. Recompute the TNA inferred callout and composition pill at every team level (not only the viewer's).

## Scope

Frontend only. No routing additions beyond the existing `/`. No backend.

## Changes

### 1. Data swap
- Replace `src/data/dan_team_data.json` with the contents of `user-uploads://dan_team_data-5.json`.
- Extend `src/lib/training-data.ts`:
  - Add `level: number` and `managedById: number | string` to `Person`.
  - Add top-level `orgTree: { label; totalPeople; maxDepth; peoplePerLevel; rootViewerStudentId }` to `AppData`.
  - Add helper `getDirectReports(ownerId)` that returns `people.filter(p => String(p.managedById) === String(ownerId))`.
  - Add helper `getTeamCompositionFor(ownerId)` returning `{ employees, contractors }` computed from direct reports (used at non-viewer levels).

### 2. Arbitrary-depth team drill-down (`TrainingInsights.tsx`)
- In `TeamView`, replace the current `isViewer ? data.people : data.people` shortcut with `getDirectReports(ownerId)` so every level shows that owner's direct reports.
- Remove the `isViewer`-only gating on:
  - team-list rendering
  - composition pill
  - TNA inferred callout
- Composition pill at any level: compute from current owner's direct reports. At the viewer level the data file's `viewer.teamComposition` is equivalent; everywhere else compute on the fly.
- TNA inferred callout: at the viewer level keep the global numbers (`inferredFacts.tnaRequiredItemsUnion`, `tnaGapTotal`, `confidence`, `confidenceNotes`). At sub-levels, aggregate over the direct reports: sum of each person's `tnaGap`, count of people with `tnaSheets.length > 0`, and a per-owner confidence label derived from match coverage (`exact` / `fuzzy` / `none` ratios from `perPersonMatch`). Same UI shell — different numbers per level.
- Sub-manager card tap still pushes `{ kind: "team", ownerId }` when `hasTeam`; otherwise `{ kind: "person" }`. Works recursively for L1→L2→L3→L4.
- Breadcrumb label generator already handles arbitrary depth via `resolveOwner`; no change needed.

### 3. Reset filters on drill-down
- `push(view)` in the top-level component also calls `setFilters(DEFAULT_FILTERS)` whenever `view.kind === "team"`.
- `back()` and breadcrumb `popTo()` likewise reset to defaults — simplest mental model, matches the user's choice.

### 4. URL search-param persistence for filters
- Define a Zod schema on the `/` route:
  - `site: string` (default `"all"`)
  - `org: string` (default `"all"`)
  - `type: "all" | "Employee" | "Contractor"` (default `"all"`)
- Use `@tanstack/zod-adapter` `fallback(...).default(...)` for all three.
- `TrainingInsights` reads filters via `Route.useSearch()` and writes via `useNavigate({ from: "/" })` with `search: (prev) => ({ ...prev, ... })`.
- Apply `stripSearchParams({ site: "all", org: "all", type: "all" })` so default values stay out of the URL.
- On drill-down/back, clear params by navigating with all three reset to `"all"`.

### 5. Performance note (kept simple per the user's choice)
- Keep JSON as a static `import` (`import raw from "@/data/dan_team_data.json"`). Cloudflare gzips it; ~14 MB raw will be a one-time first-load cost.
- No virtualization for the team list because each level shows ≤ ~22 cards (viewer has 20 direct reports; deepest non-leaf has fewer).
- Memoize `getDirectReports(ownerId)` results in a single `useMemo` keyed on `ownerId` inside `TeamView`.

## What NOT to change
- Ring component, dark theme, breadcrumb, onboarding wizard, PasswordGate, PersonView items list / TNA caveat banner — all already match V5.
- The `risks` block stays unused.
- No new routes; everything stays under `/`.

## Technical details

- File replace: copy `user-uploads://dan_team_data-5.json` → `src/data/dan_team_data.json` (overwrite).
- Type updates in `src/lib/training-data.ts` are additive; existing callers stay valid.
- `index.tsx` route gains `validateSearch` + `search.middlewares = [stripSearchParams({...})]`. `App` still renders `PasswordGate` → `OnboardingWizard | TrainingInsights`.
- `TrainingInsights` filter state moves from `useState` to `Route.useSearch()` + `useNavigate`. The `FilterSheet` keeps its local draft state and calls `onApply(f)` which navigates.
- TNA per-level aggregation:
  ```ts
  const reports = getDirectReports(ownerId);
  const gap = reports.reduce((a, p) => a + (p.tnaGap || 0), 0);
  const matched = reports.filter(p => p.tnaNameMatch === "exact").length;
  const fuzzy = reports.filter(p => p.tnaNameMatch?.startsWith("fuzzy")).length;
  const confidence =
    matched / reports.length >= 0.66 ? "high"
    : (matched + fuzzy) / reports.length >= 0.5 ? "medium"
    : "low";
  ```

## Verification

1. App boots, onboarding renders Avery's name.
2. Default team view shows ring + 20 direct reports.
3. Tap a sub-manager (e.g. anyone with `↳ N reports`) → pushes new team view with that person's direct reports; breadcrumb shows `Your team › Cameron's team`. Works 4 levels deep.
4. Filter sheet opens; applying Site=… narrows the *current* level's list and ring. URL gains `?site=…`. Refresh restores filters. Drilling down clears them.
5. Composition pill and TNA callout render at non-viewer levels with recomputed numbers.
6. No console errors; check `code--read_console_logs` after preview reloads.
