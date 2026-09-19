// Playing a lesson in any of the twelve keys.
//
// Lessons stay authored in C. Every MIDI number shifts by the same amount, and
// the text that names notes is re-spelled by letter rather than by pitch class,
// so Gm7 in F comes out as "Gm7 (G Bb F)" and never "A#". Anything that cannot
// be moved safely is dropped rather than left saying something false.

import { MAX_BASE, MIN_BASE } from "@/lib/music/computerKeys";
import { describeMove } from "@/lib/music/harmony";
import { isBlackKey, pitchClass, pitchClassName, transpose, type Midi, type Spelling } from "@/lib/music/notes";
import type { Lesson } from "./types";

export const KEYS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"] as const;
export type KeyName = (typeof KEYS)[number];

export function parseKey(raw: string | null): KeyName {
  return KEYS.find((k) => k === raw) ?? "C";
}

/** The nearer way round: up to a tritone up, otherwise down. Keeps the hands
 *  near where the lesson was written. */
export function semitonesFor(key: KeyName): number {
  const i = KEYS.indexOf(key);
  return i <= 6 ? i : i - 12;
}

/** Flat keys read in flats, sharp keys in sharps. Used for every name derived
 *  from a MIDI number: key labels, hints, the theory panel. */
function spellingFor(key: KeyName): Spelling {
  return key.length > 1 || key === "F" ? "flat" : "sharp";
}

const LETTERS = "CDEFGAB";
const NATURAL = [0, 2, 4, 5, 7, 9, 11];

/** A letter-correct name that reads as a white key to anyone not doing theory. */
const WHITE_ENHARMONIC = new Set(["Fb", "Cb", "E#", "B#"]);

/** One note name, moved to `key` by letter, e.g. "B" in Eb is "D", "Eb" is "Gb". */
function respellNote(letter: string, accidental: string, key: KeyName): string {
  const from = LETTERS.indexOf(letter);
  const to = (from + LETTERS.indexOf(key[0])) % 7;
  const shift = accidental === "#" ? 1 : accidental === "b" ? -1 : 0;
  const pc = pitchClass(NATURAL[from] + shift + semitonesFor(key));
  let diff = (pc - NATURAL[to] + 12) % 12;
  if (diff > 6) diff -= 12;
  if (diff === 0) return LETTERS[to];
  const name = diff === 1 ? `${LETTERS[to]}#` : diff === -1 ? `${LETTERS[to]}b` : null;
  if (name && !WHITE_ENHARMONIC.has(name)) return name;
  // A double flat or sharp, like the blue note in Db, or an Fb that is really
  // the E key under the finger. Say the plain name.
  return pitchClassName(pc, spellingFor(key));
}

// A note or chord symbol: a capital letter, an optional accidental, an optional
// chord quality, and then not a letter or digit, so "Bar" and "C4" are left alone.
const TOKEN = /\b([A-G])([#b]?)(?=(?:maj7|m7b5|m7|m|7|6)?(?![A-Za-z0-9#]))/g;

/**
 * Re-spells every note name in a piece of text. In prose a capital A that opens
 * a sentence is the article ("A major third with a flat seventh"), not a note.
 */
function respellText(text: string, key: KeyName, prose: boolean): string {
  return text.replace(TOKEN, (match, letter: string, accidental: string, offset: number) => {
    if (prose && match === "A" && (offset === 0 || text.slice(0, offset).endsWith(". "))) {
      return match;
    }
    return respellNote(letter, accidental, key);
  });
}

export function transposeLesson(lesson: Lesson, key: KeyName): Lesson {
  if (key === "C") return lesson;
  const n = semitonesFor(key);
  const move = (m: Midi) => transpose(m, n);

  // Both ends of the keyboard must be white keys, so widen outward if needed.
  let low = move(lesson.range.low);
  while (isBlackKey(low)) low--;
  let high = move(lesson.range.high);
  while (isBlackKey(high)) high++;

  const spelling = spellingFor(key);
  const steps = lesson.steps.map((step) => ({ ...step, notes: step.notes.map(move) }));
  const leftAt = (i: number) =>
    steps[i].notes.filter((_, j) => (steps[i].hands?.[j] ?? steps[i].hand) === "left");
  /** Left-hand notes of the nearest step from `from`, walking `dir`, that has any. */
  const leftFrom = (from: number, dir: 1 | -1): Midi[] => {
    for (let i = from; i >= 0 && i < steps.length; i += dir) {
      const notes = leftAt(i);
      if (notes.length > 0) return notes;
    }
    return [];
  };

  return {
    ...lesson,
    spelling,
    range: { low, high },
    keyboardBase: Math.min(MAX_BASE, Math.max(MIN_BASE, move(lesson.keyboardBase))),
    steps: steps.map((step) => ({
      ...step,
      label: step.label && respellText(step.label, key, false),
      // Written for C. Once black keys appear they are simply wrong, and a
      // wrong finger number teaches a habit where a missing one does not.
      fingering: undefined,
    })),
    band: lesson.band && {
      ...lesson.band,
      bass: lesson.band.bass.map((note) => (note === null ? null : move(note))),
    },
    harmony: lesson.harmony?.map((region, i, all) => {
      const symbol = respellText(region.symbol, key, false);
      // Voice-leading prose names particular keys in particular octaves and
      // is too easy to get subtly wrong by substitution, so it is read off
      // the moved notes instead.
      const prev = all[i - 1];
      return {
        ...region,
        symbol,
        role: respellText(region.role, key, true),
        move: prev
          ? describeMove(
              { symbol: respellText(prev.symbol, key, false), notes: leftFrom(region.fromStep - 1, -1) },
              { symbol, notes: leftFrom(region.fromStep, 1) },
              spelling,
            )
          : undefined,
      };
    }),
  };
}
