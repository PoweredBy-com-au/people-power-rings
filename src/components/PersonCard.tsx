import Ring from "./Ring";
import type { Person } from "@/lib/training-data";
import { effectiveStats } from "@/lib/training-data";

interface Props {
  person: Person;
  onClick: () => void;
}

export default function PersonCard({ person, onClick }: Props) {
  const stats = effectiveStats(person);
  const isContractor = person.personType === "Contractor";
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
          <div className="flex items-center gap-2">
            <div className="font-medium truncate text-slate-100">{person.fullName}</div>
            <span
              className={`shrink-0 text-[10px] uppercase tracking-wide rounded-full px-1.5 py-0.5 ${
                isContractor
                  ? "bg-slate-800 text-slate-400"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {isContractor ? "Con" : "Emp"}
            </span>
          </div>
          <div className="text-sm text-slate-400 truncate">
            {person.jobTitle || (isContractor ? "Contractor" : "—")}
          </div>
          <div className="text-xs text-slate-500 truncate">{person.site}</div>
          {person.hasTeam && (
            <div className="mt-1 text-xs text-slate-400">↳ {person.teamSize} reports</div>
          )}
        </div>
      </div>
    </button>
  );
}
