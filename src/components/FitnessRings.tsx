import { useEffect, useState } from "react";

type RingData = {
  label: string;
  value: number; // 0-100+
  goal: number;
  color: string;
  trackColor: string;
  unit?: string;
};

const RING_CONFIG: Omit<RingData, "value">[] = [
  { label: "People", goal: 100, color: "#fa114f", trackColor: "rgba(250,17,79,0.18)", unit: "%" },
  { label: "Technical", goal: 100, color: "#92e82a", trackColor: "rgba(146,232,42,0.18)", unit: "%" },
  { label: "Safety", goal: 100, color: "#1ad5fd", trackColor: "rgba(26,213,253,0.18)", unit: "%" },
  { label: "Business", goal: 100, color: "#f5a623", trackColor: "rgba(245,166,35,0.18)", unit: "%" },
];

interface RingProps {
  size: number;
  stroke: number;
  progress: number; // 0..1+
  color: string;
  trackColor: string;
}

function Ring({ size, stroke, progress, color, trackColor }: RingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(progress, 1);
  const dash = circumference * (1 - clamped);
  const overflow = Math.max(0, progress - 1);

  return (
    <svg width={size} height={size} className="-rotate-90">
      <defs>
        <filter id={`glow-${color}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={trackColor}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
      />
      {/* Progress */}
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
        filter={`url(#glow-${color})`}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)" }}
      />
      {/* Overflow cap effect */}
      {overflow > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference * Math.min(overflow, 1)} ${circumference}`}
          opacity={0.85}
          filter={`url(#glow-${color})`}
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      )}
    </svg>
  );
}

function StackedRings({ values }: { values: number[] }) {
  const base = 280;
  const stroke = 26;
  const gap = 6;
  return (
    <div className="relative" style={{ width: base, height: base }}>
      {RING_CONFIG.map((r, i) => {
        const size = base - i * (stroke * 2 + gap);
        const offset = (base - size) / 2;
        return (
          <div key={r.label} className="absolute" style={{ top: offset, left: offset }}>
            <Ring
              size={size}
              stroke={stroke}
              progress={values[i] / r.goal}
              color={r.color}
              trackColor={r.trackColor}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function FitnessRings() {
  const [values, setValues] = useState<number[]>([0, 0, 0, 0]);
  const [targets, setTargets] = useState<number[]>([82, 67, 94, 58]);

  useEffect(() => {
    const t = setTimeout(() => setValues(targets), 100);
    return () => clearTimeout(t);
  }, [targets]);

  const randomize = () => {
    setValues([0, 0, 0, 0]);
    setTimeout(() => {
      setTargets(
        Array.from({ length: 4 }, () => Math.round(30 + Math.random() * 90))
      );
    }, 50);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 gap-12">
      <div className="text-center space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">Daily Activity</p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Your Rings</h1>
      </div>

      <StackedRings values={values} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
        {RING_CONFIG.map((r, i) => (
          <div
            key={r.label}
            className="rounded-2xl p-4 bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: r.color, boxShadow: `0 0 12px ${r.color}` }}
              />
              <span className="text-sm font-medium text-white/80">{r.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className="text-3xl font-semibold tabular-nums"
                style={{ color: r.color }}
              >
                {values[i]}
              </span>
              <span className="text-sm text-white/40">/ {r.goal}{r.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={randomize}
        className="px-6 py-3 rounded-full bg-white text-black font-medium text-sm hover:bg-white/90 transition active:scale-95"
      >
        Refresh Metrics
      </button>
    </div>
  );
}
