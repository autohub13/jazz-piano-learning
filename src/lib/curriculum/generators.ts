// Exercises as functions of a key. Nothing here is authored note by note: a
// drill is a scale or a chord's forms, a progression is a chart built from
// degrees, and a tune comes from the library. All of it goes through the same
// arranger, so a drill and a tune agree on what a chord is.

import { arrange, guideToneMelody, ticks, type Variation } from "@/lib/arrange/arrange";
import { arrangeTune, chartFromTune, levelVariation } from "@/lib/arrange/tune";
import { KEYS, type KeyName } from "@/lib/lessons/transpose";
import type { Finger, Lesson, LessonStep } from "@/lib/lessons/types";
import { parseChord, type Quality } from "@/lib/music/chords";
import { isBlackKey, pitchClass, pitchClassName, type Midi, type Spelling } from "@/lib/music/notes";
import { voicingForms, type VoicingStyle } from "@/lib/music/voicings";
import type { Tune } from "@/lib/tunes/types";
import { MAJOR_RH } from "./fingerings";

function spellingFor(key: KeyName): Spelling {
  return key.length > 1 || key === "F" ? "flat" : "sharp";
}

function keyPc(key: KeyName): number {
  return KEYS.indexOf(key) as number;
}

function whiteRange(low: Midi, high: Midi): { low: Midi; high: Midi } {
  while (isBlackKey(low)) low--;
  while (isBlackKey(high)) high++;
  return { low, high };
}

function base(key: KeyName, slug: string, title: string, tagline: string): Omit<Lesson, "steps"> {
  return {
    slug,
    title,
    topic: "scale",
    order: 0,
    tagline,
    teachingPoints: [],
    spelling: spellingFor(key),
    defaultBpm: 80,
    bpmRange: [40, 200],
    range: whiteRange(48, 84),
    keyboardBase: 48,
  };
}

// Scales

export type ScaleKind = "major" | "dorian" | "mixolydian" | "blues" | "bebop" | "melodicMinor";

const SCALES: Record<ScaleKind, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  blues: [0, 3, 5, 6, 7, 10],
  // The bebop dominant scale: mixolydian with a passing major 7th, so chord
  // tones fall on the beats when played in eighths.
  bebop: [0, 2, 4, 5, 7, 9, 10, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
};

export function scaleDrill(kind: ScaleKind, key: KeyName): Lesson {
  const rootPc = keyPc(key);
  // Start in the octave that keeps the whole scale between C4 and C6.
  const root = 60 + rootPc;
  const up = SCALES[kind].map((s) => root + s);
  up.push(root + 12);
  const down = [...up].reverse().slice(1);
  const fingering: Finger[] | undefined = kind === "major" ? MAJOR_RH[key] : undefined;
  const spelling = spellingFor(key);
  const steps: LessonStep[] = [...up, ...down].map((note, i) => ({
    notes: [note],
    beats: 1,
    label: pitchClassName(note, spelling),
    hand: "right",
    fingering: fingering
      ? [i < up.length ? fingering[i] : fingering[up.length - 1 - (i - up.length) - 1] ?? fingering[0]]
      : undefined,
  }));
  const names: Record<ScaleKind, string> = {
    major: "major scale",
    dorian: "dorian",
    mixolydian: "mixolydian",
    blues: "blues scale",
    bebop: "bebop dominant scale",
    melodicMinor: "melodic minor",
  };
  return {
    ...base(key, `scale-${kind}`, `${key} ${names[kind]}`, "Up and down, one octave, one note a beat."),
    range: whiteRange(root - 2, root + 14),
    keyboardBase: whiteRange(root - 2, root).low,
    steps,
  };
}

// Chord forms

