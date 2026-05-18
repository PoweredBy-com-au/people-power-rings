import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Info, SlidersHorizontal, X } from "lucide-react";
import Ring from "./Ring";
import PersonCard from "./PersonCard";
import {
  data,
  effectiveStats,
  getPersonById,
  type Person,
  type PersonItem,
  type Stats,
  type Viewer,
} from "@/lib/training-data";

type View =
  | { kind: "team"; ownerId: string }
  | { kind: "person"; studentId: string };

type Filters = {
  site: string; // "all" or site name
  org: string; // "all" or org name
  type: "all" | "Employee" | "Contractor";
};

const DEFAULT_FILTERS: Filters = { site: "all", org: "all", type: "all" };

function activeFilterCount(f: Filters): number {
  let n = 0;
  if (f.site !== "all") n++;
  if (f.org !== "all") n++;
  if (f.type !== "all") n++;
  return n;
}

function applyFilters(people: Person[], f: Filters): Person[] {
  return people.filter((p) => {
    if (f.site !== "all" && p.site !== f.site) return false;
    if (f.org !== "all" && p.organisation !== f.org) return false;
    if (f.type !== "all" && p.personType !== f.type) return false;
    return true;
  });
}

function aggregateStats(people: Person[]): Stats {
  const s = people.reduce(
    (acc, p) => {
      acc.assigned += p.personalStats.assigned;
      acc.completed += p.personalStats.completed;
      acc.incomplete += p.personalStats.incomplete;
      return acc;
    },
    { assigned: 0, completed: 0, incomplete: 0, completionPct: 0 },
  );
  s.completionPct = s.assigned > 0 ? (s.completed / s.assigned) * 100 : 0;
  return s;
}

type Owner = {
  studentId: string;
  fullName: string;
  jobTitle: string;
  site: string;
  hasTeam: boolean;
  teamSize: number;
  teamStats: Stats | null;
  personalStats: Stats;
  personType?: "Employee" | "Contractor";
  contractorCompany?: string | null;
  tnaNameMatch?: string;
  items?: PersonItem[];
};

function ownerFromViewer(v: Viewer): Owner {
  return {
    studentId: String(v.studentId),
    fullName: v.fullName,
    jobTitle: v.jobTitle,
    site: v.site,
    hasTeam: v.hasTeam,
    teamSize: v.teamSize,
    teamStats: v.teamStats,
    personalStats: v.personalStats,
    personType: v.personType,
  };
}

function ownerFromPerson(p: Person): Owner {
  return {
    studentId: String(p.studentId),
    fullName: p.fullName,
    jobTitle: p.jobTitle,
    site: p.site,
    hasTeam: p.hasTeam,
    teamSize: p.teamSize,
    teamStats: p.teamStats,
    personalStats: p.personalStats,
    personType: p.personType,
    contractorCompany: p.contractorCompany,
    tnaNameMatch: p.tnaNameMatch,
    items: p.items,
  };
}

function resolveOwner(ownerId: string): Owner | null {
  if (ownerId === String(data.viewer.studentId)) return ownerFromViewer(data.viewer);
  const p = getPersonById(ownerId);
  return p ? ownerFromPerson(p) : null;
}

function crumbLabel(v: View): string {
  if (v.kind === "team") {
    if (v.ownerId === String(data.viewer.studentId)) return "Your team";
    const o = resolveOwner(v.ownerId);
    return o ? `${o.fullName.split(" ")[0]}'s team` : "Team";
  }
  const p = getPersonById(v.studentId);
  return p ? p.fullName : "Person";
}

