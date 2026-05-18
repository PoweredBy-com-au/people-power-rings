import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "scf_onboarding_complete_v2";

type Slide = {
  eyebrow?: string;
  title?: string;
  body?: React.ReactNode;
  tone?: "default" | "good" | "bad" | "accent";
};

const SLIDES: Slide[] = [
  {
    eyebrow: "Southern Cross Fertilisers",
    title: "A production made for SCF",
    body: (
      <p className="text-white/60">
        Powered by <span className="text-white/90 font-medium">PoweredBy™</span>
      </p>
    ),
    tone: "accent",
  },
  {
    eyebrow: "Welcome",
    title: "Lifting safety, productivity and engagement.",
    body: (
      <p>
        This tool helps SCF lift safety, productivity and engagement through the
        lens of learning and development.
      </p>
    ),
  },
  {
    eyebrow: "Mindset",
    title: "There's always room to be better.",
    body: <p>A continuous improvement mindset assumes it.</p>,
  },
  {
    eyebrow: "Starting point",
    title: "The Training Needs Analysis.",
    body: <p>The TNA, for short — that's where we begin.</p>,
  },
  {
    eyebrow: "Why the TNA matters",
    title: "It's the foundation for competence.",
    body: (
      <p>
        It feeds the LMS and drives who gets trained, on what, and how — the
        backbone of safety, productivity and engagement.
      </p>
    ),
  },
  {
    eyebrow: "Done well",
    title: "Confidence in what people need.",
    body: (
      <p>
        A good TNA helps people build capability to stay safe and productive —
        and that's what keeps them engaged.
      </p>
    ),
    tone: "good",
  },
  {
    eyebrow: "Done badly",
    title: "Bloated, messy, resented.",
    body: (
      <p>
        The organisation loses sight of what matters for safety and productivity,
        and people resent it for being inaccurate and irrelevant to their role.
      </p>
    ),
    tone: "bad",
  },
  {
    eyebrow: "Where we are",
    title: "SCF's TNA isn't where it needs to be.",
    body: (
      <p>
        The good news: it's fixable — with some effort, focus and resolve.
      </p>
    ),
  },
  {
    eyebrow: "This tool",
    title: "Interact with the TNA.",
    body: (
      <p>
        See what's currently identified as a training need, and start thinking
        about how to sharpen it for safety, productivity and engagement.
      </p>
    ),
  },
  {
    eyebrow: "The brief",
    title: "A Hilux, not a Rolls Royce.",
    body: (
      <p>
        Reliable, cost-effective, well-engineered. A TNA you can trust.
      </p>
    ),
    tone: "accent",
  },
  {
    eyebrow: "What you do",
    title: "Okay, so what do I do?",
    body: (
      <ol className="space-y-4 text-left">
        <li className="flex gap-4">
          <span className="text-white/40 tabular-nums">01</span>
          <span>Learn how to use the tool.</span>
        </li>
        <li className="flex gap-4">
          <span className="text-white/40 tabular-nums">02</span>
          <span>
            Go through the area(s) you're responsible for and form a view on
            what needs to change.{" "}
            <span className="text-white/50">(Remember — Hilux, not Rolls Royce.)</span>
          </span>
        </li>
        <li className="flex gap-4">
          <span className="text-white/40 tabular-nums">03</span>
          <span>
            We'll sit down individually and as a group to capture your thoughts
            and turn the TNA into something genuinely useful.
          </span>
        </li>
      </ol>
    ),
  },
  {
    eyebrow: "A note on the data",
    title: "Directionally correct.",
    body: (
      <p>
        PoweredBy has worked with a limited set of data sources, filling gaps
        using experience and some data science techniques. Treat it as fit for
        an initial conversation — accuracy will improve as the work progresses.
      </p>
    ),
  },
];

const TONE_ACCENT: Record<NonNullable<Slide["tone"]>, string> = {
  default: "#e8487f",
  good: "#14b8a6",
  bad: "#f59e0b",
  accent: "#8b5cf6",
};

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const total = SLIDES.length;
  const slide = SLIDES[index];
  const accent = TONE_ACCENT[slide.tone ?? "default"];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    onComplete();
  };

  const next = () => {
    if (index < total - 1) setIndex(index + 1);
    else finish();
  };
  const back = () => setIndex((i) => Math.max(0, i - 1));

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 sm:px-10 pt-6">
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full transition-colors duration-500"
            style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
          />
          <span className="text-xs uppercase tracking-[0.18em] text-white/50">
            SCF · Training Insights
          </span>
        </div>
        <button
          onClick={finish}
          className="text-xs text-white/40 hover:text-white/80 transition-colors"
        >
          Skip intro
        </button>
      </div>

      {/* Progress dots */}
      <div className="px-6 sm:px-10 mt-6">
        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to step ${i + 1}`}
              className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/10"
            >
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: i < index ? "100%" : i === index ? "100%" : "0%",
                  background: i <= index ? accent : "transparent",
                  opacity: i === index ? 1 : i < index ? 0.5 : 0,
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Slide */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-10">
        <div
          key={index}
          className="max-w-2xl w-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {slide.eyebrow && (
            <div
              className="text-xs uppercase tracking-[0.22em]"
              style={{ color: accent }}
            >
              {slide.eyebrow}
            </div>
          )}
          {slide.title && (
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
              {slide.title}
            </h1>
          )}
          {slide.body && (
            <div className="text-base sm:text-lg text-white/70 leading-relaxed max-w-xl mx-auto">
              {slide.body}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 sm:px-10 pb-8 flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={back}
          disabled={index === 0}
          className="text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30"
        >
          Back
        </Button>
        <span className="text-xs text-white/40 tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <Button
          onClick={next}
          className="bg-white text-black hover:bg-white/90 font-medium min-w-[120px]"
        >
          {index === total - 1 ? "Enter tool" : "Next"}
        </Button>
      </div>
    </div>
  );
}

export function isOnboardingDone(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function useOnboarding() {
  const [mounted, setMounted] = useState(false);
  const [done, setDone] = useState(true);
  useEffect(() => {
    setMounted(true);
    setDone(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);
  return {
    mounted,
    done,
    markDone: () => {
      localStorage.setItem(STORAGE_KEY, "true");
      setDone(true);
    },
  };
}
