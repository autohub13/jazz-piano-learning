"use client";

// The chart as a player reads it: bars in rows of four, a chord symbol where
// the chord changes, the bar under the music lit. Reading this while the band
// plays is the skill; the keyboard below is only the answer key.

import { memo, useMemo } from "react";
import type { Lesson } from "@/lib/lessons/types";
import { cn } from "@/lib/utils";

interface Bar {
  index: number;
  symbols: string[];
  pickup: boolean;
}

export function barsOf(lesson: Lesson): { bars: Bar[]; barOfStep: number[] } {
  const perBar = lesson.band?.beatsPerBar ?? 4;
  const pickup = lesson.band?.startBeat ?? 0;
  const starts: number[] = [];
  let t = 0;
  for (const step of lesson.steps) {
    starts.push(t);
    t += step.beats;
  }
  const barAt = (beat: number) => (pickup > 0 ? Math.floor((beat - pickup) / perBar) + 1 : Math.floor(beat / perBar));
  const count = pickup > 0 ? barAt(t - 1e-6) + 1 : Math.ceil(t / perBar);
  const bars: Bar[] = Array.from({ length: count }, (_, i) => ({ index: i, symbols: [], pickup: pickup > 0 && i === 0 }));
  for (const region of lesson.harmony ?? []) {
    const beat = starts[region.fromStep] ?? 0;
    const bar = Math.max(0, barAt(beat));
    bars[bar]?.symbols.push(region.symbol);
  }
  return { bars, barOfStep: starts.map((s) => Math.max(0, barAt(s))) };
}

function LeadSheetImpl({ lesson, activeIndex }: { lesson: Lesson; activeIndex: number }) {
  const { bars, barOfStep } = useMemo(() => barsOf(lesson), [lesson]);
  const active = activeIndex >= 0 ? barOfStep[activeIndex] : -1;
  return (
    <ol className="leadsheet" aria-label="Chord chart">
      {bars.map((bar) => (
        <li
          key={bar.index}
          className={cn("leadsheet__bar", bar.index === active && "is-active", bar.pickup && "is-pickup")}
        >
          {bar.symbols.length === 0 ? (
            <span className="leadsheet__repeat">{bar.pickup ? "" : "%"}</span>
          ) : (
            bar.symbols.map((s, i) => (
              <span key={i} className="leadsheet__chord">
                {s}
              </span>
            ))
          )}
        </li>
      ))}
    </ol>
  );
}

export const LeadSheet = memo(LeadSheetImpl);
