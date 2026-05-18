import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "scf_onboarding_complete_v3";

type Slide = {
  eyebrow?: string;
  title?: string;
  body?: React.ReactNode;
  tone?: "default" | "good" | "bad" | "accent";
};

const SLIDES: Slide[] = [
  {
    eyebrow: "Welcome",
    title: "Welcome.",
    body: (
      <p>
        This tool exists to help SCF run{" "}
        <span className="text-white/90 font-medium">safer, simpler, and more productive</span>{" "}
        — through the lens of how we train our people.
      </p>
    ),
    tone: "accent",
  },
  {
    eyebrow: "Why this matters",
    title: "There's always room to be better.",
    body: (
      <p>
        For SCF, that starts with one of the foundations of safe operations:
        what we say people need to be competent at — and whether the record
        matches reality.
      </p>
    ),
  },
  {
    eyebrow: "Where we start",
    title: "The Training Needs Analysis.",
    body: (
      <p>
        The TNA decides what every role needs to know. It's the foundation
        everything else is built on: the LMS, the assignments, the
        certifications, the compliance reporting.{" "}
        <span className="text-white/90 font-medium">
          Get the TNA right and the rest follows.
        </span>
      </p>
    ),
  },
  {
    eyebrow: "Why the TNA matters",
    title: "It's how we know the right people are competent.",
    body: (
      <p>
        It feeds the LMS. It drives who gets trained, on what, and how. When
        the TNA is solid, the system underneath it works. When it's not, every
        downstream decision inherits the noise.
      </p>
    ),
  },
  {
    eyebrow: "Done well vs done badly",
    title: "Confidence — or compounding noise.",
    body: (
      <div className="space-y-4 text-left">
        <p>
          <span className="text-white/90 font-medium">Done well</span>, a TNA
          gives us confidence in who needs what to stay safe and productive. It
          helps people build capability — and that's what keeps them engaged.
        </p>
        <p>
          <span className="text-white/90 font-medium">Done badly</span>, it
          gets bloated and messy. People resent it for being inaccurate and
          irrelevant. And the gaps that go undetected become tomorrow's
          incident.
        </p>
      </div>
    ),
  },
  {
    eyebrow: "Where SCF's TNA is today",
    title: "We looked at the data. Here's what we found.",
    body: (
      <div className="space-y-5 text-left text-sm sm:text-base">
        <div>
          <div className="text-red-400 font-medium mb-1">
            🔴 High-risk patterns — almost 300 items affected
          </div>
          <ul className="space-y-1 text-white/65 list-disc pl-5">
            <li>~18 items with validity values that look like days entered into a months field — effectively never expiring.</li>
            <li>~270 items with identifier drift between plan and system — same training under two codes; the gap goes invisible.</li>
            <li>Additional no-record gaps — the plan says a role needs an item, the system has no assignment.</li>
          </ul>
        </div>
        <div>
          <div className="text-amber-400 font-medium mb-1">
            🟡 Medium-risk patterns — 2,400+ cases
          </div>
          <ul className="space-y-1 text-white/65 list-disc pl-5">
            <li>~2,465 coverage gaps within roles — same-role colleagues with different training assigned.</li>
            <li>~114 employees not on any TNA sheet — we can't infer what training they're meant to have.</li>
            <li>Vocabulary drift ("E-Learning" vs "WBT") and wiring placeholders like "Manually Assigned".</li>
          </ul>
        </div>
        <div>
          <div className="text-emerald-400 font-medium mb-1">
            🟢 Low-risk hygiene drift — hundreds of small cases
          </div>
          <ul className="space-y-1 text-white/65 list-disc pl-5">
            <li>~109 item-name spellings 95–99% similar to a canonical name (likely typos).</li>
            <li>Casing inconsistencies, stray characters, embedded notes in code columns.</li>
          </ul>
        </div>
        <p className="text-white/80 pt-1">
          None of this is catastrophic today.{" "}
          <span className="text-white font-medium">All of it compounds.</span>{" "}
          That's why we're starting now.
        </p>
      </div>
    ),
    tone: "bad",
  },
  {
    eyebrow: "Why we built this tool",
    title: "So we built this.",
    body: (
      <p>
        It lets you see what's currently identified as a training need across
        your team, your area, and the people you're ultimately responsible
        for. Use it to form a view: what's right, what needs to change, what's
        missing.
      </p>
    ),
  },
  {
    eyebrow: "The brief",
    title: "A Hilux, not a Rolls Royce.",
    body: (
      <p>
        Reliable, cost-effective, well-engineered.{" "}
        <span className="text-white/90 font-medium">
          A TNA you can trust, refresh quarterly, and use as a real management
          tool.
        </span>
      </p>
    ),
    tone: "accent",
  },
  {
    eyebrow: "What we need from you",
    title: "Three things, in this order.",
    body: (
      <ol className="space-y-4 text-left">
        <li className="flex gap-4">
          <span className="text-white/40 tabular-nums">01</span>
          <span>
            <span className="text-white/90 font-medium">Learn the tool.</span>{" "}
            Five minutes. Tap your team, drill into anyone, see how the toggles
            work.
          </span>
        </li>
        <li className="flex gap-4">
          <span className="text-white/40 tabular-nums">02</span>
          <span>
            <span className="text-white/90 font-medium">Walk through your area.</span>{" "}
            For each role ask: is the right training assigned? Is anything
            missing? Is anything assigned that no longer fits?{" "}
            <span className="text-white/50">Hilux, not Rolls Royce — just flag.</span>
          </span>
        </li>
        <li className="flex gap-4">
          <span className="text-white/40 tabular-nums">03</span>
          <span>
            <span className="text-white/90 font-medium">Bring it to a conversation.</span>{" "}
            We'll sit down individually and as a group to capture what you've
            found and turn it into action.
          </span>
        </li>
      </ol>
    ),
  },
  {
    eyebrow: "Where this goes",
    title: "This is the start. Here is the end.",
    body: (
      <div className="space-y-4 text-left">
        <p className="text-white/70">
          A few months from now, when this work is done, SCF is:
        </p>
        <ul className="space-y-3">
          <li>
            <span className="text-white/90 font-medium">Safer.</span>{" "}
            <span className="text-white/70">
              Every safety-critical requirement traces cleanly from role,
              through system, to person — no silent gaps, no expiry blind spots.
            </span>
          </li>
          <li>
            <span className="text-white/90 font-medium">Simpler.</span>{" "}
            <span className="text-white/70">
              The TNA is one document. Easy to read, easy to maintain.
            </span>
          </li>
          <li>
            <span className="text-white/90 font-medium">More productive.</span>{" "}
            <span className="text-white/70">
              Leaders use the TNA as a capability-planning tool. The contractor
              workforce — 82% of headcount — sits inside a clear framework.
            </span>
          </li>
        </ul>
        <p className="text-white/70 pt-1">
          <span className="text-white/90 font-medium">This is iteration one. There will be more.</span>
        </p>
      </div>
    ),
    tone: "good",
  },
  {
    eyebrow: "A note on what you're seeing",
    title: "Directionally correct.",
    body: (
      <p>
        We've worked with a limited set of data sources, filling gaps using
        experience and some data-science techniques. Treat what you see as{" "}
        <span className="text-white/90 font-medium">directionally correct</span>{" "}
        and fit for an initial conversation. Accuracy will sharpen as the work
        progresses.
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
          {index === total - 1 ? "Continue" : "Next"}
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
