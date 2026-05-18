import { Link } from "@tanstack/react-router";
import Ring from "./Ring";
import type { Person } from "@/lib/training-data";

export default function PersonCard({ person }: { person: Person }) {
  const { high, medium, low } = person.riskBadges;
  return (
    <Link
      to="/person/$studentId"
      params={{ studentId: String(person.studentId) }}
      className="block rounded-2xl bg-white dark:bg-slate-900 shadow-sm p-4 border border-transparent dark:border-slate-800 active:scale-[0.99] transition-transform"
    >
      <div className="flex items-center gap-4">
        <Ring
          pct={person.completionPct}
          size={56}
          label={`${Math.round(person.completionPct)}%`}
          ariaLabel={`${Math.round(person.completionPct)}% complete`}
        />
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate">{person.fullName}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
            {person.jobTitle}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {person.site}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {high > 0 && <span className="text-red-700 dark:text-red-300">🔴 {high}</span>}
            {medium > 0 && (
              <span className="text-amber-700 dark:text-amber-300">🟡 {medium}</span>
            )}
            {low > 0 && (
              <span className="text-green-700 dark:text-green-300">🟢 {low}</span>
            )}
            <span className="text-slate-500 dark:text-slate-400">
              assigned: {person.assigned} · ovr: {person.overdue}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
