// Timed practice: the clock runs, each step has a moment, and a note is on
// time or it is not. Pure functions; the hook owns the state.

import { buildTimeline, type TimedStep } from "@/lib/lessons/timeline";
import type { LessonStep } from "@/lib/lessons/types";
import type { Midi } from "@/lib/music/notes";

/**
 * Seconds either side of the beat that still count as on it: 120 ms, or a
 * quarter of a beat once that is shorter. At 200 a swung eighth lasts 100 ms,
 * so a fixed window would be wider than the note it judges.
 */
export function onTimeWindow(bpm: number): number {
  return Math.min(0.12, 15 / bpm);
}

export interface TimedResult {
  index: number;
  /** All fresh notes of the step were struck before the step ended. */
  hit: boolean;
  /** The first correct strike landed within the window of the step's start. */
  onTime: boolean;
  /** Seconds from the step's start to that strike. Negative is early. */
  offset?: number;
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
export function stepAt(timed: TimedStep[], sec: number, window: number): number {
  for (let k = 0; k < timed.length; k++) {
    if (sec >= timed[k].startSec - window && sec < timed[k].endSec - window) return k;
  }
  return sec < 0 ? -1 : timed.length;
}

/** `lean` is the mean offset of the clean hits in seconds: negative is rushing. */
export function summarise(results: TimedResult[]): { accuracy: number; timing: number; lean: number } {
  if (results.length === 0) return { accuracy: 0, timing: 0, lean: 0 };
  const clean = results.filter((r) => r.hit && r.wrongNotes === 0);
  const timing = clean.length === 0 ? 0 : clean.filter((r) => r.onTime).length / clean.length;
  const offsets = clean.flatMap((r) => (r.offset === undefined ? [] : [r.offset]));
  const lean = offsets.length === 0 ? 0 : offsets.reduce((a, b) => a + b, 0) / offsets.length;
  return { accuracy: clean.length / results.length, timing, lean };
}
