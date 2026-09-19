// Exercises as functions of a key. Nothing here is authored note by note: a
// drill is a scale or a chord's forms, a progression is a chart built from
// degrees, and a tune comes from the library. All of it goes through the same
// arranger, so a drill and a tune agree on what a chord is.

import { arrange, closeUnder, guideToneMelody, numeralFor, ticks, type Variation } from "@/lib/arrange/arrange";
import { bassLine, guitarComp, type BassChord } from "@/lib/arrange/bass";
import { arrangeTune, chartFromTune, levelVariation } from "@/lib/arrange/tune";
import { KEYS, type KeyName } from "@/lib/lessons/transpose";
import type { BandChart, Finger, Hand, HarmonyRegion, Lesson, LessonStep } from "@/lib/lessons/types";
import { parseChord, rootOnDegree, type Quality } from "@/lib/music/chords";
import { degreeName } from "@/lib/music/harmony";
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

/** The chord each scale is for, so the band can play it underneath. */
const SCALE_CHORD: Record<ScaleKind, Quality> = {
  major: "maj7",
  dorian: "m7",
  mixolydian: "7",
  blues: "7",
  bebop: "7",
  melodicMinor: "m6",
};

/** How each quality is measured from its root, for the panel under a drill. */
const QUALITY_RECIPE: Record<Quality, string> = {
  maj7: "Count half steps up from the root, every key, black or white. The major 3rd is 4 up. The major 7th is 11 up, which is one key below the root an octave higher.",
  6: "Count half steps up from the root. The major 3rd is 4 up, and the 6th, 9 up, takes the 7th's place.",
  m7: "Count half steps up from the root. The minor 3rd is 3 up. The flat 7th is 10 up, which is two keys below the root an octave higher.",
  m6: "Count half steps up from the root. The minor 3rd is 3 up, and the major 6th, 9 up, takes the 7th's place.",
  7: "Count half steps up from the root. The major 3rd is 4 up and the flat 7th is 10 up. The two are a tritone apart, and that is the tension in a dominant chord.",
  m7b5: "Count half steps up from the root. The minor 3rd is 3 up, the flat 5th 6 up, the flat 7th 10 up. A shell leaves the 5th out, so it looks the same as a m7 shell.",
  dim7: "Count half steps up from the root: 3, 6 and 9. Every note is a minor 3rd above the last.",
};

/** Bass, guitar and drums under a drill, one chord per entry, from beat zero. */
function drillBand(chords: BassChord[]): BandChart {
  return { startBeat: 0, beatsPerBar: 4, bass: bassLine(chords, "swing", 4), comp: guitarComp(chords) };
}