export function chordDrill(qualities: readonly Quality[], style: VoicingStyle, key: KeyName): Lesson {
  const spelling = spellingFor(key);
  const rootName = pitchClassName(keyPc(key), spelling);
  const steps: LessonStep[] = [];
  const suffix: Record<Quality, string> = { maj7: "maj7", 6: "6", m7: "m7", m6: "m6", 7: "7", m7b5: "m7b5", dim7: "dim7" };
  for (const q of qualities) {
    const symbol = `${rootName}${suffix[q]}`;
    const chord = parseChord(symbol);
    const forms = voicingForms(chord, style, 55);
    forms.forEach((notes, i) => {
      steps.push({
        notes,
        beats: 4,
        label: forms.length > 1 ? `${symbol}, form ${String.fromCharCode(65 + i)}` : symbol,
        hand: "left",
      });
    });
  }
  const styleName: Record<VoicingStyle, string> = {
    shell: "shells",
    rootless: "rootless voicings",
    drop2: "drop 2 voicings",
    quartal: "quartal voicings",
  };
  const notes = steps.flatMap((s) => s.notes);
  return {
    ...base(key, `chords-${style}`, `${key} ${styleName[style]}`, "Each chord in every form. Hold each one for a bar."),
    range: whiteRange(Math.min(...notes) - 3, Math.max(...notes) + 3),
    keyboardBase: whiteRange(Math.min(...notes) - 3, 60).low,
    defaultBpm: 60,
    steps,
  };
}

// Progressions

/** A chord as a degree of the key: semitones above the tonic, quality, beats. */
export interface DegreeChord {
  degree: number;
  quality: Quality | "7b9" | "7#11" | "7b13";
  beats: number;
}

export interface Progression {
  id: string;
  title: string;
  chords: DegreeChord[];
  blurb: string;
}

export const PROGRESSIONS: Record<string, Progression> = {
  "ii-v-i": {
    id: "ii-v-i",
    title: "ii-V-I",
    chords: [
      { degree: 2, quality: "m7", beats: 4 },
      { degree: 7, quality: "7", beats: 4 },
      { degree: 0, quality: "maj7", beats: 8 },
    ],
    blurb: "The cadence jazz is made of.",
  },
  turnaround: {
    id: "turnaround",
    title: "I-vi-ii-V turnaround",
    chords: [
      { degree: 0, quality: "maj7", beats: 2 },
      { degree: 9, quality: "m7", beats: 2 },
      { degree: 2, quality: "m7", beats: 2 },
      { degree: 7, quality: "7", beats: 2 },
      { degree: 0, quality: "maj7", beats: 2 },
      { degree: 9, quality: "m7", beats: 2 },
      { degree: 2, quality: "m7", beats: 2 },
      { degree: 7, quality: "7", beats: 2 },
    ],
    blurb: "Two chords a bar, round and round. The last two bars of almost everything.",
  },
  "minor-ii-v-i": {
    id: "minor-ii-v-i",
    title: "minor ii-V-i",
    chords: [
      { degree: 2, quality: "m7b5", beats: 4 },
      { degree: 7, quality: "7b9", beats: 4 },
      { degree: 0, quality: "m6", beats: 8 },
    ],
    blurb: "Half diminished, altered dominant, minor sixth. The dark version of the cadence.",
  },
  "tritone-ii-v-i": {
    id: "tritone-ii-v-i",
    title: "ii-bII7-I",
    chords: [
      { degree: 2, quality: "m7", beats: 4 },
      { degree: 1, quality: "7#11", beats: 4 },
      { degree: 0, quality: "maj7", beats: 8 },
    ],
    blurb: "The V replaced by the dominant a tritone away. The bass walks down by half steps.",
  },
  "iii-vi-ii-v": {
    id: "iii-vi-ii-v",
    title: "iii-VI7-ii-V7",
    chords: [
      { degree: 4, quality: "m7", beats: 4 },
      { degree: 9, quality: "7b9", beats: 4 },
      { degree: 2, quality: "m7", beats: 4 },
      { degree: 7, quality: "7b13", beats: 4 },
    ],
    blurb: "Two ii-Vs in a row, the second borrowed. Bars five to eight of the rhythm changes bridge.",
  },
  "cycle-of-dominants": {
    id: "cycle-of-dominants",
    title: "Cycle of dominants",
    chords: [
      { degree: 4, quality: "7", beats: 4 },
      { degree: 9, quality: "7", beats: 4 },
      { degree: 2, quality: "7", beats: 4 },
      { degree: 7, quality: "7", beats: 4 },
      { degree: 0, quality: "maj7", beats: 8 },
    ],
    blurb: "III7 VI7 II7 V7 I. Every dominant resolves down a fifth into the next.",
  },
};

