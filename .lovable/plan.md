## Goal

Pivot to V3: restore dark theme by default, restore the Apple-Activity glow ring, collapse the multi-route app back to a single-component breadcrumb drill-down, restore a 4-step OnboardingWizard, and switch all person/viewer stats to the new V3 schema (binary `complete | incomplete`, with `personalStats` + `teamStats`, no `overdue`/`dueSoon` anywhere). Anonymised demo persona is now **Skyler Nelson** (`viewer` in the JSON).

## Data

- Replace `src/data/dan_team_data.json` with the new uploaded `dan_team_data-2.json` (schema v2.0, demo persona Skyler Nelson, 8 reports, binary status).
- Rewrite `src/lib/training-data.ts` to the V3 shape exactly as in the prompt:
  - `AppData`: adds `demoMode`, `anonymisationNote`, `issuesSummary`, viewer has `hasTeam/teamSize/personalStats/teamStats`, `team.distinctItemsRequired`.
  - `Person`: `hasTeam`, `teamSize`, `teamStats: Stats | null`, `personalStats: Stats`, items use binary `status: "completed" | "incomplete"`.
  - Helpers: `getData()`, `getPersonById()`, `getRisksByTier()`, plus `sortByCompletion(people)` using `(teamStats ?? personalStats).completionPct` ascending.
  - Keep `TIER_META` but retune for the dark theme (`text-{red|amber|green}-300`, `border-{...}-800/60`, `bg-{...}-950/40`, ring hex unchanged).

## Theme (dark default)

- `src/routes/__root.tsx`: add `className="dark"` to `<html>` so Tailwind's `dark:` branch is the default. Keep light styles as the opt-in.
- `Shell.tsx`: unchanged structurally — already uses `bg-slate-50 dark:bg-slate-950`, which becomes dark-first once `<html class="dark">` is set.

## Ring with glow (`src/components/Ring.tsx`)

Rewrite the SVG to the double-draw pattern from the prompt:
- `<defs><filter id="ring-glow"><feGaussianBlur stdDeviation="3"/></filter></defs>`
- Track circle (slate-800)
- Glowed copy of the active arc wrapped in `<g filter="url(#ring-glow)" opacity="0.7">`
- Sharp active arc on top with the 1.2s `cubic-bezier(0.4,0,0.2,1)` `stroke-dashoffset` transition
- Keep cyan `#0EA5E9`, amber-below-50 shift, `prefers-reduced-motion` (disables fill animation AND glow opacity).
- Keep label/sublabel API; add `viewMode` to the `aria-label` ("Team 42% complete" / "Individual 60% complete").

## Routing collapse

- Delete `src/routes/dashboard.tsx`, `src/routes/person.$studentId.tsx`, `src/routes/risks.$tier.tsx`. The Vite router plugin will regenerate `routeTree.gen.ts`.
- `src/routes/index.tsx` becomes the entire app: `PasswordGate` → `OnboardingWizard` (skipped if `localStorage["onboarding-done"]`) → `<TrainingInsights />`.

## Onboarding (`src/components/OnboardingWizard.tsx`)

Restore as a 4-step wizard, persists `localStorage.setItem("onboarding-done","1")` on completion.
1. **Welcome** — "Hi {viewer.fullName}." + 1-line value prop + Continue.
2. **What we found** — title "Before you trust the numbers, here's what we found." Three tier pills (`🔴 high`, `🟡 medium`, `🟢 low`) from `issuesSummary.byTier`. Body = `issuesSummary.description`. Bullets = `issuesSummary.topConcerns`. Tapping a tier pill shows an inline preview of the first 2–3 titles from `risks.items[tier]`. Continue.
3. **How to read this** — short paragraph about Team/Individual toggle. Continue.
4. **Ready** — "Show me my team" → `onComplete`.

## TrainingInsights (`src/components/TrainingInsights.tsx`)

New single component with internal stack-based navigation:

```ts
type View =
  | { kind: "team"; ownerId: number }
  | { kind: "person"; studentId: number }
  | { kind: "risk-list"; tier: RiskTier };
const [stack, setStack] = useState<View[]>([{ kind: "team", ownerId: viewer.studentId }]);
```

