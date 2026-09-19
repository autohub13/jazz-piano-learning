// Scoring a line played over changes. There is no right note, only how each
// note sits against the chord under it: a chord tone, a scale tone, or
// outside. Chord tones on the strong beats and 3rds and 7ths on the changes
// are what make a line sound like it knows where it is.

import { findRegion } from "@/components/TheoryPanel";
import { buildTimeline } from "@/lib/lessons/timeline";
import type { Lesson } from "@/lib/lessons/types";
import { isChordTone, inScale, parseChord, type Chord } from "@/lib/music/chords";
import { pitchClass, type Midi } from "@/lib/music/notes";

export type NoteClass = "chord" | "scale" | "outside";

/** Root, flat 3rd, 4th, flat 5th, 5th, flat 7th above the tonic of a blues. */
const BLUES_SCALE = [0, 3, 5, 6, 7, 10];

export interface PlayedNote {
  midi: Midi;
  klass: NoteClass;
  /** When it was struck, in beats from the top of the form. */
  beat: number;
  /** On beat one or three of the bar. */
  strong: boolean;
  /** A 3rd or 7th struck within a beat of a chord change. */
  guide: boolean;
  symbol: string;
}

export interface ImprovScore {
  notes: number;
  /** Fraction of notes inside the chord scale, or leading a half step into a chord tone. */
  inScale: number;
  /** Fraction of strong-beat notes that were chord tones. */
  strongChordTones: number;
  guideHits: number;
  /** 0..1, what the mastery bar reads. */
  score: number;
}

export function chordUnder(lesson: Lesson, sec: number, bpm: number): { chord: Chord; changeSec: number } | null {
  if (!lesson.harmony) return null;
  const { timed } = buildTimeline(lesson.steps, bpm);
  const k = timed.findIndex((t) => sec >= t.startSec && sec < t.endSec);
  if (k < 0) return null;
  const region = findRegion(lesson.harmony, k);
  if (!region) return null;
  return { chord: parseChord(region.symbol), changeSec: timed[region.fromStep].startSec };
}

export function classify(lesson: Lesson, sec: number, bpm: number, midi: Midi): PlayedNote | null {
  const under = chordUnder(lesson, sec, bpm);
  if (!under) return null;
  const { chord, changeSec } = under;
  // On a blues the tonic's blues scale sits over every chord. Its flat 3rd
  // against the chord's major 3rd is the sound, not a mistake.
  const blue = lesson.bluesTonicPc !== undefined && BLUES_SCALE.includes(pitchClass(midi - lesson.bluesTonicPc));
  const klass: NoteClass = isChordTone(chord, midi) ? "chord" : inScale(chord, midi) || blue ? "scale" : "outside";
  const spb = 60 / bpm;
  const beats = sec / spb - (lesson.band?.startBeat ?? 0);
  const perBar = lesson.band?.beatsPerBar ?? 4;
  const inBar = ((beats % perBar) + perBar) % perBar;
  const frac = inBar - Math.floor(inBar);
  const onBeat = frac < 0.2 || frac > 0.85;
  const beat = Math.round(inBar) % perBar;
  const strong = onBeat && (beat === 0 || beat === 2);
  const rel = pitchClass(midi - chord.rootPc);
  const guide = (rel === chord.degrees[3] || rel === chord.degrees[7]) && sec - changeSec < spb;
  return { midi, klass, beat: sec / spb, strong, guide, symbol: chord.symbol };
}

/**
 * A chromatic approach: a note outside the scale that moves by a half step
 * into a chord tone within a beat. It is how an enclosure works, and it is
 * heard as aimed, not as wrong.
 */
export function isApproach(played: readonly PlayedNote[], i: number): boolean {
  const note = played[i];
  const next = played[i + 1];
  if (!next || note.klass !== "outside" || next.klass !== "chord") return false;
  const gap = next.beat - note.beat;
  return Math.abs(next.midi - note.midi) === 1 && gap > 0 && gap <= 1;
}

export function scoreImprov(played: PlayedNote[]): ImprovScore {
  const notes = played.length;
  if (notes === 0) return { notes: 0, inScale: 0, strongChordTones: 0, guideHits: 0, score: 0 };
  const inScale = played.filter((p, i) => p.klass !== "outside" || isApproach(played, i)).length / notes;
  const strong = played.filter((p) => p.strong);
  const strongChordTones = strong.length === 0 ? 0 : strong.filter((p) => p.klass === "chord").length / strong.length;
  const guideHits = played.filter((p) => p.guide).length;
  const score = 0.5 * inScale + 0.4 * strongChordTones + Math.min(0.1, guideHits * 0.02);
  return { notes, inScale, strongChordTones, guideHits, score };
}
