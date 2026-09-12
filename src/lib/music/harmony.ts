// Working out what a note is doing inside a chord.
//
// The chord's root comes from its written symbol rather than from guessing at
// the notes. A shell voicing has no fifth and often no root on top, so naming
// chords by analysis would be ambiguous exactly where this app needs it to be
// certain. The symbol is already authored, so it is the source of truth.

import { pitchClass, type Midi } from "./notes";

const LETTER_SEMITONE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** "Dm7" -> 2, "Bb7" -> 10, "F#m7b5" -> 6. */
export function rootPitchClass(symbol: string): number {
  const match = /^([A-G])([#b]?)/.exec(symbol);
  if (!match) throw new Error(`Not a chord symbol: ${symbol}`);
  const accidental = match[2] === "#" ? 1 : match[2] === "b" ? -1 : 0;
  return (LETTER_SEMITONE[match[1]] + accidental + 12) % 12;
}

/**
 * Jazz degree names, indexed by semitones above the root. Tensions are named
 * as they are played rather than reduced into the octave, so a second is a 9th
 * and a sixth is a 13th, which is how a player reads them.
 */
const DEGREES = [
  "root", "b9", "9", "b3", "3", "11", "b5", "5", "#5", "13", "b7", "7",
] as const;

export function degreeName(rootPc: number, midi: Midi, symbol?: string): string {
  const step = (pitchClass(midi) - rootPc + 12) % 12;
  // A sixth chord has no seventh underneath, so this note is the 6th. Calling
  // it a 13th is only right once there is a 7th for it to sit above.
  if (step === 9 && symbol && symbol.includes("6") && !symbol.includes("7")) return "6";
  return DEGREES[step];
}

/** The same thing, shortened to fit on a key. */
export function degreeBadge(rootPc: number, midi: Midi, symbol?: string): string {
  const name = degreeName(rootPc, midi, symbol);
  return name === "root" ? "R" : name;
}

/** Every note of a chord, labelled for printing on the keyboard. */
export function degreeMap(symbol: string, notes: readonly Midi[]): Map<Midi, string> {
  const rootPc = rootPitchClass(symbol);
  const map = new Map<Midi, string>();
  for (const note of notes) map.set(note, degreeBadge(rootPc, note, symbol));
  return map;
}
