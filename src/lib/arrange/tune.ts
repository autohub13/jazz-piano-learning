// A tune in any key, at any level, as a lesson the player and grader can use.

import { KEYS, type KeyName } from "@/lib/lessons/transpose";
import type { ChartChord } from "@/lib/lessons/reharm";
import type { Lesson } from "@/lib/lessons/types";
import { parseChord, rootOnDegree } from "@/lib/music/chords";
import { isBlackKey, pitchClass, type Midi, type Spelling } from "@/lib/music/notes";
import { parseTune } from "@/lib/tunes/parse";
import type { Tune } from "@/lib/tunes/types";
import { arrange, numeralFor, ticks, type Chart, type NoteEvent, type Variation } from "./arrange";

/** What a level plays a tune with, before the learner changes anything. */
export function levelVariation(level: number): Variation {
  if (level <= 2) return { voicing: "shell", reharm: "written", melody: "written", rhythm: "held", texture: "written" };
  if (level === 3) return { voicing: "rootless", reharm: "written", melody: "written", rhythm: "charleston", texture: "written" };
  if (level === 4) return { voicing: "drop2", reharm: "written", melody: "written", rhythm: "anticipate", texture: "written" };
  return { voicing: "rootless", reharm: "written", melody: "arpeggio", rhythm: "charleston", texture: "written" };
}

function spellingFor(key: KeyName): Spelling {
  return key.length > 1 || key === "F" ? "flat" : "sharp";
}

/** Nearest transposition from the tune's own key to `key`. */
function shift(from: KeyName, to: KeyName): number {
  const d = (KEYS.indexOf(to) - KEYS.indexOf(from) + 12) % 12;
  return d <= 6 ? d : d - 12;
}

/**
 * What a chord is doing, read from where it goes and where it came from rather
 * than from its numeral alone, so a dominant that resolves is called what it
 * is wherever it sits. Forms loop, so the chord after the last is the first.
 */
function roleFor(chords: readonly ChartChord[], i: number, keyPc: number, bluesTonic: boolean): string {
  const at = (j: number) => chords[(j + chords.length) % chords.length];
  const c = parseChord(at(i).symbol);
  const next = at(i + 1);
  const n = parseChord(next.symbol);
  const p = parseChord(at(i - 1).symbol);
  const toNext = pitchClass(n.rootPc - c.rootPc);
  const fromPrev = pitchClass(c.rootPc - p.rootPc);
  const step = pitchClass(c.rootPc - keyPc);
  const minorQ = (q: string) => q === "m7" || q === "m6" || q === "m7b5";
  const flat9 = at(i).symbol.includes("b9")
    ? " The b9 is the flat 6th of the chord it resolves to, a darker pull that suits a minor target."
    : "";

  if (c.quality === "dim7") {
    return toNext === 1
      ? `Passing diminished. Its root sits a half step under ${next.symbol} and pushes up into it.`
      : `A diminished seventh: four notes a minor third apart, all tension, leading on to ${next.symbol}.`;
  }

  if (c.quality === "7") {
    const afterTwo = minorQ(p.quality) && fromPrev === 5;
    if (step === 0 && bluesTonic && !afterTwo) {
      return "Home, blues style. The tonic is a dominant seventh, and its flat 7th is a blue note built into the chord.";
    }
    if (toNext === 5) {
      if (n.rootPc === keyPc) {
        return `The V. Its 3rd leads up a half step to the root of ${next.symbol} and its flat 7th falls to the 3rd.${flat9}`;
      }
      return `Secondary dominant: the V of ${next.symbol}, borrowed from outside the key so that ${next.symbol} sounds like home for a moment.${flat9}`;
    }
    if (toNext === 11) {
      return `Tritone substitute. It shares its 3rd and 7th with the V of ${next.symbol}, and its root slides down a half step into it.`;
    }
    if (step === 5) {
      return bluesTonic
        ? "The IV as a dominant seventh, the blues' second home. Its 3rd and 7th are each a half step from the 7th and 3rd of the I7, so the change is two fingers sliding."
        : "The IV as a dominant seventh, a colour borrowed from the blues.";
    }
    if (step === 7) return "The V, the chord that pulls hardest towards home.";
    return "A dominant seventh: major 3rd and flat 7th, a tritone apart, so it wants to move.";
  }

  if (minorQ(c.quality)) {
    if (n.quality === "7" && toNext === 5) {
      if (c.quality === "m7b5") {
        return "The half-diminished ii of a minor ii-V. Its flat 5th is the flat 6th of the minor key it is heading for.";
      }
      const target = at(i + 2);
      const lands = pitchClass(parseChord(target.symbol).rootPc - n.rootPc) === 5;
      return lands
        ? `The ii of a ii-V: it sets up ${next.symbol}, and the two of them point at ${target.symbol}.`
        : `The ii of a ii-V: it sets up ${next.symbol}.`;
    }
    if (step === 0) {
      return c.quality === "m6"
        ? "Home, in minor. The major 6th on top keeps it settled without sounding heavy."
        : "Home, in minor. Darker than a major tonic, and still at rest.";
    }
    if (step === 5 && c.quality === "m6") {
      return "The minor iv, borrowed from the minor key. Its flat 3rd is the flat 6th of the key, and it wants to fall a half step.";
    }
    if (step === 5) return "The iv, a step away from home.";
    if (step === 9) return "The relative minor, home's shadow. It shares three notes with the I chord.";
    if (step === 4) return "The iii, a softer stand-in for home. It shares three notes with the I chord.";
    if (step === 2) return "The ii, built on the second note of the scale. It leans towards the V.";
    return "A minor chord away from home.";
  }

  // Major: maj7 or 6.
  if (step === 0) return "Home. Nothing in it wants to move.";
  if (p.quality === "7" && fromPrev === 5) {
    return `A temporary home. The dominant before it makes ${at(i).symbol} sound like the tonic for a moment.`;
  }
  if (fromPrev === 5) return `A fifth below ${at(i - 1).symbol}, so the line of falling fifths carries on.`;
  if (step === 5) return "The IV, a step away from home and brighter.";
  return "A major chord away from home: colour, not tension.";
}

