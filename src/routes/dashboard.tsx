import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import PasswordGate from "@/components/PasswordGate";
import Shell from "@/components/Shell";
import Ring from "@/components/Ring";
import PersonCard from "@/components/PersonCard";
import StatTile from "@/components/StatTile";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, Info } from "lucide-react";
import {
  data,
  sortPeopleByCompletion,
  TIER_META,
  type RiskTier,
} from "@/lib/training-data";

type Filter = "all" | "overdue" | "dueSoon";

function DashboardPage() {
  const search = Route.useSearch();
  const filter: Filter = (search.filter ?? "all") as Filter;
  const navigate = useNavigate({ from: "/dashboard" });

  const [hardOpen, setHardOpen] = useState(true);
  const [inferOpen, setInferOpen] = useState(false);

  const sorted = sortPeopleByCompletion(data.people);
  const filtered =
    filter === "overdue"
      ? sorted.filter((p) => p.overdue > 0)
      : filter === "dueSoon"
        ? sorted.filter((p) => p.dueSoon > 0)
        : sorted;

  const setFilter = (f: Filter) => {
    navigate({
      search: { filter: f === "all" ? undefined : f } as never,
    });
  };

  const lowConfidence = data.inferredFacts.confidence === "low";

  return (
    <PasswordGate>
      <Shell>
        <header className="mb-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {data.viewer.jobCode} · {data.viewer.site}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{data.viewer.name}</h1>
        </header>

        <div className="flex flex-col items-center py-4">
          <Ring
            pct={data.hardFacts.completionPct}
            size={240}
            label={`${Math.round(data.hardFacts.completionPct)}%`}
            sublabel="complete"
            ariaLabel={`${Math.round(data.hardFacts.completionPct)}% complete, ${data.hardFacts.peopleCount} people`}
          />
        </div>

        {/* Stat tiles row */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <button onClick={() => setFilter(filter === "overdue" ? "all" : "overdue")}>
            <StatTile
              icon="🔴"
              value={data.hardFacts.overdueAssignments}
              label="overdue"
              active={filter === "overdue"}
            />
          </button>
          <button onClick={() => setFilter(filter === "dueSoon" ? "all" : "dueSoon")}>
            <StatTile
              icon="🟡"
              value={data.hardFacts.dueSoonAssignments}
              label="due ≤30d"
              active={filter === "dueSoon"}
            />
          </button>
          <StatTile
            icon="📋"
            value={data.hardFacts.distinctItemsAssigned}
            label="items required"
          />
        </div>

        {/* Hard facts */}
        <Collapsible open={hardOpen} onOpenChange={setHardOpen} className="mt-5">
          <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm p-4 border dark:border-slate-800">
            <CollapsibleTrigger className="flex w-full items-center justify-between">
              <div className="text-left">
                <div className="font-semibold">Hard facts</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  From SuccessFactors — confirmed.
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${hardOpen ? "rotate-180" : ""}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-1 text-sm">
              <div>
                <strong>{data.hardFacts.peopleCount}</strong> people
              </div>
              <div>
                <strong>{data.hardFacts.totalAssignments}</strong> total assignments
              </div>
              <div>
                <strong>{data.hardFacts.completedAssignments}</strong> completed
              </div>
              <div>
                <strong>{data.hardFacts.incompleteAssignments}</strong> incomplete
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Inferred */}
        <Collapsible open={inferOpen} onOpenChange={setInferOpen} className="mt-3">
          <div
            className={`rounded-2xl bg-white dark:bg-slate-900 shadow-sm p-4 border ${
              lowConfidence
                ? "border-amber-300 dark:border-amber-700"
                : "dark:border-slate-800"
            }`}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between">
              <div className="text-left flex items-center gap-2">
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    Inferred from TNA
                    <Popover>
                      <PopoverTrigger asChild>
                        <span
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center text-slate-400 hover:text-slate-600"
                          role="button"
                          aria-label="Confidence notes"
                        >
                          <Info className="h-4 w-4" />
                        </span>
                      </PopoverTrigger>
                      <PopoverContent
                        className="text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ul className="space-y-1">
                          {data.inferredFacts.confidenceNotes.map((n, i) => (
                            <li key={i}>• {n}</li>
                          ))}
                        </ul>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    From the TNA — confidence: {data.inferredFacts.confidence}
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${inferOpen ? "rotate-180" : ""}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent
              className={`mt-3 space-y-1 text-sm ${
                lowConfidence ? "text-slate-500 dark:text-slate-500" : ""
              }`}
            >
              <div>
                <strong>{data.inferredFacts.tnaRequiredItemsUnion}</strong> items the TNA
                suggests your team should have
              </div>
              <div>
                <strong>{data.inferredFacts.tnaGapTotal}</strong> inferred gaps
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Risk pills */}
        <div className="mt-4 flex gap-2">
          {(["high", "medium", "low"] as RiskTier[]).map((t) => {
            const meta = TIER_META[t];
            const count =
              t === "high"
                ? data.risks.highCount
                : t === "medium"
                  ? data.risks.mediumCount
                  : data.risks.lowCount;
            return (
              <Link
                key={t}
                to="/risks/$tier"
                params={{ tier: t }}
                className={`flex-1 text-center rounded-full px-3 py-2 text-sm font-medium ${meta.bg} ${meta.text} border ${meta.border}`}
              >
                <span aria-hidden className="mr-1">{meta.icon}</span>
                {count}
              </Link>
            );
          })}
        </div>

        {/* Team list */}
        <div className="mt-5">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="font-semibold">Team</h2>
            {filter !== "all" && (
              <button
                onClick={() => setFilter("all")}
                className="text-xs text-slate-500 underline"
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="space-y-3">
            {filtered.map((p) => (
              <PersonCard key={p.studentId} person={p} />
            ))}
            {filtered.length === 0 && (
              <div className="text-sm text-slate-500 text-center py-6">
                No one matches this filter.
              </div>
            )}
          </div>
        </div>
      </Shell>
    </PasswordGate>
  );
}

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  validateSearch: (s: Record<string, unknown>) => ({
    filter:
      s.filter === "overdue" || s.filter === "dueSoon"
        ? (s.filter as "overdue" | "dueSoon")
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Team dashboard — Training Insight" },
      {
        name: "description",
        content: "Team completion ring, hard facts, inferred TNA gaps, and direct reports.",
      },
    ],
  }),
});
