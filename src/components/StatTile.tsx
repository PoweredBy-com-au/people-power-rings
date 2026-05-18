interface Props {
  icon: string;
  value: number | string;
  label: string;
  active?: boolean;
}

export default function StatTile({ icon, value, label, active }: Props) {
  const cls = `w-full rounded-2xl p-3 text-center min-h-[68px] border ${
    active
      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent"
      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
  }`;
  return (
    <div className={cls}>
      <div className="text-xl font-semibold leading-tight">
        <span className="mr-1" aria-hidden>{icon}</span>
        {value}
      </div>
      <div className="text-xs mt-1 opacity-80">{label}</div>
    </div>
  );
}
