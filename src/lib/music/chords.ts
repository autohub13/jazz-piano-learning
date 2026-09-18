// What a chord symbol means as notes: which semitone each degree sits on, and
// which scale a line over it may use. Everything procedural reads from here,
// so a voicing and a melody over the same symbol can never disagree.

import { rootPitchClass } from "./harmony";
import { letterIndex, pitchClass, pitchClassName, spellOnLetter, type Midi, type Spelling } from "./notes";

export type Quality = "maj7" | "6" | "m7" | "m6" | "7" | "m7b5" | "dim7";
export type Degree = "R" | "3" | "5" | "7" | "9" | "11" | "13";

export interface Chord {
  symbol: string;
  rootPc: number;
  quality: Quality;
  /** Semitones above the root for each degree, as this chord spells it. A 6
   *  chord puts its 6th in the 7th's place, since that is the job it does. */
  degrees: Record<Degree, number>;
  /** Semitones above the root of the scale a line over this chord uses. */
  scale: number[];
}

const IONIAN = [0, 2, 4, 5, 7, 9, 11];
const DORIAN = [0, 2, 3, 5, 7, 9, 10];
const MIXOLYDIAN = [0, 2, 4, 5, 7, 9, 10];

const BASE: Record<Quality, { degrees: Record<Degree, number>; scale: number[] }> = {
  maj7: { degrees: { R: 0, 3: 4, 5: 7, 7: 11, 9: 2, 11: 5, 13: 9 }, scale: IONIAN },
  6: { degrees: { R: 0, 3: 4, 5: 7, 7: 9, 9: 2, 11: 5, 13: 9 }, scale: IONIAN },
  m7: { degrees: { R: 0, 3: 3, 5: 7, 7: 10, 9: 2, 11: 5, 13: 9 }, scale: DORIAN },
  m6: { degrees: { R: 0, 3: 3, 5: 7, 7: 9, 9: 2, 11: 5, 13: 9 }, scale: DORIAN },
  7: { degrees: { R: 0, 3: 4, 5: 7, 7: 10, 9: 2, 11: 5, 13: 9 }, scale: MIXOLYDIAN },
  // The b9 over a half-diminished chord grinds, so its "9" is the 11.
  m7b5: { degrees: { R: 0, 3: 3, 5: 6, 7: 10, 9: 5, 11: 5, 13: 8 }, scale: [0, 1, 3, 5, 6, 8, 10] },
  dim7: { degrees: { R: 0, 3: 3, 5: 6, 7: 9, 9: 2, 11: 5, 13: 11 }, scale: [0, 2, 3, 5, 6, 8, 9, 11] },
};

function qualityOf(rest: string): Quality {
  if (/^(m7b5|ø)/.test(rest)) return "m7b5";
  if (/^(dim|°)/.test(rest)) return "dim7";
  if (/^(maj|Δ)/.test(rest)) return "maj7";
  if (/^m6/.test(rest)) return "m6";
  if (/^m/.test(rest)) return "m7";
  if (/^(7|9|13)/.test(rest)) return "7";
  // A plain major chord or a 6 chord. Jazz reads a bare triad as a 6.
  return "6";
}

/** "Dm7", "Db7#11", "A7b9", "F#dim7", "C6" -> the chord as degrees and scale. */
export function parseChord(symbol: string): Chord {
  const rootPc = rootPitchClass(symbol);
  const rest = symbol.replace(/^[A-G][#b]?/, "");
  const quality = qualityOf(rest);
  const degrees = { ...BASE[quality].degrees };
  let scale = BASE[quality].scale;
  if (quality === "7") {
    // One alteration at a time is all the reharmonisations write.
    if (rest.includes("b9")) {
      degrees[9] = 1;
      degrees[13] = 8;
      scale = [0, 1, 4, 5, 7, 8, 10];
    } else if (rest.includes("#11")) {
      degrees[11] = 6;
      scale = [0, 2, 4, 6, 7, 9, 10];
    } else if (rest.includes("b13")) {
      degrees[13] = 8;
      scale = [0, 2, 4, 5, 7, 8, 10];
    }
  }
  return { symbol, rootPc, quality, degrees, scale };
}

function relative(chord: Chord, midi: Midi): number {
  return pitchClass(midi - chord.rootPc);
}

/** Root, 3rd, 5th, 7th and 9th: the notes an arpeggio is allowed to land on. */
export function chordTones(chord: Chord): number[] {
  const d = chord.degrees;
  return [d.R, d[3], d[5], d[7], d[9]];
}

export function inScale(chord: Chord, midi: Midi): boolean {
  return chord.scale.includes(relative(chord, midi));
}

export function isChordTone(chord: Chord, midi: Midi): boolean {
  return chordTones(chord).includes(relative(chord, midi));
}

/**
 * The nearest note the chord allows, preferring a chord tone when two are the
 * same distance away. Ties then go down, which is where a resolving line goes.
 */
export function snapToChord(chord: Chord, midi: Midi): Midi {
  if (inScale(chord, midi)) return midi;
  for (let d = 1; d <= 2; d++) {
    const options = [midi - d, midi + d].filter((m) => inScale(chord, m));
    const tone = options.find((m) => isChordTone(chord, m));
    if (tone !== undefined) return tone;
    if (options.length > 0) return options[0];
  }
  return midi;
}

/** The next note above or below `from` whose place in the chord is in `set`. */
export function stepInSet(chord: Chord, set: readonly number[], from: Midi, dir: 1 | -1): Midi {
  for (let d = 1; d <= 12; d++) {
    const m = from + dir * d;
    if (set.includes(relative(chord, m))) return m;
  }
  return from + dir;
}

/** Letters above the tonic for each semitone: I bII II bIII III IV #IV V bVI VI bVII VII. */
const DEGREE_LETTER = [0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6];

/**
 * The root that sits `semitones` above the tonic of `key`, spelled by its
 * degree: the bVI of C is Ab and the bIII of G is Bb, even though G otherwise
 * reads in sharps.
 */
export function rootOnDegree(key: string, semitones: number, spelling: Spelling): string {
  const step = pitchClass(semitones);
  return spellOnLetter(letterIndex(key) + DEGREE_LETTER[step], rootPitchClass(key) + step, spelling);
}

/** "G7" up three semitones in flats is "Bb7". Keeps everything after the root. */
export function transposeSymbol(symbol: string, semitones: number, spelling: Spelling): string {
  const rest = symbol.replace(/^[A-G][#b]?/, "");
  return pitchClassName(pitchClass(rootPitchClass(symbol) + semitones), spelling) + rest;
}
