// The chord cheat sheet: every chord a chart here writes, on every root, as
// the keys to press. A chord is authored once as a formula in degrees, and the
// formula gives the semitones, the letter each note is spelled on and the
// label under it, so the three cannot drift apart.

import { rootPitchClass } from "./harmony";
import { isBlackKey, letterIndex, spellOnLetter, type Midi, type Spelling } from "./notes";

/** Every root name a chart can write, sharps and flats both, left to right. */
export const SHEET_ROOTS = [
  "C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
] as const;
export type SheetRoot = (typeof SHEET_ROOTS)[number];

export interface SheetChord {
  /** What follows the root in the symbol: "m7" in "Dm7". */
  suffix: string;
  name: string;
  /** Root position, bottom to top. Tensions sit above the 7th, where they are played. */
  formula: string;
}

export const SHEET_CHORDS: SheetChord[] = [
  { suffix: "", name: "Major", formula: "R 3 5" },
  { suffix: "m", name: "Minor", formula: "R b3 5" },
  { suffix: "6", name: "Major sixth", formula: "R 3 5 6" },
  { suffix: "m6", name: "Minor sixth", formula: "R b3 5 6" },
  { suffix: "maj7", name: "Major seventh", formula: "R 3 5 7" },
  { suffix: "m7", name: "Minor seventh", formula: "R b3 5 b7" },
  { suffix: "7", name: "Dominant seventh", formula: "R 3 5 b7" },
  { suffix: "m7b5", name: "Half diminished", formula: "R b3 b5 b7" },
  { suffix: "dim7", name: "Diminished seventh", formula: "R b3 b5 bb7" },
  { suffix: "7b9", name: "Dominant, flat nine", formula: "R 3 5 b7 b9" },
  { suffix: "7#11", name: "Dominant, sharp eleven", formula: "R 3 5 b7 #11" },
  { suffix: "7b13", name: "Dominant, flat thirteen", formula: "R 3 5 b7 b13" },
  { suffix: "7alt", name: "Altered dominant", formula: "R 3 b5 b7 b9 b13" },
];

const MAJOR = [0, 2, 4, 5, 7, 9, 11];

/** "b7" is 10 semitones up and six letters up; "#11" is 18 and ten. */
export function parseDegree(token: string): { semitones: number; letters: number } {
  if (token === "R") return { semitones: 0, letters: 0 };
  const n = Number(token.replace(/[#b]/g, ""));
  let semitones = MAJOR[(n - 1) % 7] + (n > 7 ? 12 : 0);
  for (const ch of token) semitones += ch === "#" ? 1 : ch === "b" ? -1 : 0;
  return { semitones, letters: n - 1 };
}

/** The highest any chord on the sheet reaches above its root. */
const REACH = Math.max(
  ...SHEET_CHORDS.flatMap((c) => c.formula.split(" ").map((t) => parseDegree(t).semitones)),
);

/**
 * The keys one root's diagrams show. They start on the C or the F below the
 * root, so the twos and threes of the black keys always read the same way, and
 * every chord on a root shares one window: the shapes compare at a glance.
 */
export function sheetWindow(root: SheetRoot): { low: Midi; high: Midi; rootMidi: Midi } {
  const rootPc = rootPitchClass(root);
  const low = 48 + (rootPc >= 5 ? 5 : 0);
  const rootMidi = 48 + rootPc;
  const high = Math.max(low + 24, rootMidi + REACH);
  return { low, high: isBlackKey(high) ? high + 1 : high, rootMidi };
}

export interface SheetNote {
  midi: Midi;
  /** Spelled on the letter its degree asks for: the b3 of C is Eb, never D#. */
  name: string;
  degree: string;
}

export function sheetNotes(root: SheetRoot, chord: SheetChord): SheetNote[] {
  const { rootMidi } = sheetWindow(root);
  const fallback: Spelling = root.includes("#") ? "sharp" : "flat";
  return chord.formula.split(" ").map((degree) => {
    const { semitones, letters } = parseDegree(degree);
    const midi = rootMidi + semitones;
    return { midi, name: spellOnLetter(letterIndex(root) + letters, midi, fallback), degree };
  });
}
