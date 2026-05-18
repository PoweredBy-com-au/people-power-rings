import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import PasswordGate from "@/components/PasswordGate";
import Shell from "@/components/Shell";
import Ring from "@/components/Ring";
import {
  getPersonById,
  data,
  TIER_META,
  type PersonItem,
  type RiskTier,
} from "@/lib/training-data";
import { ChevronLeft } from "lucide-react";

type Tab = "all" | "overdue" | "dueSoon" | "incomplete" | "completed";

function statusIcon(s: PersonItem["status"]) {
  switch (s) {
    case "overdue":
    case "due-soon":
      return "⚠️";
    case "completed-current":
      return "✓";
    case "completed-expired":
      return "🟡";
    default:
      return "•";
  }
}

function statusText(it: PersonItem) {
  if (it.status === "overdue") return `Overdue (${it.daysRemaining ?? 0} days)`;
  if (it.status === "due-soon") return `Due in ${it.daysRemaining ?? 0} days`;
  if (it.status === "completed-current") return "Completed";
  if (it.status === "completed-expired") return "Completed — expired";
  return "Not completed";
}

function ItemRow({ it }: { it: PersonItem }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((v) => !v)}
      className="w-full text-left rounded-2xl bg-white dark:bg-slate-900 shadow-sm p-4 border dark:border-slate-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {it.itemId}
          </div>
          <div className="font-medium">{it.itemName}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {it.itemType} · {it.curriculumTitle}
          </div>
          <div className="text-sm mt-1">{statusText(it)}</div>
        </div>
        <div aria-hidden className="text-lg">{statusIcon(it.status)}</div>
      </div>
      {open && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-sm space-y-1">
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
        </div>
      )}
    </button>
  );
}

function PersonPage() {
  const { studentId } = Route.useParams();
  const person = getPersonById(studentId);
  if (!person) throw notFound();

  const [tab, setTab] = useState<Tab>("all");

  const items = person.items.filter((it) => {
    if (tab === "all") return true;
    if (tab === "overdue") return it.status === "overdue";
    if (tab === "dueSoon") return it.status === "due-soon";
    if (tab === "incomplete") return !it.completed;
    if (tab === "completed") return it.completed;
    return true;
  });

  const personRisks: { tier: RiskTier; title: string; detail: string }[] = [];
  (["high", "medium", "low"] as RiskTier[]).forEach((tier) => {
    data.risks.items[tier].forEach((r) => {
      if (r.affectedPeople.includes(person.fullName)) {
        personRisks.push({ tier, title: r.title, detail: r.detail });
      }
    });
  });

  const tnaBanner =
    person.tnaNameMatch === "none"
      ? "This person isn't listed in any TNA. We can show their SF assignments, but we can't infer what they should have."
      : person.tnaNameMatch.startsWith("fuzzy")
        ? "Their TNA name matches with a small spelling difference. Numbers are likely correct but worth confirming."
        : null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "overdue", label: "Overdue" },
    { id: "dueSoon", label: "Due soon" },
    { id: "incomplete", label: "Incomplete" },
    { id: "completed", label: "Completed" },
  ];

  return (
    <PasswordGate>
      <Shell>
        <Link
          to="/dashboard"
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <ChevronLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <header className="mt-3">
          <h1 className="text-2xl font-semibold tracking-tight">{person.fullName}</h1>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {person.jobTitle} · {person.site}
            {person.isContractor && (
              <span className="ml-2 inline-block rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-xs">
                Contractor
              </span>
            )}
          </div>
        </header>

        <div className="flex flex-col items-center py-5">
          <Ring
            pct={person.completionPct}
            size={200}
            label={`${Math.round(person.completionPct)}%`}
            sublabel="complete"
          />
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { v: person.assigned, l: "assigned" },
            { v: person.completed, l: "completed" },
            { v: person.overdue, l: "overdue" },
            { v: person.dueSoon, l: "due soon" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-2xl bg-white dark:bg-slate-900 p-3 border dark:border-slate-800"
            >
              <div className="text-lg font-semibold">{s.v}</div>
              <div className="text-xs text-slate-500">{s.l}</div>
            </div>
          ))}
        </div>

        {tnaBanner && (
          <div className="mt-4 rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 p-3 text-sm">
            {tnaBanner}
          </div>
        )}

        <div className="mt-5">
          <div className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-full px-3 py-2 text-sm min-h-[36px] ${
                  tab === t.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border dark:border-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            {items.map((it, i) => (
              <ItemRow key={i} it={it} />
            ))}
            {items.length === 0 && (
              <div className="text-sm text-slate-500 text-center py-6">
                No items in this view.
              </div>
            )}
          </div>
        </div>

        {personRisks.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold mb-2">Risk findings for this person</h2>
            <div className="space-y-2">
              {personRisks.map((r, i) => {
                const meta = TIER_META[r.tier];
                return (
                  <div
                    key={i}
                    className={`rounded-2xl p-3 border ${meta.bg} ${meta.border}`}
                    style={{ borderLeftWidth: 4, borderLeftColor: meta.ring }}
                  >
                    <div className={`text-sm font-medium ${meta.text}`}>
                      <span aria-hidden className="mr-1">{meta.icon}</span>
                      {r.title}
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                      {r.detail}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Shell>
    </PasswordGate>
  );
}

export const Route = createFileRoute("/person/$studentId")({
  component: PersonPage,
  notFoundComponent: () => (
    <Shell>
      <div className="py-10 text-center">
        <h1 className="text-xl font-semibold">Person not found</h1>
        <Link to="/dashboard" className="text-sm underline mt-2 inline-block">
          Back to dashboard
        </Link>
      </div>
    </Shell>
  ),
  head: () => ({
    meta: [
      { title: "Person detail — Training Insight" },
      { name: "description", content: "Per-person training assignments and risk findings." },
    ],
  }),
});
