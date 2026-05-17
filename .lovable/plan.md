# Hierarchical Rings with Team / Individual Toggle

## Concept

The logged-in person is **Mickey Mouse, CEO**. The rings view always represents one node in the org tree (call it the *focus node*). Each node has:

- A **manager** (the person who owns the node — e.g. CEO owns the company, a VP owns a division, a manager owns a team).
- **Direct reports** (the sub-nodes or people one level down).

A **Team / Individual toggle** lives next to the hero ring at every level:

- **Team view** — hero ring = aggregate of everyone under this node. Clicking the hero ring drills down: the small rings below become the direct reports of this node.
- **Individual view** — hero ring = the *manager* of this node's own training rings. Small rings below show that manager's own module breakdown (the existing per-person card).

Clicking a small ring in Team view promotes that child to become the new focus node (it becomes the hero), and its own children become the new small rings. Breadcrumbs let the user navigate back up. The toggle resets to **Team** on each new focus node but can be flipped at any level.

## Example walkthrough (Mickey, CEO)

1. Land on `/` → focus = Acme Corporation. Toggle = Team. Hero ring = whole-company aggregate. Small rings = Engineering, Operations, Commercial.
2. Mickey flips toggle to Individual → hero ring becomes Mickey's own training; cards below show his module breakdown.
3. Mickey flips back to Team, clicks Engineering small ring → focus = Engineering. Hero = Engineering aggregate. Small rings = Platform, Product Engineering. Breadcrumb shows `Acme / Engineering`.
4. Flip to Individual at this level → hero becomes the **Engineering manager's** own rings.
5. Continue drilling: Platform → Infrastructure team → individual engineer (leaf), which lands on the existing person-level module breakdown screen.

## Data changes (`src/lib/training-data.ts`)

- Add a `manager?: OrgNode` (or `managerId`) to non-leaf nodes — a synthetic person who owns that node. Generate one per division/department/team and one CEO (Mickey Mouse) at the company root, with their own `training` payload.
- Export `CURRENT_USER_ID = "ceo-mickey"` so the app knows who is logged in (used for a small "Signed in as Mickey Mouse" chip; doesn't gate navigation in the demo).
- Helper: `getManager(node) → OrgNode` returning the manager person for a focus node.

## UI changes (`src/components/TrainingInsights.tsx`)

- Add `view: "team" | "individual"` state alongside `currentId`. Reset to `"team"` whenever `currentId` changes.
- Header area: add a segmented Team / Individual toggle (reuse shadcn `ToggleGroup`) next to the breadcrumb. Disable Individual when the focus node has no manager (shouldn't happen in demo data).
- Hero ring:
  - Team → existing `StackedRings` driven by `aggregate(current)`.
  - Individual → `StackedRings` driven by `getManager(current).training` and label "<Manager name> · personal".
  - Clicking the hero ring in Team view scrolls / focuses the children grid (no-op if already drilled); in Individual view it does nothing.
- Below the rings:
  - Team → existing direct-report cards (`MiniRings` grid). Clicking a non-person child promotes it via `setCurrentId`.
  - Individual → render the existing per-person module breakdown block for the manager.
- Breadcrumb keeps current behaviour. Add a subtle "Signed in as Mickey Mouse" chip top-right.

## Routes & files

- No new routes. All changes are in `src/components/TrainingInsights.tsx` and `src/lib/training-data.ts`.
- No backend / cloud changes.

## Out of scope

- Real authentication or persona switching (Mickey is hard-coded as the demo user).
- Editing training data.
- Mobile-specific redesign (existing responsive grid is kept).