- `push(view)` / `popTo(index)` helpers.
- Always render a **breadcrumb** at the top (segments + chevrons + leading back-chevron). Each segment clickable → `popTo`. Truncate names on narrow screens.

### TeamView (`{ kind: "team", ownerId }`)
- Resolve owner: viewer if `ownerId === viewer.studentId`, else `getPersonById(ownerId)`.
- Header: owner `fullName` / `jobTitle` / `site`.
- Hero zone: `Team | Individual` toggle pill above a 240px glow ring. Toggle state local to the view.
  - Team → ring uses `owner.teamStats.completionPct`, subtitle `team of {teamSize}`.
  - Individual → ring uses `owner.personalStats.completionPct`, subtitle `your training` (viewer) or `{firstName}'s training`.
  - Disable Individual if no `personalStats` (defensive).
  - Below the ring: two large numbers — `{completed} complete`, `{incomplete} incomplete`.
- Risk pills row (only when `ownerId === viewer.studentId`): three pills from `risks.{high|medium|low}Count`; tap → `push({kind:"risk-list", tier})`.
- Inferred-from-TNA collapsible callout (viewer-level only): title with confidence, ⓘ button toggles `confidenceNotes`, shows `tnaRequiredItemsUnion` and `tnaGapTotal`.
- Team list (viewer-level only): people sorted worst-first by `(teamStats ?? personalStats).completionPct`. Each card: mini-ring (~56px, glow), name, jobTitle, site, non-zero risk badges, `{teamSize} reports` if `hasTeam`. Tap → `push({kind:"team", ownerId})` if `hasTeam` else `push({kind:"person", studentId})`.

### PersonView (`{ kind: "person", studentId }`)
- Header: name, jobTitle, site, contractor pill.
- Same hero ring + Team/Individual toggle pattern; default Individual when person has no team, Team otherwise.
- TNA caveat banner (Individual only, when `tnaNameMatch !== "exact"`): amber banner with the two messages from the prompt.
- Items list (Individual only): chips `All | Incomplete | Completed`. Row: `itemId · itemName`, `itemType` pill, truncated `curriculumTitle`, status badge (`✓ complete` / `○ incomplete`). Tap row expands inline to show `curriculumTitle`, `assignmentType`, `completionDate`, and `daysRemaining`. **No** overdue/due-soon counters anywhere, **no** `daysRemaining` filter or top-level badge.
- Risks for this person: filter `risks.items[*]` where `affectedPeople.includes(fullName)`, grouped by tier, dark-theme styled.

### RiskListView (`{ kind: "risk-list", tier }`)
- Header: tier title + count.
- Category filter chips derived from distinct `category` values in this tier.
- Each card: tier-coloured left border (red/amber/green) on the dark card, `title`, `detail`, `Affects: a, b, c +N more` (truncate after 3), `Action: …`.

## Components updated/deleted

- Update `PersonCard.tsx` to V3 fields: mini-glow ring uses `(teamStats ?? personalStats).completionPct`; no more `assigned`/`overdue` text; risk badges only when non-zero; show `{teamSize} reports` when `hasTeam`. (Used by the new team list, exported from this file.)
- Update `StatTile.tsx` is no longer needed for V3 (no overdue/due-soon tiles) — delete.
- Keep `Shell.tsx`, `PasswordGate.tsx`, `Ring.tsx` (rewritten).

## Cleanup

- Delete: `src/routes/dashboard.tsx`, `src/routes/person.$studentId.tsx`, `src/routes/risks.$tier.tsx`, `src/components/StatTile.tsx`.
- Update `__root.tsx` head meta to "Team Training Insight" + dark-theme `<html class="dark">`.
- Single route `/` keeps a unique title/description.

## Out of scope

- No category split, no overdue/due-soon, no separate routes, no light-default, no backend, no editing, no deep-link URL state (drill-down lives in component state for V3).

## Open assumption

I'm treating "restore" literally — there is no `git history` access, so OnboardingWizard, glow ring, and breadcrumb drill-down are rebuilt from scratch per the prompt's specs, not recovered from previous versions of the code.