export function chartFromTune(tune: Tune, key: KeyName): Chart {
  const parsed = parseTune(tune);
  const n = shift(tune.key, key);
  const spelling = spellingFor(tune.minor ? KEYS[(KEYS.indexOf(key) + 3) % 12] : key);
  const keyPc = parseChord(`${key}maj7`).rootPc;
  const pickup = ticks(parsed.pickupBeats);

  const chords: ChartChord[] = [];
  let t = pickup;
  for (const bar of parsed.bars) {
    for (const { symbol, beats } of bar.chords) {
      // The root keeps its degree in the new key, so it keeps the right letter.
      const from = parseChord(symbol).rootPc - parseChord(`${tune.key}maj7`).rootPc;
      const moved = rootOnDegree(key, from, spelling) + symbol.replace(/^[A-G][#b]?/, "");
      const last = chords[chords.length - 1];
      if (last && last.symbol === moved) {
        last.len += ticks(beats);
      } else {
        const numeral = numeralFor(moved, keyPc);
        chords.push({ start: t, len: ticks(beats), symbol: moved, numeral, role: "", written: true });
      }
      t += ticks(beats);
    }
  }
  // A blues is home on a dominant: every chord on the tonic is a 7.
  const tonics = chords.map((c) => parseChord(c.symbol)).filter((c) => c.rootPc === keyPc);
  const bluesTonic = tonics.length > 0 && tonics.every((c) => c.quality === "7");
  chords.forEach((c, i) => {
    c.role = roleFor(chords, i, keyPc, bluesTonic);
  });

  const melody: NoteEvent[] = parsed.melody.map((m) => ({
    start: ticks(m.start) + pickup,
    len: ticks(m.beats),
    notes: [m.midi + n],
    label: m.label,
  }));

  // Room for a bass, two hands and the tune, then white keys at both ends.
  const pitches = melody.flatMap((e) => e.notes);
  let low: Midi = Math.min(48, ...pitches) - 12;
  let high: Midi = Math.max(72, ...pitches) + 2;
  while (isBlackKey(low)) low--;
  while (isBlackKey(high)) high++;

  return {
    chords,
    melody,
    total: t,
    beatsPerBar: parsed.beatsPerBar,
    startTick: pickup,
    range: { low, high },
    spelling,
    style: tune.style,
  };
}

export function arrangeTune(tune: Tune, key: KeyName, v: Variation = levelVariation(tune.level)): Lesson {
  const chart = chartFromTune(tune, key);
  const { steps, harmony, band } = arrange(chart, v);
  return {
    slug: tune.slug,
    title: tune.title,
    topic: "song",
    order: 0,
    tagline: tune.blurb,
    teachingPoints: [],
    spelling: chart.spelling,
    defaultBpm: tune.bpm.default,
    bpmRange: [tune.bpm.min, tune.bpm.max],
    range: chart.range,
    keyboardBase: Math.max(36, chart.range.low),
    bluesTonicPc: tune.style === "blues" ? KEYS.indexOf(key) : undefined,
    band,
    harmony,
    steps,
  };
}
