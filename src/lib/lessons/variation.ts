// Variations of an authored piece: the same lesson, comped, reharmonised and
// embellished in a different way. The work happens in the arranger; this file
// turns an authored lesson into a chart and back.

import {
  arrange,
  ticks,
  type Chart,
  type MelodyChoice,
  type NoteEvent,
  type RhythmChoice,
  type TextureChoice,
  type Variation,
  type VoicingChoice,
} from "@/lib/arrange/arrange";
import type { Reharm } from "./reharm";
import type { ChartChord } from "./reharm";
import type { Hand, HarmonyRegion, Lesson } from "./types";

export type { Variation, VoicingChoice, MelodyChoice, RhythmChoice, TextureChoice };

export const CHOICES: { [K in keyof Variation]: readonly Variation[K][] } = {
  voicing: ["written", "shell", "shell3", "rootless", "drop2", "quartal"],
  reharm: ["written", "tritone", "secondary", "passingDim"] satisfies readonly Reharm[],
  melody: ["written", "arpeggio", "enclosure", "scaleRun"],
  rhythm: ["written", "held", "charleston", "anticipate", "fill"],
  texture: ["written", "melodyTop", "stride", "solo"],
};

export const AS_WRITTEN: Variation = {
  voicing: "written",
  reharm: "written",
  melody: "written",
  rhythm: "written",
  texture: "written",
};

const AXES = ["voicing", "reharm", "melody", "rhythm", "texture"] as const;

export function isWritten(v: Variation): boolean {
  return AXES.every((axis) => v[axis] === "written");
}

/** "rootless.tritone.written.charleston.stride" from the URL, forgiving anything unknown. */
export function parseVariation(raw: string | null): Variation {
  const parts = raw?.split(".") ?? [];
  const pick = <K extends keyof Variation>(axis: K, i: number): Variation[K] => {
    const list = CHOICES[axis] as readonly string[];
    return (list.includes(parts[i]) ? parts[i] : "written") as Variation[K];
  };
  return {
    voicing: pick("voicing", 0),
    reharm: pick("reharm", 1),
    melody: pick("melody", 2),
    rhythm: pick("rhythm", 3),
    texture: pick("texture", 4),
  };
}

/** The URL form, or null when everything is as written. */
export function formatVariation(v: Variation): string | null {
  return isWritten(v) ? null : AXES.map((axis) => v[axis]).join(".");
}

/** Pulls an authored lesson apart into a chart and its written comping. */
export function chartFromLesson(lesson: Lesson, harmony: HarmonyRegion[]): { chart: Chart; comp: NoteEvent[] } {
  const melody: NoteEvent[] = [];
  const comp: NoteEvent[] = [];
  const chords: ChartChord[] = [];
  let t = 0;
  let r = -1;
  lesson.steps.forEach((step, i) => {
    while (r + 1 < harmony.length && harmony[r + 1].fromStep <= i) {
      r++;
      const h = harmony[r];
      chords.push({ start: t, len: 0, symbol: h.symbol, numeral: h.numeral, role: h.role, move: h.move, written: true });
    }
    const len = ticks(step.beats);
    const left: number[] = [];
    const right: number[] = [];
    step.notes.forEach((n, j) => {
      const hand: Hand = step.hands?.[j] ?? step.hand ?? "right";
      (hand === "left" ? left : right).push(n);
    });
    if (right.length > 0) {
      // A label that names the chord is regenerated; anything else is a lyric.
      const lyric = step.label && (r < 0 || !step.label.startsWith(harmony[r].symbol));
      melody.push({ start: t, len, notes: right, label: lyric ? step.label : undefined });
    }
    if (left.length > 0) {
      comp.push({ start: t, len, notes: left });
      const chord = chords[chords.length - 1];
      if (chord && !chord.voicing) chord.voicing = left;
    }
    t += len;
  });
  chords.forEach((c, i) => {
    c.len = (chords[i + 1]?.start ?? t) - c.start;
  });
  return {
    chart: {
      chords,
      melody,
      total: t,
      beatsPerBar: lesson.band?.beatsPerBar ?? 4,
      startTick: ticks(lesson.band?.startBeat ?? 0),
      range: lesson.range,
      spelling: lesson.spelling,
      style: "swing",
      bass: lesson.band?.bass,
    },
    comp,
  };
}

export function applyVariation(lesson: Lesson, v: Variation): Lesson {
  if (!lesson.harmony || lesson.harmony.length === 0 || isWritten(v)) return lesson;
  const { chart, comp } = chartFromLesson(lesson, lesson.harmony);
  const { steps, harmony, band } = arrange(chart, v, comp);
  return { ...lesson, steps, harmony, band: lesson.band ? band : undefined };
}
