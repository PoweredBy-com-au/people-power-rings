## 1. Individual toggle shows only the individual

In `TeamView` (`src/components/TrainingInsights.tsx`):

- When `mode === "individual"`, hide everything team-related: the composition pill, the "Inferred from the TNA" callout, and the "Team — worst first" list. Currently these are gated only on `canTeam`, so they keep rendering for leaders even when the user has switched to their personal view.
- Make the individual items list work for the viewer (Avery). Today `ownerPerson` is `getPersonById(ownerId)`, but the viewer is not in `data.people`, so for Avery `ownerPerson` is `undefined` and nothing renders. Fix: resolve items by searching `data.people` for a record whose `studentId` matches the viewer's id; if none exists, also accept a match on full name as a fallback. Apply the same `all / incomplete / completed` filter UI that team members already get.

Conversely, when `mode === "team"`, keep showing the team blocks (already correct) and do not render the items list.

## 2. Back pill under the hero ring

Below the `Ring` + `BigStat` grid, render a centered white "Back" pill when `stack.length > 1`:

- White background, dark text, rounded-full, comfortable tap target (min-h 36px), a left chevron icon.
- Clicking it calls the existing `back()` from the parent. Plumb a new `onBack?: () => void` prop into `TeamView` (and pass it from `TrainingInsights`).
- Hidden at the root level (viewer's own team) so there is nothing to go back to.
- Repeated clicks walk up the breadcrumb stack one level at a time, matching the existing breadcrumb chevron behaviour.

## 3. Ring colors — RAG thresholds

In `src/components/Ring.tsx`, replace the single 50% cutoff with three bands based on the incomplete share (`100 - pct`):

- Incomplete < 10%  → Green  `#16A34A`
- 10% ≤ incomplete ≤ 20% → Amber  `#F59E0B`
- Incomplete > 20% → Red  `#DC2626`

Both the filled stroke and the soft glow use this color. No other Ring behaviour changes (size, animation, label).

## Out of scope

No data, routing, filter, or onboarding changes. No edits to `PersonCard`, `PasswordGate`, or `OnboardingWizard`.

## Verification

1. Open Avery (root). Toggle to Individual → only her items list + filter pills render, no team list / pill / TNA card. Toggle back to Team → team blocks reappear, items list hides.
2. Drill into a sub-leader (e.g. Cameron). Same toggle behaviour. Back pill appears under the ring; clicking it returns to Avery's team. Repeat from a 3rd-level leader to confirm it walks up step by step.
3. A team with 95% completion shows a green ring; 85% shows amber; 70% shows red. Check at viewer level and after drilling in.
4. No console errors after reload.
