import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import Ring from "./Ring";
import PersonCard from "./PersonCard";
import {
  data,
  effectiveStats,
  getPersonById,
  getRisksByTier,
  sortByCompletion,
  TIER_META,
  type Person,
  type PersonItem,
  type RiskTier,
  type Stats,
  type Viewer,
} from "@/lib/training-data";

type View =
  | { kind: "team"; ownerId: number }
  | { kind: "person"; studentId: number }
  | { kind: "risk-list"; tier: RiskTier };

type Owner = {
  studentId: number;
  fullName: string;
  jobTitle: string;
  site: string;
  hasTeam: boolean;
  teamSize: number;
  teamStats: Stats | null;
  personalStats: Stats;
  isContractor?: boolean;
  tnaNameMatch?: string;
  items?: PersonItem[];
  riskBadges?: { high: number; medium: number; low: number };
};

function ownerFromViewer(v: Viewer): Owner {
  return {
    studentId: v.studentId,
    fullName: v.fullName,
    jobTitle: v.jobTitle,
    site: v.site,
    hasTeam: v.hasTeam,
    teamSize: v.teamSize,
    teamStats: v.teamStats,
    personalStats: v.personalStats,
  };
}

function ownerFromPerson(p: Person): Owner {
  return {
    studentId: p.studentId,
    fullName: p.fullName,
    jobTitle: p.jobTitle,
    site: p.site,
    hasTeam: p.hasTeam,
    teamSize: p.teamSize,
    teamStats: p.teamStats,
    personalStats: p.personalStats,
    isContractor: p.isContractor,
    tnaNameMatch: p.tnaNameMatch,
    items: p.items,
    riskBadges: p.riskBadges,
  };
}

function resolveOwner(ownerId: number): Owner | null {
  if (ownerId === data.viewer.studentId) return ownerFromViewer(data.viewer);
  const p = getPersonById(ownerId);
  return p ? ownerFromPerson(p) : null;
}

function crumbLabel(v: View): string {
  if (v.kind === "team") {
    if (v.ownerId === data.viewer.studentId) return "Your team";
    const o = resolveOwner(v.ownerId);
    return o ? `${o.fullName.split(" ")[0]}'s team` : "Team";
  }
  if (v.kind === "person") {
    const p = getPersonById(v.studentId);
    return p ? p.fullName : "Person";
  }
  return `${TIER_META[v.tier].label} risks`;
}

export default function TrainingInsights() {
  const [stack, setStack] = useState<View[]>([
    { kind: "team", ownerId: data.viewer.studentId },
  ]);
  const current = stack[stack.length - 1];

  const push = (v: View) => setStack((s) => [...s, v]);
  const popTo = (i: number) => setStack((s) => s.slice(0, i + 1));
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-screen-sm px-4 py-5">
        <nav className="flex items-center gap-1 text-sm text-slate-400 mb-4 flex-wrap">
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

        {current.kind === "team" && (
          <TeamView ownerId={current.ownerId} push={push} />
        )}
        {current.kind === "person" && (
          <PersonView studentId={current.studentId} />
        )}
        {current.kind === "risk-list" && <RiskListView tier={current.tier} />}
      </div>
    </div>
  );
}

/* -------------------- TeamView -------------------- */

