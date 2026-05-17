import { useMemo, useState } from "react";
import {
  CATEGORIES,
  Category,
  ORG,
  OrgNode,
  Training,
  aggregate,
  countPeople,
  findPath,
  typeLabel,
} from "@/lib/training-data";

interface RingProps {
  size: number;
  stroke: number;
  progress: number;
  color: string;
  trackColor: string;
  onClick?: () => void;
  highlighted?: boolean;
}

function Ring({ size, stroke, progress, color, trackColor, onClick, highlighted }: RingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(progress, 1);
  const dash = circumference * (1 - clamped);
  const id = color.replace("#", "");
  return (
    <svg
      width={size}
      height={size}
      className="-rotate-90"
      style={{ cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <defs>
        <filter id={`g-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={highlighted ? 4 : 2} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dash}
        filter={`url(#g-${id})`}
        style={{
          transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)",
          opacity: highlighted ? 1 : 0.95,
        }}
      />
    </svg>
  );
}

function StackedRings({
  training,
  onRingClick,
  activeCategory,
  size = 280,
}: {
  training: Training;
  onRingClick?: (c: Category) => void;
  activeCategory?: Category | null;
  size?: number;
}) {
  const stroke = 24;
  const gap = 6;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {CATEGORIES.map((c, i) => {
        const s = size - i * (stroke * 2 + gap);
        const offset = (size - s) / 2;
        const v = training[c.key];
        const progress = v.required ? v.completed / v.required : 0;
        return (
          <div
            key={c.key}
            className="absolute group"
            style={{ top: offset, left: offset }}
            title={`${c.label}: ${v.completed}/${v.required}`}
          >
            <Ring
              size={s}
              stroke={stroke}
              progress={progress}
              color={c.color}
              trackColor={c.track}
              onClick={onRingClick ? () => onRingClick(c.key) : undefined}
              highlighted={activeCategory === c.key}
            />
          </div>
        );
      })}
    </div>
  );
}

function MiniRings({ training, size = 64 }: { training: Training; size?: number }) {
  const stroke = 6;
  const gap = 2;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {CATEGORIES.map((c, i) => {
        const s = size - i * (stroke * 2 + gap);
        const offset = (size - s) / 2;
        const v = training[c.key];
        const progress = v.required ? v.completed / v.required : 0;
        return (
          <div key={c.key} className="absolute" style={{ top: offset, left: offset }}>
            <Ring size={s} stroke={stroke} progress={progress} color={c.color} trackColor={c.track} />
          </div>
        );
      })}
    </div>
  );
}

export default function TrainingInsights() {
  const [currentId, setCurrentId] = useState<string>(ORG.id);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const path = useMemo(() => findPath(ORG, currentId) ?? [ORG], [currentId]);
  const current = path[path.length - 1];
  const training = useMemo(() => aggregate(current), [current]);
  const totalPeople = useMemo(() => countPeople(current), [current]);

  const children = current.children ?? [];

  const sortedChildren = useMemo(() => {
    if (!activeCategory) return children;
    return [...children].sort((a, b) => {
      const ta = aggregate(a)[activeCategory];
      const tb = aggregate(b)[activeCategory];
      const pa = ta.required ? ta.completed / ta.required : 0;
      const pb = tb.required ? tb.completed / tb.required : 0;
      return pa - pb; // lowest compliance first
    });
  }, [children, activeCategory]);

  const overallPct = (() => {
    const tot = CATEGORIES.reduce(
      (s, c) => ({ r: s.r + training[c.key].required, c: s.c + training[c.key].completed }),
      { r: 0, c: 0 },
    );
    return tot.r ? Math.round((tot.c / tot.r) * 100) : 0;
  })();

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header / Breadcrumb */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Training Insights</p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {path.map((n, i) => (
              <div key={n.id} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentId(n.id);
                    setActiveCategory(null);
                  }}
                  className={`px-2 py-1 rounded-md transition ${
                    i === path.length - 1
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {n.name}
                </button>
                {i < path.length - 1 && <span className="text-white/30">/</span>}
              </div>
            ))}
          </div>
          <div className="flex items-baseline gap-4">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{current.name}</h1>
            <span className="text-sm text-white/50">
              {typeLabel(current.type)} · {totalPeople} {totalPeople === 1 ? "person" : "people"}
            </span>
          </div>
        </div>

        {/* Rings + summary */}
        <div className="grid md:grid-cols-[auto_1fr] gap-10 items-center">
          <div className="relative mx-auto">
            <StackedRings
              training={training}
              onRingClick={(c) => setActiveCategory((prev) => (prev === c ? null : c))}
              activeCategory={activeCategory}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-semibold tabular-nums">{overallPct}%</span>
              <span className="text-xs uppercase tracking-widest text-white/40">Completed</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((c) => {
              const v = training[c.key];
              const pct = v.required ? Math.round((v.completed / v.required) * 100) : 0;
              const isActive = activeCategory === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setActiveCategory(isActive ? null : c.key)}
                  className={`text-left rounded-2xl p-4 border transition ${
                    isActive
                      ? "bg-white/10 border-white/30"
                      : "bg-white/5 border-white/10 hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: c.color, boxShadow: `0 0 12px ${c.color}` }}
                    />
                    <span className="text-sm font-medium text-white/80">{c.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold tabular-nums" style={{ color: c.color }}>
                      {pct}%
                    </span>
                    <span className="text-xs text-white/40">
                      {v.completed}/{v.required} modules
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Drill-down */}
        {children.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm uppercase tracking-widest text-white/50">
                {typeLabel((children[0].type as OrgNode["type"]))}s
                {activeCategory && (
                  <span className="ml-2 normal-case tracking-normal text-white/40">
                    · sorted by {CATEGORIES.find((c) => c.key === activeCategory)!.label} gap
                  </span>
                )}
              </h2>
              <span className="text-xs text-white/40">Click any card to drill down</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedChildren.map((child) => {
                const t = aggregate(child);
                const focus = activeCategory
                  ? t[activeCategory]
                  : CATEGORIES.reduce(
                      (s, c) => ({ required: s.required + t[c.key].required, completed: s.completed + t[c.key].completed }),
                      { required: 0, completed: 0 },
                    );
                const pct = focus.required ? Math.round((focus.completed / focus.required) * 100) : 0;
                const accent = activeCategory
                  ? CATEGORIES.find((c) => c.key === activeCategory)!.color
                  : "#ffffff";
                return (
                  <button
                    key={child.id}
                    onClick={() => {
                      if (child.type !== "person") setCurrentId(child.id);
                    }}
                    className="text-left flex items-center gap-4 rounded-2xl p-4 bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition"
                  >
                    <MiniRings training={t} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{child.name}</span>
                        <span className="text-[10px] uppercase tracking-wider text-white/40 shrink-0">
                          {typeLabel(child.type)}
                        </span>
                      </div>
                      <div className="text-xs text-white/50 truncate">
                        {child.role ?? `${countPeople(child)} people`}
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-lg font-semibold tabular-nums" style={{ color: accent }}>
                          {pct}%
                        </span>
                        <span className="text-xs text-white/40">
                          {focus.completed}/{focus.required}
                          {activeCategory
                            ? ` ${CATEGORIES.find((c) => c.key === activeCategory)!.label.toLowerCase()}`
                            : " overall"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {current.type === "person" && (
          <div className="rounded-2xl p-6 bg-white/5 border border-white/10">
            <h2 className="text-sm uppercase tracking-widest text-white/50 mb-4">Module breakdown</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {CATEGORIES.map((c) => {
                const v = training[c.key];
                const pct = v.required ? Math.round((v.completed / v.required) * 100) : 0;
                return (
                  <div key={c.key} className="rounded-xl p-4 bg-black/40 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-sm">{c.label}</span>
                      </div>
                      <span className="text-sm tabular-nums" style={{ color: c.color }}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: c.color }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-white/50">
                      {v.completed} of {v.required} required modules completed
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
