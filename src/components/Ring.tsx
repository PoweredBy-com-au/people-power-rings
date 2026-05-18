import { useEffect, useId, useState } from "react";

interface RingProps {
  pct: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  ariaLabel?: string;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Ring({
  pct,
  size = 240,
  stroke,
  label,
  sublabel,
  ariaLabel,
}: RingProps) {
  const s = stroke ?? Math.max(6, Math.round(size * 0.085));
  const r = (size - s) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const color = clamped < 50 ? "#F59E0B" : "#0EA5E9";
  const filterId = useId().replace(/:/g, "");

  const reduced = prefersReducedMotion();
  const [animPct, setAnimPct] = useState(reduced ? clamped : 0);

  useEffect(() => {
    if (reduced) {
      setAnimPct(clamped);
      return;
    }
    const id = requestAnimationFrame(() => setAnimPct(clamped));
    return () => cancelAnimationFrame(id);
  }, [clamped, reduced]);

  const offset = c * (1 - animPct / 100);
  const cx = size / 2;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel ?? `${Math.round(clamped)}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <filter
            id={`ring-glow-${filterId}`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation={Math.max(2, size * 0.012)} />
          </filter>
        </defs>
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-slate-800"
          strokeWidth={s}
        />
        <g
          filter={`url(#ring-glow-${filterId})`}
          opacity={reduced ? 0 : 0.7}
          style={{ transition: reduced ? "none" : "opacity 1.2s ease" }}
        >
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={s}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{
              transition: reduced
                ? "none"
                : "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </g>
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={s}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition: reduced
              ? "none"
              : "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </svg>
      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {label && (
            <div
              className="font-semibold text-slate-50"
              style={{ fontSize: Math.round(size * 0.22) }}
            >
              {label}
            </div>
          )}
          {sublabel && (
            <div className="text-xs uppercase tracking-wide text-slate-400 mt-0.5 px-2">
              {sublabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
