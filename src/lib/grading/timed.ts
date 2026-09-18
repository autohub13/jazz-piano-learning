// Timed practice: the clock runs, each step has a moment, and a note is on
// time or it is not. Pure functions; the hook owns the state.

import { buildTimeline, type TimedStep } from "@/lib/lessons/timeline";
import type { LessonStep } from "@/lib/lessons/types";
import type { Midi } from "@/lib/music/notes";

/** Seconds either side of the beat that still count as on it. */
export const ON_TIME = 0.12;

export interface TimedResult {
  index: number;
  /** All fresh notes of the step were struck before the step ended. */
  hit: boolean;
  /** The first correct strike landed within ON_TIME of the step's start. */
  onTime: boolean;
  wrongNotes: number;
}

/** The notes a step asks to be struck: everything not tied over from before. */
export function freshNotes(step: LessonStep): Midi[] {
  return step.notes.filter((_, j) => !step.tied?.[j]);
}

export function timedSteps(steps: LessonStep[], bpm: number): TimedStep[] {
  return buildTimeline(steps, bpm).timed;
}

/** The step whose window holds `sec`, allowing an early strike into the next. */
export function stepAt(timed: TimedStep[], sec: number): number {
  for (let k = 0; k < timed.length; k++) {
    if (sec >= timed[k].startSec - ON_TIME && sec < timed[k].endSec - ON_TIME) return k;
  }
  return sec < 0 ? -1 : timed.length;
}

export function summarise(results: TimedResult[]): { accuracy: number; timing: number } {
  if (results.length === 0) return { accuracy: 0, timing: 0 };
  const clean = results.filter((r) => r.hit && r.wrongNotes === 0);
  const timing = clean.length === 0 ? 0 : clean.filter((r) => r.onTime).length / clean.length;
  return { accuracy: clean.length / results.length, timing };
}
