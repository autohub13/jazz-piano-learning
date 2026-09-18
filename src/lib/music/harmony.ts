// Working out what a note is doing inside a chord.
//
// The chord's root comes from its written symbol rather than from guessing at
// the notes. A shell voicing has no fifth and often no root on top, so naming
// chords by analysis would be ambiguous exactly where this app needs it to be
// certain. The symbol is already authored, so it is the source of truth.

import { letterIndex, pitchClass, spellOnLetter, type Midi, type Spelling } from "./notes";

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
  // No chord here is augmented, so over a seventh chord this is the flat 13th
  // that the altered and half-diminished chords carry.
  if (step === 8 && symbol && symbol.includes("7")) return "b13";
  return DEGREES[step];
}

/** Letters above the root's letter for each degree name. */
const LETTER_STEPS: Record<string, number> = {
  root: 0, b9: 1, "9": 1, b3: 2, "3": 2, "11": 3, b5: 4, "5": 4, "#5": 4, b13: 5, "13": 5, "6": 5, b7: 6, "7": 6,
};

/**
 * A note spelled by its place in the chord, so the 3rd of Cm7 is Eb even in a
 * key that otherwise reads in sharps. Anything that would need a double
 * accidental falls back to the plain spelling.
 */
export function spellInChord(symbol: string, midi: Midi, spelling: Spelling): string {
  const step = LETTER_STEPS[degreeName(rootPitchClass(symbol), midi, symbol)];
  return spellOnLetter(letterIndex(symbol) + step, pitchClass(midi), spelling);
}

/** The same thing, shortened to fit on a key. */
export function degreeBadge(rootPc: number, midi: Midi, symbol?: string): string {
  const name = degreeName(rootPc, midi, symbol);
  return name === "root" ? "R" : name;
}

function sentence(s: string): string {
  return s[0].toUpperCase() + s.slice(1);
}

/**
 * What the left hand actually did between two chords, in words: which notes
 * held, which slid by a step, which leapt, and what each became. Each new note
 * is paired with the nearest old one, closest pairs first.
 */
export function describeMove(
  from: { symbol: string; notes: readonly Midi[] },
  to: { symbol: string; notes: readonly Midi[] },
  spelling: Spelling,
): string | undefined {
  if (from.notes.length === 0 || to.notes.length === 0 || from.symbol === to.symbol) return undefined;
  const fromRoot = rootPitchClass(from.symbol);
  const toRoot = rootPitchClass(to.symbol);
  // The pairing with the least total movement, tried exhaustively: a hand is
  // four notes at most. A common tone that changes octave counts as a short
  // move, since the same note changing job is the story worth telling.
  const cost = (a: Midi, b: Midi) => (a !== b && pitchClass(b - a) === 0 ? 3 : Math.abs(b - a));
  const swap = from.notes.length > to.notes.length;
  const few = swap ? to.notes : from.notes;
  const many = swap ? from.notes : to.notes;
  let bestCost = Infinity;
  let bestPick: number[] = [];
  const search = (i: number, pick: number[], total: number) => {
    if (total >= bestCost) return;
    if (i === few.length) {
      bestCost = total;
      bestPick = pick;
      return;
    }
    many.forEach((m, j) => {
      if (!pick.includes(j)) search(i + 1, [...pick, j], total + cost(few[i], m));
    });
  };
  search(0, [], 0);
  const pairs = few.map((n, i) => (swap ? { a: many[bestPick[i]], b: n } : { a: n, b: many[bestPick[i]] }));
  const spare = many.filter((_, j) => !bestPick.includes(j));
  const oldLeft = swap ? spare : [];
  const newLeft = swap ? [] : spare;
  pairs.sort((p, q) => Math.abs(p.b - p.a) - Math.abs(q.b - q.a) || p.b - q.b);

  const old = (m: Midi) => spellInChord(from.symbol, m, spelling);
  const now = (m: Midi) => spellInChord(to.symbol, m, spelling);
  const was = (m: Midi) => degreeName(fromRoot, m, from.symbol);
  const is = (m: Midi) => degreeName(toRoot, m, to.symbol);
  const parts = pairs.map(({ a, b }) => {
    const d = b - a;
    const roles = was(a) === is(b) ? "" : `, ${was(a)} to ${is(b)}`;
    const becoming = `the ${was(a)} of ${from.symbol} becoming the ${is(b)} of ${to.symbol}`;
    if (d === 0) return was(a) === is(b) ? `${now(b)} holds` : `${now(b)} holds, ${becoming}`;
    const dir = d > 0 ? "rises" : "falls";
    if (pitchClass(d) === 0) {
      return `${now(b)} ${d > 0 ? "jumps up" : "drops"} an octave${was(a) === is(b) ? "" : `, ${becoming}`}`;
    }
    if (Math.abs(d) === 1) return `${old(a)} ${dir} a half step to ${now(b)}${roles}`;
    if (Math.abs(d) === 2) return `${old(a)} ${dir} a whole step to ${now(b)}${roles}`;
    return `${old(a)} ${d > 0 ? "moves up" : "moves down"} to ${now(b)}${roles}`;
  });
  for (const a of oldLeft) parts.push(`${old(a)} drops out`);
  for (const b of newLeft) parts.push(`${now(b)} is added as the ${is(b)}`);
  const smooth = pairs.every(({ a, b }) => Math.abs(b - a) <= 2) && pairs.some(({ a, b }) => a !== b);
  return [...(smooth ? ["every voice moves a step or less"] : []), ...parts].map((p) => `${sentence(p)}.`).join(" ");
}

/** Every note of a chord, labelled for printing on the keyboard. */
export function degreeMap(symbol: string, notes: readonly Midi[]): Map<Midi, string> {
  const rootPc = rootPitchClass(symbol);
  const map = new Map<Midi, string>();
  for (const note of notes) map.set(note, degreeBadge(rootPc, note, symbol));
  return map;
}
