import { Link } from "@tanstack/react-router";

interface Props {
  icon: string;
  value: number | string;
  label: string;
  active?: boolean;
  to?: string;
  search?: Record<string, string | undefined>;
}

export default function StatTile({ icon, value, label, active, to, search }: Props) {
  const cls = `flex-1 rounded-2xl p-3 text-center min-h-[68px] border ${
    active
      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent"
      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
  }`;
  const content = (
    <div className={cls}>
      <div className="text-xl font-semibold leading-tight">
        <span className="mr-1" aria-hidden>{icon}</span>
        {value}
      </div>
      <div className="text-xs mt-1 opacity-80">{label}</div>
    </div>
  );
  if (to) {
    return (
      <Link to={to} search={search as never} className="flex-1">
        {content}
      </Link>
    );
  }
  return content;
}