export default function TrainingInsights() {
  const [stack, setStack] = useState<View[]>([
    { kind: "team", ownerId: String(data.viewer.studentId) },
  ]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

  const current = stack[stack.length - 1];
  const push = (v: View) => setStack((s) => [...s, v]);
  const popTo = (i: number) => setStack((s) => s.slice(0, i + 1));
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));

  const filterCount = activeFilterCount(filters);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-screen-sm px-4 py-5">
        <div className="flex items-center justify-between mb-4 gap-2">
          <nav className="flex items-center gap-1 text-sm text-slate-400 flex-wrap min-w-0">
            {stack.length > 1 && (
              <button
                onClick={back}
                className="-ml-1 mr-1 p-1 rounded hover:bg-slate-900"
                aria-label="Back"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {stack.map((v, i) => {
              const isLast = i === stack.length - 1;
              return (
                <span key={i} className="flex items-center gap-1 min-w-0">
                  {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
                  {isLast ? (
                    <span className="text-slate-200 truncate max-w-[140px]">
                      {crumbLabel(v)}
                    </span>
                  ) : (
                    <button
                      onClick={() => popTo(i)}
                      className="hover:text-slate-200 truncate max-w-[140px]"
                    >
                      {crumbLabel(v)}
                    </button>
                  )}
                </span>
              );
            })}
          </nav>
          <button
            onClick={() => setFilterOpen(true)}
            aria-label={`Filters${filterCount ? `, ${filterCount} active` : ""}`}
            className="relative shrink-0 rounded-full border border-slate-800 bg-slate-900 p-2 min-h-[40px] min-w-[40px] inline-flex items-center justify-center"
          >
            <SlidersHorizontal className="h-4 w-4 text-slate-300" />
            {filterCount > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] font-medium bg-cyan-500 text-slate-950 rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {filterCount}
              </span>
            )}
          </button>
        </div>

        {current.kind === "team" && (
          <TeamView ownerId={current.ownerId} push={push} filters={filters} />
        )}
        {current.kind === "person" && <PersonView studentId={current.studentId} />}
      </div>

      {filterOpen && (
        <FilterSheet
          filters={filters}
          onClose={() => setFilterOpen(false)}
          onApply={(f) => {
            setFilters(f);
            setFilterOpen(false);
          }}
          onClear={() => {
            setFilters(DEFAULT_FILTERS);
            setFilterOpen(false);
          }}
        />
      )}
    </div>
  );
}

/* -------------------- TeamView -------------------- */

