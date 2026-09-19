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

/** Where the swung "and" is written: the last third of the beat. */
const WRITTEN_AND = 2 / 3;

/**
 * Where the swung "and" is played, as a fraction of the beat. A triplet feel
 * up to a medium tempo, then evening out as players do, because at 250 a
 * two-to-one eighth turns into a shuffle. Nearly straight by 260.
 */
export function swingAnd(bpm: number): number {
  const t = Math.min(1, Math.max(0, (bpm - 140) / 120));
  return WRITTEN_AND - t * (WRITTEN_AND - 0.56);
}

/**
 * A written beat position as a played one. Whole beats stay where they are;
 * inside a beat, the written and moves to where this tempo swings it and
 * everything either side is stretched to fit. Everything that turns beats
 * into seconds goes through here, so the band, the piano and the grader agree.
 */
export function playedBeat(beat: number, bpm: number): number {
  const whole = Math.floor(beat + 1e-9);
  const f = Math.max(0, beat - whole);
  const and = swingAnd(bpm);
  const played = f <= WRITTEN_AND ? (f / WRITTEN_AND) * and : and + ((f - WRITTEN_AND) / (1 - WRITTEN_AND)) * (1 - and);
  return whole + played;
}

export function buildTimeline(steps: LessonStep[], bpm: number): Timeline {
  const secondsPerBeat = 60 / bpm;
  let beat = 0;
  const timed = steps.map((step, index) => {
    const startSec = playedBeat(beat, bpm) * secondsPerBeat;
    beat += step.beats;
    return { index, notes: step.notes, startSec, endSec: playedBeat(beat, bpm) * secondsPerBeat };
  });
  return { timed, totalSec: playedBeat(beat, bpm) * secondsPerBeat };
}
