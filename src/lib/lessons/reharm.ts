// Reharmonisation: the three moves a jazz player reaches for first. Each one
// rewrites the chord timeline only. The voicings, the tune and the bass are
// then fitted to whatever chords come out, so nothing here touches notes.

import { parseChord } from "@/lib/music/chords";
import { pitchClass, pitchClassName, type Midi, type Spelling } from "@/lib/music/notes";

export type Reharm = "written" | "tritone" | "secondary" | "passingDim";

/** One chord on a timeline measured in ticks. */
export interface ChartChord {
  start: number;
  len: number;
  symbol: string;
  numeral: string;
  role: string;
  move?: string;
  /** False for a chord the reharmonisation put here or changed. */
  written: boolean;
  /** The left hand as authored for this chord, if it was. */
  voicing?: Midi[];
}

const LETTERS = "CDEFGAB";
const NATURAL = [0, 2, 4, 5, 7, 9, 11];

/**
 * A root named by its distance from another chord's root, so the letter is
 * right: the leading tone of G is F#, not Gb. Double accidentals fall back to
 * the lesson's plain spelling.
 */
function rootFrom(symbol: string, letterSteps: number, semitones: number, spelling: Spelling): string {
  const letter = LETTERS[(LETTERS.indexOf(symbol[0]) + letterSteps) % 7];
  const pc = pitchClass(parseChord(symbol).rootPc + semitones);
  let diff = pitchClass(pc - NATURAL[LETTERS.indexOf(letter)]);
  if (diff > 6) diff -= 12;
  if (diff === 0) return letter;
  if (diff === 1) return `${letter}#`;
  if (diff === -1) return `${letter}b`;
  return pitchClassName(pc, spelling);
}

function isMinorish(symbol: string): boolean {
  const q = parseChord(symbol).quality;
  return q === "m7" || q === "m6" || q === "m7b5";
}

/** How much of a chord an inserted approach chord takes: half, at most a bar. */
function approachLen(len: number, tpb: number): number {
  if (len >= 8 * tpb) return 4 * tpb;
  return Math.floor(len / 2 / tpb) * tpb;
}

export function reharmonise(
  chords: ChartChord[],
  kind: Reharm,
  tpb: number,
  spelling: Spelling,
): ChartChord[] {
  if (kind === "written") return chords;

  if (kind === "tritone") {
    return chords.map((chord, i) => {
      const next = chords[i + 1];
      const c = parseChord(chord.symbol);
      if (!next || c.quality !== "7") return chord;
      // Only a dominant that actually resolves down a fifth has a substitute.
      if (pitchClass(parseChord(next.symbol).rootPc - c.rootPc) !== 5) return chord;
      const root = rootFrom(next.symbol, 1, 1, spelling);
      return {
        ...chord,
        symbol: `${root}7#11`,
        numeral: `subV7/${next.numeral}`,
        role: `Tritone substitute for ${chord.symbol}. It keeps the same 3rd and 7th, swapped, and its root slides down a half step into ${next.symbol}.`,
        move: undefined,
        written: false,
        voicing: undefined,
      };
    });
  }

  const out: ChartChord[] = [];
  chords.forEach((chord, i) => {
    const next = chords[i + 1];
    const len = approachLen(chord.len, tpb);
    if (!next || len < 2 * tpb || parseChord(next.symbol).quality === "dim7") {
      out.push(chord);
      return;
    }
    const approach =
      kind === "secondary"
        ? {
            symbol: `${rootFrom(next.symbol, 4, 7, spelling)}7${isMinorish(next.symbol) ? "b9" : ""}`,
            numeral: `V7/${next.numeral}`,
            role: `Borrowed dominant. It is the V7 of ${next.symbol}, so it pulls into it harder than the chord that was here.`,
          }
        : {
            symbol: `${rootFrom(next.symbol, 6, 11, spelling)}dim7`,
            numeral: `vii°7/${next.numeral}`,
            role: `Passing diminished. Its root sits a half step under ${next.symbol} and pushes up into it.`,
          };
    // Already there, as with G7 going to C: nothing to add. Dm7 to D7 on the
    // same root is a real change of chord, so quality counts too.
    const a = parseChord(approach.symbol);
    const c = parseChord(chord.symbol);
    if (a.rootPc === c.rootPc && a.quality === c.quality) {
      out.push(chord);
      return;
    }
    out.push({ ...chord, len: chord.len - len });
    out.push({ ...approach, start: chord.start + chord.len - len, len, written: false });
  });
  return out;
}
