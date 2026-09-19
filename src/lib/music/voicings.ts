// Turning a chord into notes for the left hand, or for drop 2, both. Every
// style is a list of shapes written in degrees; the octave, and which shape, are chosen to move as little
// as possible from the chord before. That choice is the whole difference
// between comping and a list of chords: the hand stays put and single voices
// slide by a step, which is what makes a progression sound joined up.

import type { Chord, Degree } from "./chords";
import type { Midi } from "./notes";

export type VoicingStyle = "shell" | "shell3" | "rootless" | "drop2" | "quartal";

/** Where the hand sits when there is nothing before to lead from: around G3. */
const HOME = 56;
/** Below about D3 a third turns to mud, so only a shell's root goes lower. */
const MUD_FLOOR = 50;
/** A root and 3rd alone turn to mud sooner than a root and 7th: C3 and F2. */
const SHELL_FLOOR = { "3": 48, "7": 41 };

function shapes(style: VoicingStyle, chord: Chord): Degree[][] {
  const dominant = chord.quality === "7";
  switch (style) {
    case "shell":
      // Two notes, the way Bud Powell played them: the root with one guide
      // tone. Alternating the two down a cycle of fifths keeps the top voice
      // moving by a half step or not at all, and any hand can hold them.
      return [["R", "7"], ["R", "3"]];
    case "shell3":
      // The full shell. Root-7-3 is a tenth, so this is for hands that reach one.
      return [["R", "3", "7"], ["R", "7", "3"]];
    case "rootless":
      // The A and B forms. A dominant swaps its plain 5th for the 13th. A half
      // diminished chord has no usable 9th, and takes its root there instead.
      if (chord.quality === "m7b5") return [["3", "5", "7", "R"], ["7", "R", "3", "5"]];
      return dominant
        ? [["3", "13", "7", "9"], ["7", "9", "3", "13"]]
        : [["3", "5", "7", "9"], ["7", "9", "3", "5"]];
    case "drop2":
      // Each close position of R 3 5 7 with its second voice from the top
      // dropped an octave, which is why the dropped degree comes first here.
      // The span is a ninth or a tenth, so the arranger gives the dropped
      // voice to the left hand and the rest to the right.
      return [["5", "R", "3", "7"], ["7", "3", "5", "R"], ["R", "5", "7", "3"], ["3", "7", "R", "5"]];
    case "quartal":
      // Three notes, because that is what one hand holds: a fourth voice puts
      // every one of these past a ninth.
      if (chord.quality === "maj7" || chord.quality === "6") return [["3", "13", "9"]];
      if (dominant) return [["7", "3", "13"]];
      if (chord.quality === "dim7") return [["3", "5", "7", "9"]];
      // The middle of the two-handed "So What" voicing, R 11 7 3 5.
      return [["11", "7", "3"]];
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
  const mud = style === "shell3" ? low : Math.max(low, MUD_FLOOR);
  const top = Math.min(ceiling, high);
  let best: Midi[] = [];
  let bestCost = Infinity;
  for (const shape of shapes(style, chord)) {
    const rel = offsets(chord, shape);
    const floor = style === "shell" ? Math.max(low, SHELL_FLOOR[shape[1] as "3" | "7"]) : mud;
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
  // A three-note shape may be cut to one note; a fourth voice leaves room for two.
  return fitted.length >= (best.length > 3 ? 2 : 1) ? fitted : best.filter((n) => n >= low && n <= high);
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