function TeamView({
  ownerId,
  push,
  filters,
}: {
  ownerId: string;
  push: (v: View) => void;
  filters: Filters;
}) {
  const owner = resolveOwner(ownerId);
  const isViewer = ownerId === String(data.viewer.studentId);
  const defaultMode: "team" | "individual" =
    owner?.hasTeam && owner.teamStats ? "team" : "individual";
  const [mode, setMode] = useState<"team" | "individual">(defaultMode);
  const [inferOpen, setInferOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const hasFilters = activeFilterCount(filters) > 0;
  const filteredPeople = useMemo(
    () => (isViewer ? applyFilters(data.people, filters) : data.people),
    [isViewer, filters],
  );
  const sortedPeople = useMemo(
    () =>
      [...filteredPeople].sort(
        (a, b) => effectiveStats(a).completionPct - effectiveStats(b).completionPct,
      ),
    [filteredPeople],
  );

  if (!owner) return <div className="text-slate-400">Owner not found.</div>;

  const canTeam = owner.hasTeam && owner.teamStats != null;

  // Team stats: when filters active on viewer team, recompute from filtered people
  const teamStats: Stats | null =
    isViewer && hasFilters
      ? aggregateStats(filteredPeople)
      : owner.teamStats;

  const stats: Stats =
    mode === "team" && teamStats ? teamStats : owner.personalStats;

  const firstName = owner.fullName.split(" ")[0];
  const sublabel =
    mode === "team"
      ? hasFilters && isViewer
        ? `team of ${filteredPeople.length}`
        : `team of ${owner.teamSize}`
      : isViewer
        ? "your training"
        : `${firstName}'s training`;

  return (
    <>
      <header className="mb-2">
        <h1 className="text-xl font-semibold tracking-tight text-slate-100">
          {owner.fullName}
        </h1>
        <div className="text-sm text-slate-400">
          {owner.jobTitle} · {owner.site}
        </div>
      </header>

      <div className="flex justify-center mt-4">
        <ToggleSegment value={mode} onChange={setMode} canTeam={canTeam} />
      </div>

      <div className="flex flex-col items-center py-5">
        <Ring
          pct={stats.completionPct}
          size={240}
          label={`${Math.round(stats.completionPct)}%`}
          sublabel={sublabel}
          ariaLabel={`${mode === "team" ? "Team view" : "Individual view"}, ${Math.round(
            stats.completionPct,
          )}% complete, ${mode === "team" ? `${filteredPeople.length} people` : owner.fullName}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <BigStat value={stats.completed} label="complete" />
        <BigStat value={stats.incomplete} label="incomplete" />
      </div>

      {isViewer && mode === "team" && data.viewer.teamComposition && (
        <div className="mt-3 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-xs text-slate-400">
            {data.viewer.teamComposition.employees} Employees ·{" "}
            {data.viewer.teamComposition.contractors} Contractors
          </span>
        </div>
      )}

      {isViewer && (
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900">
          <button
            onClick={() => setInferOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left min-h-[44px]"
          >
            <span className="text-sm text-slate-200">
              Inferred from the TNA — confidence:{" "}
              <span className="font-medium">{data.inferredFacts.confidence}</span>
            </span>
            <ChevronRight
              className={`h-4 w-4 text-slate-500 transition-transform ${inferOpen ? "rotate-90" : ""}`}
            />
          </button>
          {inferOpen && (
            <div className="px-4 pb-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                  <div className="text-lg font-semibold text-slate-100">
                    {data.inferredFacts.tnaRequiredItemsUnion}
                  </div>
                  <div className="text-xs text-slate-400">TNA suggests required</div>
                </div>
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                  <div className="text-lg font-semibold text-slate-100">
                    {data.inferredFacts.tnaGapTotal}
                  </div>
                  <div className="text-xs text-slate-400">total inferred gap</div>
                </div>
              </div>
              {filters.type === "Contractor" && (
                <div className="rounded-xl border border-amber-800/60 bg-amber-950/40 text-amber-200 p-3 text-xs">
                  Contractors are mostly outside the TNA framework — these numbers
                  reflect what little can be inferred.
                </div>
              )}
              <button
                onClick={() => setNotesOpen((v) => !v)}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
              >
                <Info className="h-3.5 w-3.5" />{" "}
                {notesOpen ? "Hide" : "Why this confidence?"}
              </button>
              {notesOpen && (
                <ul className="space-y-1 text-xs text-slate-400">
                  {data.inferredFacts.confidenceNotes.map((n, i) => (
                    <li key={i}>• {n}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {isViewer && (
        <div className="mt-6">
          <h2 className="text-sm uppercase tracking-wide text-slate-500 mb-2">
            Team — worst first
            {hasFilters && (
              <span className="ml-2 normal-case text-slate-400">
                ({filteredPeople.length} of {data.people.length})
              </span>
            )}
          </h2>
          <div className="space-y-2">
            {sortedPeople.map((p) => (
              <PersonCard
                key={String(p.studentId)}
                person={p}
                onClick={() =>
                  push(
                    p.hasTeam
                      ? { kind: "team", ownerId: String(p.studentId) }
                      : { kind: "person", studentId: String(p.studentId) },
                  )
                }
              />
            ))}
            {sortedPeople.length === 0 && (
              <div className="text-sm text-slate-500 text-center py-6">
                No one matches these filters.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* -------------------- PersonView -------------------- */

function PersonView({ studentId }: { studentId: string }) {
  const person = getPersonById(studentId);
  const canTeam = !!(person && person.hasTeam && person.teamStats != null);
  const [mode, setMode] = useState<"team" | "individual">(
    canTeam ? "team" : "individual",
  );
  const [filter, setFilter] = useState<"all" | "incomplete" | "completed">("all");

  if (!person) return <div className="text-slate-400">Person not found.</div>;

  const stats: Stats =
    mode === "team" && canTeam ? (person.teamStats as Stats) : person.personalStats;
  const firstName = person.fullName.split(" ")[0];
  const sublabel =
    mode === "team" ? `team of ${person.teamSize}` : `${firstName}'s training`;

  const items = person.items.filter((it) => {
    if (filter === "all") return true;
    if (filter === "incomplete") return it.status === "incomplete";
    return it.status === "completed";
  });

  const isContractor = person.personType === "Contractor";
  const tnaBanner =
    mode === "individual" && person.tnaNameMatch !== "exact"
      ? person.tnaNameMatch === "none"
        ? "This person isn't listed on any TNA. Showing actual assignments; no inferred requirements."
        : `Spelled slightly differently in the TNA (${person.tnaNameMatch}). Numbers may be approximate.`
      : null;

  return (
    <>
      <header className="mb-2">
        <h1 className="text-xl font-semibold tracking-tight text-slate-100 flex items-center flex-wrap gap-2">
          <span>{person.fullName}</span>
          <span
            className={`text-[10px] uppercase tracking-wide rounded-full px-1.5 py-0.5 bg-slate-800 ${
              isContractor ? "text-slate-400" : "text-slate-300"
            }`}
          >
            {isContractor ? "Contractor" : "Employee"}
          </span>
        </h1>
        <div className="text-sm text-slate-400">
          {person.jobTitle || (isContractor ? "Contractor" : "—")} · {person.site}
        </div>
        {isContractor && person.contractorCompany && (
          <div className="text-xs text-slate-500 mt-0.5">
            {person.contractorCompany}
            {person.contractorType ? ` · ${person.contractorType}` : ""}
          </div>
        )}
      </header>

      <div className="flex justify-center mt-4">
        <ToggleSegment value={mode} onChange={setMode} canTeam={canTeam} />
      </div>

      <div className="flex flex-col items-center py-5">
        <Ring
          pct={stats.completionPct}
          size={240}
          label={`${Math.round(stats.completionPct)}%`}
          sublabel={sublabel}
          ariaLabel={`${mode === "team" ? "Team" : "Individual"} ${Math.round(
            stats.completionPct,
          )}% complete`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <BigStat value={stats.completed} label="complete" />
        <BigStat value={stats.incomplete} label="incomplete" />
      </div>

      {tnaBanner && (
        <div className="mt-4 rounded-2xl border border-amber-800/60 bg-amber-950/40 text-amber-200 p-3 text-sm">
          {tnaBanner}
        </div>
      )}

      {mode === "individual" && (
        <div className="mt-5">
          <div className="flex gap-2">
            {(["all", "incomplete", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 rounded-full px-3 py-2 text-sm min-h-[36px] capitalize ${
                  filter === f
                    ? "bg-slate-100 text-slate-900"
                    : "bg-slate-900 text-slate-300 border border-slate-800"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {items.map((it, i) => (
              <ItemRow key={i} it={it} />
            ))}
            {items.length === 0 && (
              <div className="text-sm text-slate-500 text-center py-6">
                Nothing here.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ItemRow({ it }: { it: PersonItem }) {
  const [open, setOpen] = useState(false);
  const badge =
    it.status === "completed" ? (
      <span className="text-cyan-300 text-sm">✓ complete</span>
    ) : (
      <span className="text-slate-400 text-sm">○ incomplete</span>
    );
  return (
    <button
      onClick={() => setOpen((v) => !v)}
      className="w-full text-left rounded-2xl bg-slate-900 border border-slate-800 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-xs text-slate-500">{it.itemId}</div>
          <div className="font-medium text-slate-100">{it.itemName}</div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-slate-800 px-2 py-0.5">{it.itemType}</span>
            <span className="truncate">{it.curriculumTitle}</span>
          </div>
        </div>
        <div className="shrink-0">{badge}</div>
      </div>
      {open && (
        <div className="mt-3 pt-3 border-t border-slate-800 text-sm space-y-1 text-slate-300">
          <div>
            <span className="text-slate-500">Curriculum:</span> {it.curriculumTitle} (
            {it.curriculumId})
          </div>
          <div>
            <span className="text-slate-500">Assignment Type:</span> {it.assignmentType}
          </div>
          <div>
            <span className="text-slate-500">Completion:</span>{" "}
            {it.completionDate
              ? new Date(it.completionDate).toLocaleDateString()
              : "—"}
          </div>
          {it.daysRemaining != null && (
            <div>
              <span className="text-slate-500">Days remaining:</span> {it.daysRemaining}
            </div>
          )}
        </div>
      )}
    </button>
  );
}

/* -------------------- FilterSheet -------------------- */

function FilterSheet({
  filters,
  onClose,
  onApply,
  onClear,
}: {
  filters: Filters;
  onClose: () => void;
  onApply: (f: Filters) => void;
  onClear: () => void;
}) {
  const [draft, setDraft] = useState<Filters>(filters);
  const sites = useMemo(() => {
    const s = new Set<string>();
    data.people.forEach((p) => p.site && s.add(p.site));
    return Array.from(s).sort();
  }, []);
  const orgs = useMemo(() => {
    const s = new Set<string>();
    data.people.forEach((p) => p.organisation && s.add(p.organisation));
    return Array.from(s).sort();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-screen-sm bg-slate-950 border-t border-slate-800 rounded-t-3xl p-5 pb-8 animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100">Filters</h2>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="p-2 rounded-full hover:bg-slate-900 min-h-[40px] min-w-[40px] inline-flex items-center justify-center"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-500 mb-2">
              Site
            </label>
            <select
              value={draft.site}
              onChange={(e) => setDraft({ ...draft, site: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-slate-100 min-h-[44px]"
            >
              <option value="all">All sites</option>
              {sites.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-500 mb-2">
              Organisation
            </label>
            <select
              value={draft.org}
              onChange={(e) => setDraft({ ...draft, org: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-slate-100 min-h-[44px]"
            >
              <option value="all">All organisations</option>
              {orgs.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-500 mb-2">
              Type
            </label>
            <div className="inline-flex rounded-full bg-slate-900 border border-slate-800 p-1 w-full">
              {(["all", "Employee", "Contractor"] as const).map((t) => {
                const active = draft.type === t;
                return (
                  <button
                    key={t}
                    onClick={() => setDraft({ ...draft, type: t })}
                    className={`flex-1 px-3 py-2 text-sm rounded-full min-h-[36px] transition-colors ${
                      active
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-300"
                    }`}
                  >
                    {t === "all" ? "All" : t === "Employee" ? "Employees" : "Contractors"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onClear}
            className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 text-slate-200 font-medium py-3 min-h-[44px]"
          >
            Clear all
          </button>
          <button
            onClick={() => onApply(draft)}
            className="flex-1 rounded-2xl bg-cyan-500 text-slate-950 font-medium py-3 min-h-[44px]"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------- shared bits -------------------- */

function BigStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
      <div className="text-3xl font-semibold text-slate-100">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function ToggleSegment({
  value,
  onChange,
  canTeam,
}: {
  value: "team" | "individual";
  onChange: (v: "team" | "individual") => void;
  canTeam: boolean;
}) {
  const opts: { v: "team" | "individual"; label: string; disabled?: boolean }[] = [
    { v: "team", label: "Team", disabled: !canTeam },
    { v: "individual", label: "Individual" },
  ];
  return (
    <div
      role="tablist"
      className="inline-flex rounded-full bg-slate-900 border border-slate-800 p-1"
    >
      {opts.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            role="tab"
            aria-pressed={active}
            disabled={o.disabled}
            onClick={() => !o.disabled && onChange(o.v)}
            className={`px-4 py-1.5 text-sm rounded-full min-h-[36px] transition-colors ${
              active
                ? "bg-slate-100 text-slate-900"
                : o.disabled
                  ? "text-slate-600"
                  : "text-slate-300"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