export function scaleDrill(kind: ScaleKind, key: KeyName): Lesson {
  const rootPc = keyPc(key);
  // Start in the octave that keeps the whole scale between C4 and C6.
  const root = 60 + rootPc;
  const up = SCALES[kind].map((s) => root + s);
  up.push(root + 12);
  const down = [...up].reverse().slice(1);
  const fingering: Finger[] | undefined = kind === "major" ? MAJOR_RH[key] : undefined;
  const spelling = spellingFor(key);
  const steps: LessonStep[] = [...up, ...down].map((note, i, all) => ({
    notes: [note],
    // The last note rings to the end of its bar, so the scale fills whole
    // bars and loops with the band.
    beats: i === all.length - 1 ? 1 + ((4 - (all.length % 4)) % 4) : 1,
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
    band: drillBand(
      Array.from({ length: steps.reduce((sum, s) => sum + s.beats, 0) / 4 }, () => ({
        symbol: pitchClassName(rootPc, spelling) + SCALE_CHORD[kind],
        beats: 4,
      })),
    ),
  };
}

// Chord forms

export function chordDrill(qualities: readonly DegreeChord["quality"][], style: VoicingStyle, key: KeyName): Lesson {
  const spelling = spellingFor(key);
  const rootName = pitchClassName(keyPc(key), spelling);
  const steps: LessonStep[] = [];
  const bars: BassChord[] = [];
  const harmony: HarmonyRegion[] = [];
  for (const q of qualities) {
    const symbol = `${rootName}${q}`;
    const chord = parseChord(symbol);
    const forms = voicingForms(chord, style, 55);
    // One region per chord, so the degrees are printed on the keys and the
    // panel says how they were counted.
    harmony.push({ fromStep: steps.length, symbol, numeral: "", role: QUALITY_RECIPE[chord.quality] });
    forms.forEach((notes, i) => {
      bars.push({ symbol, beats: 4 });
      steps.push({
        notes,
        beats: 4,
        label: forms.length > 1 ? `${symbol}, form ${String.fromCharCode(65 + i)}` : symbol,
        // Drop 2 spans a tenth: the left hand takes the dropped voice.
        ...(style === "drop2" ? { hands: notes.map((_, j): Hand => (j === 0 ? "left" : "right")) } : { hand: "left" as const }),
      });
    });
  }
  const styleName: Record<VoicingStyle, string> = {
    shell: "shells",
    shell3: "full shells",
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
    harmony,
    // The bass has the root, which is what a rootless voicing is waiting for.
    band: drillBand(bars),
  };
}

/**
 * The ii-V-I in close position, right hand, each chord with the 7th, root, 3rd
 * and 5th on top in turn. The shapes come from the same function that fills a
 * chord in under a melody, so these are exactly what the tunes will ask for.
 */
export function inversionDrill(key: KeyName): Lesson {
  const steps: LessonStep[] = [];
  const bars: BassChord[] = [];
  const harmony: HarmonyRegion[] = [];
  for (const c of PROGRESSIONS["ii-v-i"].chords) {
    const symbol = symbolFor(c, key);
    const chord = parseChord(symbol);
    harmony.push({
      fromStep: steps.length,
      symbol,
      numeral: numeralFor(symbol, keyPc(key)),
      role: "Root position has the 7th on top. Move the lowest note up an octave and the next chord tone is on top: that is an inversion.",
    });
    for (const d of ["7", "R", "3", "5"] as const) {
      // The top note between G4 and F#5, so every shape sits under the hand.
      const top = 67 + pitchClass(chord.rootPc + chord.degrees[d] - 67);
      steps.push({
        notes: closeUnder(chord, top)!,
        beats: 4,
        label: `${symbol}, ${degreeName(chord.rootPc, top, symbol)} on top`,
        hand: "right",
      });
      bars.push({ symbol, beats: 4 });
    }
  }
  const notes = steps.flatMap((s) => s.notes);
  return {
    ...base(key, "inversions", `${key} ii-V-I inversions`, "Each chord four ways up. Hold each one for a bar."),
    range: whiteRange(Math.min(...notes) - 3, Math.max(...notes) + 3),
    keyboardBase: whiteRange(Math.min(...notes) - 3, 60).low,
    defaultBpm: 60,
    steps,
    harmony,
    band: drillBand(bars),
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
    blurb: "Two ii-Vs in a row, the first borrowed. Bars seven and eight of the rhythm changes A section.",
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
    blurb: "III7 VI7 II7 V7 I. Every dominant resolves down a fifth into the next. The rhythm changes bridge, at half the length.",
  },
};

function symbolFor(c: DegreeChord, key: KeyName): string {
  return rootOnDegree(key, c.degree, spellingFor(key)) + c.quality;
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
      const forms = voicingForms(parseChord(symbol), i % 2 === 0 ? "shell3" : "rootless", 57);
      steps.push({ notes: forms[i % forms.length], beats: 4, label: symbol, hand: "left" });
    }
  } else {
    const cadences = [PROGRESSIONS["ii-v-i"], PROGRESSIONS["minor-ii-v-i"], PROGRESSIONS["tritone-ii-v-i"]];
    for (const p of cadences) {
      const lesson = progressionDrill(p, key, { voicing: "rootless", reharm: "written", melody: "written", rhythm: "held", texture: "written" });
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
