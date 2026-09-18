// Note representation. MIDI integers are the single internal currency: audio
// calls, highlight sets and practice comparison all use them, so "A#4" and
// "Bb4" compare equal for free. Names are derived at render time only, because
// spelling is a property of context, not of pitch: MIDI 63 is Eb in a Cm7 and
// D# in a B major triad, and the number cannot tell you which. Each lesson
// therefore carries a `spelling` flag.

export type Midi = number;
export type Spelling = "sharp" | "flat";

const SHARP_PC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_PC = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const BLACK_PCS = new Set([1, 3, 6, 8, 10]);
const LETTER_SEMITONE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** 0-11, correct for negative input too. */
export function pitchClass(midi: Midi): number {
  return ((midi % 12) + 12) % 12;
}

/** Scientific pitch: C4 = 60 sits in octave 4. */
export function octaveOf(midi: Midi): number {
  return Math.floor(midi / 12) - 1;
}

/** The five black pitch classes. Drives both geometry and styling. */
export function isBlackKey(midi: Midi): boolean {
  return BLACK_PCS.has(pitchClass(midi));
}

export function pitchClassName(midi: Midi, spelling: Spelling): string {
  const table = spelling === "flat" ? FLAT_PC : SHARP_PC;
  return table[pitchClass(midi)];
}

const LETTERS = "CDEFGAB";
/** Letter-correct names that read as a white key to anyone not doing theory. */
const WHITE_ENHARMONIC = new Set(["Fb", "Cb", "E#", "B#"]);

/**
 * A pitch class written on a given letter (0 is C, 6 is B), so the flat 3rd of
 * C is Eb whatever the surrounding key reads in. Anything that would need a
 * double accidental falls back to the plain spelling.
 */
export function spellOnLetter(letter: number, pc: number, fallback: Spelling): string {
  const l = ((letter % 7) + 7) % 7;
  let diff = pitchClass(pc - LETTER_SEMITONE[LETTERS[l]]);
  if (diff > 6) diff -= 12;
  if (diff === 0) return LETTERS[l];
  const name = diff === 1 ? `${LETTERS[l]}#` : diff === -1 ? `${LETTERS[l]}b` : null;
  // Fb is the E key under the finger. Say the plain name, as transpose does.
  if (name && !WHITE_ENHARMONIC.has(name)) return name;
  return pitchClassName(pc, fallback);
}

/** Index of a name's letter, 0 for C to 6 for B. */
export function letterIndex(name: string): number {
  return LETTERS.indexOf(name[0].toUpperCase());
}

export function midiToName(midi: Midi, spelling: Spelling): string {
  return `${pitchClassName(midi, spelling)}${octaveOf(midi)}`;
}

/** "C#/Db" for black keys, "C" for naturals. Used by the orientation lesson. */
export function midiToDualName(midi: Midi): string {
  if (!isBlackKey(midi)) return SHARP_PC[pitchClass(midi)];
  return `${SHARP_PC[pitchClass(midi)]}/${FLAT_PC[pitchClass(midi)]}`;
}

// Accepts any run of accidentals so authored content can use Cb or F##.
const NAME_RE = /^([A-Ga-g])([#b]*)(-?\d+)$/;

export function nameToMidi(name: string): Midi {
  const m = NAME_RE.exec(name.trim());
  if (!m) throw new Error(`Not a note name: ${name}`);
  const [, letter, accidentals, octave] = m;
  let offset = 0;
  for (const ch of accidentals) offset += ch === "#" ? 1 : -1;
  return 12 * (Number(octave) + 1) + LETTER_SEMITONE[letter.toUpperCase()] + offset;
}

export function transpose(midi: Midi, semitones: number): Midi {
  return midi + semitones;
}

/** Authoring sugar: midis("D3","F3","C4") -> [50, 53, 60]. */
export function midis(...names: string[]): Midi[] {
  return names.map(nameToMidi);
}

/** Equal temperament, A4 = 440 Hz. Every synthesized voice starts here. */
export function midiToFreq(midi: Midi): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
