import type { KeyName } from "@/lib/lessons/transpose";
import type { Lesson } from "@/lib/lessons/types";

/**
 * drill: play what lights up, untimed or timed.
 * progression: a chord sequence with the band, timed.
 * tune: a whole form with the band, timed.
 * improv: the band plays the form, the right hand is free and scored by chord.
 * ear: a chord or progression is played, the learner plays it back.
 */
export type ExerciseKind = "drill" | "progression" | "tune" | "improv" | "ear";

export type Level = 1 | 2 | 3 | 4 | 5 | 6;

export interface Exercise {
  id: string;
  title: string;
  kind: ExerciseKind;
  level: Level;
  /** The skill tree node this belongs to. */
  unit: string;
  blurb: string;
  /** What to listen for, in degrees and numerals so it holds in every key. */
  teachingPoints: string[];
  /** Which keys count towards mastery. "all" is the twelve. */
  keys: "all" | readonly KeyName[];
  /** Pure. The same key always gives the same lesson. */
  generate(key: KeyName): Lesson;
  /** First-try accuracy needed in each key, and a tempo when time counts. */
  mastery: { accuracy: number; bpm?: number };
  /** Exercise ids that must be mastered in at least one key first. */
  prerequisites: string[];
  /** Rough minutes for one pass in one key, for the daily plan. */
  minutes: number;
  /** The library tune this is built on, if any. */
  tune?: string;
  /** The unit's own piece: its theory as a tune, with the full band. */
  etude?: boolean;
}

export interface Unit {
  id: string;
  level: Level;
  title: string;
  blurb: string;
}
