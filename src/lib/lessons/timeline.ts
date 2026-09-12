import type { Midi } from "@/lib/music/notes";
import type { LessonStep } from "./types";

export interface TimedStep {
  index: number;
  notes: Midi[];
  /** Seconds from the start of playback. */
  startSec: number;
  endSec: number;
}

export interface Timeline {
  timed: TimedStep[];
  totalSec: number;
}

export function buildTimeline(steps: LessonStep[], bpm: number): Timeline {
  const secondsPerBeat = 60 / bpm;
  let cursor = 0;
  const timed = steps.map((step, index) => {
    const startSec = cursor;
    cursor += step.beats * secondsPerBeat;
    return { index, notes: step.notes, startSec, endSec: cursor };
  });
  return { timed, totalSec: cursor };
}