function TeamView({
  ownerId,
  push,
}: {
  ownerId: number;
  push: (v: View) => void;
}) {
  const owner = resolveOwner(ownerId);
  const isViewer = ownerId === data.viewer.studentId;
  const defaultMode: "team" | "individual" =
    owner?.hasTeam && owner.teamStats ? "team" : "individual";
  const [mode, setMode] = useState<"team" | "individual">(defaultMode);
  const [inferOpen, setInferOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  if (!owner) {
    return <div className="text-slate-400">Owner not found.</div>;
  }

  const canTeam = owner.hasTeam && owner.teamStats != null;
  const stats: Stats =
    mode === "team" && canTeam ? (owner.teamStats as Stats) : owner.personalStats;

  const firstName = owner.fullName.split(" ")[0];
  const sublabel =
    mode === "team"
      ? `team of ${owner.teamSize}`
      : isViewer
        ? "your training"
        : `${firstName}'s training`;

  const people = useMemo(() => sortByCompletion(data.people), []);

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
        <ToggleSegment
          value={mode}
          onChange={setMode}
          canTeam={canTeam}
        />
      </div>

      <div className="flex flex-col items-center py-5">
        <Ring
          pct={stats.completionPct}
          size={240}
          label={`${Math.round(stats.completionPct)}%`}
          sublabel={sublabel}
          ariaLabel={`${mode === "team" ? "Team" : "Individual"} ${Math.round(stats.completionPct)}% complete`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <BigStat value={stats.completed} label="complete" />
        <BigStat value={stats.incomplete} label="incomplete" />
      </div>

      {isViewer && (
        <div className="mt-5 flex gap-2">
          {(["high", "medium", "low"] as RiskTier[]).map((t) => {
            const meta = TIER_META[t];
            const count =
              t === "high"
                ? data.risks.highCount
                : t === "medium"
                  ? data.risks.mediumCount
                  : data.risks.lowCount;
            return (
              <button
                key={t}
                onClick={() => push({ kind: "risk-list", tier: t })}
                className={`flex-1 rounded-2xl border ${meta.border} ${meta.bg} px-3 py-3 min-h-[44px] text-sm ${meta.text}`}
              >
                <span aria-hidden className="mr-1">{meta.icon}</span>
                {count} {meta.label}
              </button>
            );
          })}
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
              <button
                onClick={() => setNotesOpen((v) => !v)}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
              >
                <Info className="h-3.5 w-3.5" /> {notesOpen ? "Hide" : "Why this confidence?"}
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
          </h2>
          <div className="space-y-2">
            {people.map((p) => (
              <PersonCard
                key={p.studentId}
                person={p}
                onClick={() =>
                  push(
                    p.hasTeam
                      ? { kind: "team", ownerId: p.studentId }
                      : { kind: "person", studentId: p.studentId },
                  )
                }
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* -------------------- PersonView -------------------- */

function PersonView({ studentId }: { studentId: number }) {
  const person = getPersonById(studentId);
  if (!person) return <div className="text-slate-400">Person not found.</div>;

  const canTeam = person.hasTeam && person.teamStats != null;
  const [mode, setMode] = useState<"team" | "individual">(
    canTeam ? "team" : "individual",
  );
  const [filter, setFilter] = useState<"all" | "incomplete" | "completed">("all");

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

  const personRisks: { tier: RiskTier; r: ReturnType<typeof getRisksByTier>[number] }[] = [];
  (["high", "medium", "low"] as RiskTier[]).forEach((tier) => {
    getRisksByTier(tier).forEach((r) => {
      if (r.affectedPeople.includes(person.fullName)) personRisks.push({ tier, r });
    });
  });

  const tnaBanner =
    mode === "individual" && person.tnaNameMatch !== "exact"
      ? person.tnaNameMatch === "none"
        ? "Not listed in any TNA. Showing actual assignments; can't infer what's required."
        : `Spelled slightly differently in TNA (${person.tnaNameMatch}). Numbers may be approximate.`
      : null;

  return (
    <>
      <header className="mb-2">
        <h1 className="text-xl font-semibold tracking-tight text-slate-100">
          {person.fullName}
          {person.isContractor && (
            <span className="ml-2 inline-block rounded-full bg-slate-800 text-slate-300 px-2 py-0.5 text-xs align-middle">
              Contractor
            </span>
          )}
        </h1>
        <div className="text-sm text-slate-400">
          {person.jobTitle} · {person.site}
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
          ariaLabel={`${mode === "team" ? "Team" : "Individual"} ${Math.round(stats.completionPct)}% complete`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <BigStat value={stats.completed} label="complete" />
        <BigStat value={stats.incomplete} label="incomplete" />
      </div>

      {tnaBanner && (
        <div className="mt-4 rounded-2xl border border-amber-800/60 bg-amber-950/40 text-amber-200 p-3 text-sm">
          <span className="font-medium">Match: {person.tnaNameMatch}.</span>{" "}
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

      {personRisks.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm uppercase tracking-wide text-slate-500 mb-2">
            Risk findings for this person
          </h2>
          <div className="space-y-2">
            {personRisks.map(({ tier, r }, i) => {
              const meta = TIER_META[tier];
              return (
                <div
                  key={i}
                  className={`rounded-2xl p-3 border border-slate-800 bg-slate-900`}
                  style={{ borderLeftWidth: 4, borderLeftColor: meta.ring }}
                >
                  <div className={`text-sm font-medium ${meta.text}`}>
                    <span aria-hidden className="mr-1">{meta.icon}</span>
                    {r.title}
                  </div>
                  <div className="text-sm text-slate-300 mt-1">{r.detail}</div>
                </div>
              );
            })}
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
            {it.completionDate ? new Date(it.completionDate).toLocaleDateString() : "—"}
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

/* -------------------- RiskListView -------------------- */

function RiskListView({ tier }: { tier: RiskTier }) {
  const items = getRisksByTier(tier);
  const meta = TIER_META[tier];
  const categories = useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => s.add(i.category));
    return Array.from(s);
  }, [items]);
  const [cat, setCat] = useState<string | null>(null);
  const filtered = cat ? items.filter((i) => i.category === cat) : items;

  return (
    <>
      <header className="mb-3">
        <h1 className={`text-xl font-semibold tracking-tight ${meta.text}`}>
          <span aria-hidden className="mr-2">{meta.icon}</span>
          {items.length} {meta.label} findings
        </h1>
        <p className="text-sm text-slate-400 mt-1">{meta.blurb}</p>
      </header>

      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          <button
            onClick={() => setCat(null)}
            className={`shrink-0 rounded-full px-3 py-2 text-sm min-h-[36px] ${
              cat === null
                ? "bg-slate-100 text-slate-900"
                : "bg-slate-900 text-slate-300 border border-slate-800"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full px-3 py-2 text-sm min-h-[36px] ${
                cat === c
                  ? "bg-slate-100 text-slate-900"
                  : "bg-slate-900 text-slate-300 border border-slate-800"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2 mt-3">
        {filtered.map((r, i) => {
          const affected = r.affectedPeople.slice(0, 3).join(", ");
          const more = r.affectedPeople.length - 3;
          return (
            <div
              key={i}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-4"
              style={{ borderLeftWidth: 4, borderLeftColor: meta.ring }}
            >
              <div className="text-xs uppercase tracking-wide text-slate-500">
                {r.category}
              </div>
              <div className="font-medium text-slate-100 mt-0.5">{r.title}</div>
              <div className="text-sm text-slate-300 mt-1">{r.detail}</div>
              {r.affectedPeople.length > 0 && (
                <div className="text-xs text-slate-400 mt-2">
                  Affects: {affected}
                  {more > 0 ? ` +${more} more` : ""}
                </div>
              )}
              {r.suggestedAction && (
                <div className="text-xs text-slate-300 mt-1">
                  <span className="text-slate-500">Action:</span> {r.suggestedAction}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
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
