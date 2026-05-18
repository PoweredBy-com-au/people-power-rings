import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import PasswordGate from "@/components/PasswordGate";
import Shell from "@/components/Shell";
import {
  getRisksByTier,
  TIER_META,
  CATEGORY_ICON,
  type RiskTier,
} from "@/lib/training-data";
import { ChevronLeft } from "lucide-react";

const TIERS = new Set<RiskTier>(["high", "medium", "low"]);

function RisksPage() {
  const { tier } = Route.useParams();
  if (!TIERS.has(tier as RiskTier)) throw notFound();
  const t = tier as RiskTier;
  const meta = TIER_META[t];
  const all = getRisksByTier(t);
  const { category } = Route.useSearch();
  const navigate = useNavigate({ from: "/risks/$tier" });

  const categories = Array.from(new Set(all.map((r) => r.category)));
  const items = category ? all.filter((r) => r.category === category) : all;

  const setCat = (c?: string) =>
    navigate({
      params: { tier: t },
      search: { category: c } as never,
    });

  return (
    <PasswordGate>
      <Shell>
        <Link
          to="/"
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
        <header className="mt-3">
          <h1 className={`text-2xl font-semibold tracking-tight ${meta.text}`}>
            <span aria-hidden className="mr-2">{meta.icon}</span>
            {meta.label} findings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{meta.blurb}</p>
        </header>

        <div className="mt-4 flex gap-1 overflow-x-auto -mx-1 px-1 pb-1">
          <button
            onClick={() => setCat(undefined)}
            className={`shrink-0 rounded-full px-3 py-2 text-sm min-h-[36px] ${
              !category
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-white dark:bg-slate-900 border dark:border-slate-800"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full px-3 py-2 text-sm min-h-[36px] ${
                category === c
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-white dark:bg-slate-900 border dark:border-slate-800"
              }`}
            >
              <span aria-hidden className="mr-1">{CATEGORY_ICON[c] ?? "•"}</span>
              {c}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {items.map((r, i) => {
            const affects =
              r.affectedPeople.length <= 3
                ? r.affectedPeople.join(", ")
                : `${r.affectedPeople.slice(0, 3).join(", ")} +${r.affectedPeople.length - 3} more`;
            return (
              <div
                key={i}
                className={`rounded-2xl bg-white dark:bg-slate-900 shadow-sm p-4 border dark:border-slate-800`}
                style={{ borderLeftWidth: 4, borderLeftColor: meta.ring }}
              >
                <div className={`font-semibold ${meta.text}`}>
                  <span aria-hidden className="mr-1">
                    {CATEGORY_ICON[r.category] ?? meta.icon}
                  </span>
                  {r.title}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                  {r.detail}
                </p>
                {r.affectedPeople.length > 0 && (
                  <div className="text-sm mt-2">
                    <span className="text-slate-500">Affects:</span> {affects}
                  </div>
                )}
                {r.suggestedAction && (
                  <div className="text-sm mt-1">
                    <span className="text-slate-500">Action:</span> {r.suggestedAction}
                  </div>
                )}
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="text-sm text-slate-500 text-center py-6">
              No findings in this category.
            </div>
          )}
        </div>
      </Shell>
    </PasswordGate>
  );
}

export const Route = createFileRoute("/risks/$tier")({
  component: RisksPage,
  validateSearch: (s: Record<string, unknown>) => ({
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  notFoundComponent: () => (
    <Shell>
      <div className="py-10 text-center">
        <h1 className="text-xl font-semibold">Tier not found</h1>
        <Link to="/" className="text-sm underline mt-2 inline-block">
          Back
        </Link>
      </div>
    </Shell>
  ),
  head: () => ({
    meta: [
      { title: "Risk findings — Training Insight" },
      { name: "description", content: "Detailed risk findings for the manager's team." },
    ],
  }),
});
