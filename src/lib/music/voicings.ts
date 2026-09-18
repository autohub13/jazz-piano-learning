// Turning a chord into notes for the left hand. Every style is a list of shapes
// written in degrees; the octave, and which shape, are chosen to move as little
// as possible from the chord before. That choice is the whole difference
// between comping and a list of chords: the hand stays put and single voices
// slide by a step, which is what makes a progression sound joined up.

import type { Chord, Degree } from "./chords";
import type { Midi } from "./notes";

export type VoicingStyle = "shell" | "rootless" | "drop2" | "quartal";

/** Where the hand sits when there is nothing before to lead from: around G3. */
const HOME = 56;
/** Below about D3 a third turns to mud, so only a shell's root goes lower. */
const MUD_FLOOR = 50;

function shapes(style: VoicingStyle, chord: Chord): Degree[][] {
  const dominant = chord.quality === "7";
  switch (style) {
    case "shell":
      return [["R", "3", "7"], ["R", "7", "3"]];
    case "rootless":
      // The A and B forms. A dominant swaps its plain 5th for the 13th.
      return dominant
        ? [["3", "13", "7", "9"], ["7", "9", "3", "13"]]
        : [["3", "5", "7", "9"], ["7", "9", "3", "5"]];
    case "drop2":
      // Each close position of R 3 5 7 with its second voice from the top
      // dropped an octave, which is why the dropped degree comes first here.
      return [["5", "R", "3", "7"], ["7", "3", "5", "R"], ["R", "5", "7", "3"], ["3", "7", "R", "5"]];
    case "quartal":
      if (chord.quality === "maj7" || chord.quality === "6") return [["3", "13", "9", "5"]];
      if (dominant) return [["7", "3", "13", "9"]];
      if (chord.quality === "dim7") return [["3", "5", "7", "9"]];
      // The "So What" shape: three fourths and a major third.
      return [["11", "7", "3", "5"]];
  }
}

/** A shape as ascending semitones above the root, each voice above the last. */
function offsets(chord: Chord, shape: Degree[]): number[] {
  const out: number[] = [];
  for (const degree of shape) {
    let s = chord.degrees[degree];
    while (out.length > 0 && s <= out[out.length - 1]) s += 12;
    out.push(s);
  }
  return out;
}

function nearest(note: Midi, set: readonly Midi[]): number {
  return Math.min(...set.map((m) => Math.abs(m - note)));
}

function mean(notes: readonly Midi[]): number {
  return notes.reduce((a, b) => a + b, 0) / notes.length;
}

/** How far the hand has to move: each new note to its nearest old one and back. */
export function movement(from: readonly Midi[], to: readonly Midi[]): number {
  return (
    to.reduce((sum, n) => sum + nearest(n, from), 0) + from.reduce((sum, n) => sum + nearest(n, to), 0)
  );
}

export interface VoiceOptions {
  /** The voicing before this one, to lead from. */
  prev: readonly Midi[] | null;
  /** Keyboard window. Nothing is placed outside it. */
  low: Midi;
  high: Midi;
  /** Highest note the left hand may use, so it stays under the tune. */
  ceiling: Midi;
}

export function voice(
  chord: Chord,
  style: VoicingStyle,
  { prev, low, high, ceiling }: VoiceOptions,
): Midi[] {
  const floor = style === "shell" ? low : Math.max(low, MUD_FLOOR);
  const top = Math.min(ceiling, high);
  let best: Midi[] = [];
  let bestCost = Infinity;
  for (const shape of shapes(style, chord)) {
    const rel = offsets(chord, shape);
    for (let octave = 1; octave <= 7; octave++) {
      const notes = rel.map((s) => chord.rootPc + 12 * octave + s);
      const outside = notes.reduce(
        (sum, n) => sum + Math.max(0, floor - n) + Math.max(0, n - top),
        0,
      );
      const lead =
        prev && prev.length > 0
          ? movement(prev, notes) + 0.2 * Math.abs(mean(notes) - HOME)
          : 2 * Math.abs(mean(notes) - HOME);
      const cost = lead + 8 * outside;
      if (cost < bestCost) {
        bestCost = cost;
        best = notes;
      }
    }
  }
  // A tune low enough to leave no room gets the voicing with its top trimmed
  // off, rather than a left hand crossing over the melody.
  const fitted = best.filter((n) => n >= low && n <= top);
  return fitted.length >= 2 ? fitted : best.filter((n) => n >= low && n <= high);
}

/** Every shape of a style, each placed nearest `around`, lowest voice first.
 *  A drill plays these in turn so the hand learns all the forms. */
export function voicingForms(chord: Chord, style: VoicingStyle, around: Midi): Midi[][] {
  return shapes(style, chord).map((shape) => {
    const rel = offsets(chord, shape);
    let best: Midi[] = [];
    let bestDist = Infinity;
    for (let octave = 1; octave <= 7; octave++) {
      const notes = rel.map((s) => chord.rootPc + 12 * octave + s);
      const dist = Math.abs(mean(notes) - around);
      if (dist < bestDist) {
        bestDist = dist;
        best = notes;
      }
    }
    return best;
  });
}