function symbolFor(c: DegreeChord, key: KeyName): string {
  const spelling = spellingFor(key);
  return pitchClassName(pitchClass(keyPc(key) + c.degree), spelling) + c.quality;
}

/** The progression as a one-off tune in the key, so the tune path does the rest. */
export function progressionTune(p: Progression, key: KeyName, style: Tune["style"] = "swing"): Tune {
  const form = expandLong(p, key);
  if (!form) throw new Error(`Progression ${p.id} does not fill whole bars`);
  return {
    slug: p.id,
    title: p.title,
    key,
    style,
    bpm: { min: 50, default: 100, max: 220 },
    level: 2,
    blurb: p.blurb,
    form,
  };
}

function expandLong(p: Progression, key: KeyName): string | null {
  const bars: string[] = [];
  let current: string[] = [];
  let fill = 0;
  for (const c of p.chords) {
    let left = c.beats;
    const symbol = symbolFor(c, key);
    while (left > 0) {
      const take = Math.min(left, 4 - fill);
      if (fill === 0 && take === 4) {
        bars.push(symbol);
      } else {
        current.push(symbol);
        fill += take;
        if (fill === 4) {
          bars.push(current.join(" "));
          current = [];
          fill = 0;
        }
      }
      left -= take;
    }
  }
  if (current.length > 0) return null;
  return `| ${bars.join(" | ")} |`;
}

export function progressionDrill(p: Progression, key: KeyName, v: Variation): Lesson {
  const tune = progressionTune(p, key);
  const lesson = arrangeTune(tune, key, v);
  return { ...lesson, topic: "progression", tagline: p.blurb };
}

/** The progression with a guide tone line on top, embellished as asked. */
export function guideToneEtude(p: Progression, key: KeyName, v: Variation): Lesson {
  const tune = progressionTune(p, key);
  const chart = chartFromTune(tune, key);
  chart.melody = guideToneMelody(chart.chords, 67);
  chart.range = whiteRange(Math.min(chart.range.low, 45), Math.max(chart.range.high, 79));
  const { steps, harmony, band } = arrange(chart, v);
  const lesson = arrangeTune(tune, key, v);
  return { ...lesson, steps, harmony, band, range: chart.range, tagline: "The 3rds and 7ths, and a line hung on them." };
}

export function tuneLesson(tune: Tune, key: KeyName, level: number): Lesson {
  return arrangeTune(tune, key, levelVariation(level));
}

// Ear training

export type EarKind = "quality" | "cadence";

/** A fixed, key-dependent sequence, so the same test is the same test. */
export function earLesson(kind: EarKind, key: KeyName): Lesson {
  const spelling = spellingFor(key);
  const rootName = pitchClassName(keyPc(key), spelling);
  const steps: LessonStep[] = [];
  if (kind === "quality") {
    const order: Quality[] = ["maj7", "m7", "7", "m7b5", "dim7", "6", "m6", "7"];
    // Rotate by key so the drill differs from key to key.
    const start = keyPc(key) % order.length;
    for (let i = 0; i < order.length; i++) {
      const q = order[(start + i) % order.length];
      const symbol = `${rootName}${q}`;
      const forms = voicingForms(parseChord(symbol), i % 2 === 0 ? "shell" : "rootless", 57);
      steps.push({ notes: forms[i % forms.length], beats: 4, label: symbol, hand: "left" });
    }
  } else {
    const cadences = [PROGRESSIONS["ii-v-i"], PROGRESSIONS["minor-ii-v-i"], PROGRESSIONS["tritone-ii-v-i"]];
    for (const p of cadences) {
      const lesson = progressionDrill(p, key, { voicing: "rootless", reharm: "written", melody: "written", rhythm: "held" });
      steps.push(...lesson.steps.map((s) => ({ ...s, label: p.title })));
    }
  }
  const all = steps.flatMap((s) => s.notes);
  return {
    ...base(key, `ear-${kind}`, kind === "quality" ? `Hear the quality on ${key}` : `Hear the cadence in ${key}`, ""),
    range: whiteRange(Math.min(45, ...all) - 2, Math.max(79, ...all) + 2),
    keyboardBase: 48,
    defaultBpm: 60,
    steps,
  };
}

export { ticks };
