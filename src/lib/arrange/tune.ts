// A tune in any key, at any level, as a lesson the player and grader can use.

import { KEYS, type KeyName } from "@/lib/lessons/transpose";
import type { ChartChord } from "@/lib/lessons/reharm";
import type { Lesson } from "@/lib/lessons/types";
import { parseChord, transposeSymbol } from "@/lib/music/chords";
import { isBlackKey, type Midi, type Spelling } from "@/lib/music/notes";
import { parseTune } from "@/lib/tunes/parse";
import type { Tune } from "@/lib/tunes/types";
import { arrange, numeralFor, ticks, type Chart, type NoteEvent, type Variation } from "./arrange";

/** What a level plays a tune with, before the learner changes anything. */
export function levelVariation(level: number): Variation {
  if (level <= 2) return { voicing: "shell", reharm: "written", melody: "written", rhythm: "held" };
  if (level === 3) return { voicing: "rootless", reharm: "written", melody: "written", rhythm: "charleston" };
  if (level === 4) return { voicing: "drop2", reharm: "written", melody: "written", rhythm: "anticipate" };
  return { voicing: "rootless", reharm: "written", melody: "arpeggio", rhythm: "charleston" };
}

function spellingFor(key: KeyName): Spelling {
  return key.length > 1 || key === "F" ? "flat" : "sharp";
}

/** Nearest transposition from the tune's own key to `key`. */
function shift(from: KeyName, to: KeyName): number {
  const d = (KEYS.indexOf(to) - KEYS.indexOf(from) + 12) % 12;
  return d <= 6 ? d : d - 12;
}

const ROLES: Record<string, string> = {
  I: "Home.",
  ii: "The setup, leaning towards the V.",
  V: "The tension, pulling back to I.",
  IV: "A step away from home, brighter.",
  vi: "The relative minor, home's shadow.",
  iii: "A softer stand-in for home.",
};

export function chartFromTune(tune: Tune, key: KeyName): Chart {
  const parsed = parseTune(tune);
  const n = shift(tune.key, key);
  const spelling = spellingFor(key);
  const keyPc = parseChord(`${key}maj7`).rootPc;
  const pickup = ticks(parsed.pickupBeats);

  const chords: ChartChord[] = [];
  let t = pickup;
  for (const bar of parsed.bars) {
    for (const { symbol, beats } of bar.chords) {
      const moved = transposeSymbol(symbol, n, spelling);
      const last = chords[chords.length - 1];
      if (last && last.symbol === moved) {
        last.len += ticks(beats);
      } else {
        const numeral = numeralFor(moved, keyPc);
        chords.push({ start: t, len: ticks(beats), symbol: moved, numeral, role: ROLES[numeral] ?? "", written: true });
      }
      t += ticks(beats);
    }
  }

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
    band,
    harmony,
    steps,
  };
}
