import Ring from "./Ring";
import type { Person } from "@/lib/training-data";
import { effectiveStats } from "@/lib/training-data";

interface Props {
  person: Person;
  onClick: () => void;
}

export default function PersonCard({ person, onClick }: Props) {
  const { high, medium, low } = person.riskBadges;
  const stats = effectiveStats(person);
  return (
    <button
      onClick={onClick}
      className="w-full text-left block rounded-2xl bg-slate-900 shadow-sm p-4 border border-slate-800 active:scale-[0.99] transition-transform"
    >
      <div className="flex items-center gap-4">
        <Ring
          pct={stats.completionPct}
          size={56}
          label={`${Math.round(stats.completionPct)}%`}
          ariaLabel={`${person.fullName} ${Math.round(stats.completionPct)}% complete`}
        />
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate text-slate-100">{person.fullName}</div>
          <div className="text-sm text-slate-400 truncate">{person.jobTitle}</div>
          <div className="text-xs text-slate-500 truncate">{person.site}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {high > 0 && <span className="text-red-300">🔴 {high}</span>}
            {medium > 0 && <span className="text-amber-300">🟡 {medium}</span>}
            {low > 0 && <span className="text-green-300">🟢 {low}</span>}
            {person.hasTeam && (
              <span className="text-slate-400">{person.teamSize} reports</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
