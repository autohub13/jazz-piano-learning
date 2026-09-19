// A lesson's two hands as something a grand staff can draw: notes placed in
// bars, split and tied at the barlines, with swung rhythms written as the
// straight eighths a lead sheet uses. The right hand goes on the treble staff
// and the left, when it plays under a tune, on the bass staff below it.

import { spellInChord } from "@/lib/music/harmony";
import { letterIndex, pitchClassName, type Midi } from "@/lib/music/notes";
import type { Hand, Lesson } from "./types";

export type Glyph = "whole" | "half" | "quarter" | "eighth" | "sixteenth";

export interface StaffNote {
  midi: Midi;
  /** Diatonic steps above C0, so E4, the bottom line of the treble staff, is 30. */
  step: number;
  /** The sign to draw, already worked out against the rest of the bar. */
  sign: "#" | "b" | "n" | null;
}

export interface StaffEvent {
  bar: number;
  /** Beats from the start of the bar, as written rather than as swung. */
  pos: number;
  beats: number;
  glyph: Glyph;
  dotted: boolean;
  notes: StaffNote[];
  /** Carries on over the barline into the next event. */
  tied: boolean;
  /** Steps during which this is sounding: from inclusive, to exclusive. */
  fromStep: number;
  toStep: number;
}

export interface Sheet {
  bars: number;
  beatsPerBar: number;
  /** True when bar zero is a pickup, drawn short and before bar one. */
  pickup: boolean;
  /** The right hand, for the treble staff. */
  events: StaffEvent[];
  /** The left hand, for the bass staff. Empty when the tune is one hand alone. */
  left: StaffEvent[];
  chords: { bar: number; pos: number; symbol: string }[];
  barOfStep: number[];
}

/** A swung "and" sits two thirds through the beat and is written half way. */
function written(beat: number): number {
  const whole = Math.floor(beat + 1e-6);
  const f = beat - whole;
  if (f < 0.1) return whole;
  if (f < 0.4) return whole + 0.25;
  if (f < 0.75) return whole + 0.5;
  if (f < 0.95) return whole + 0.75;
  return whole + 1;
}

function glyphFor(beats: number): { glyph: Glyph; dotted: boolean } {
  if (beats >= 4) return { glyph: "whole", dotted: false };
  if (beats >= 2) return { glyph: "half", dotted: beats >= 3 };
  if (beats >= 1) return { glyph: "quarter", dotted: beats >= 1.5 };
  if (beats >= 0.5) return { glyph: "eighth", dotted: beats >= 0.75 };
  return { glyph: "sixteenth", dotted: false };
}

function place(name: string, midi: Midi): { step: number; accidental: "#" | "b" | null } {
  const accidental = name[1] === "#" ? "#" : name[1] === "b" ? "b" : null;
  const natural = midi - (accidental === "#" ? 1 : accidental === "b" ? -1 : 0);
  return { step: letterIndex(name) + 7 * (Math.floor(natural / 12) - 1), accidental };
}

/**
 * Where each bar begins, in beats from the first step, with one more entry for
 * where the music ends. A pickup is bar zero and only as long as its beats.
 */
export function barBeats(lesson: Lesson): number[] {
  const perBar = lesson.band?.beatsPerBar ?? 4;
  const lead = lesson.band?.startBeat ?? 0;
  const total = lesson.steps.reduce((sum, step) => sum + step.beats, 0);
  const starts = [0];
  for (let beat = lead > 0 ? lead : perBar; beat < total - 1e-6; beat += perBar) starts.push(beat);
  starts.push(total);
  return starts;
}

/** Null when the lesson has no right hand to write down. */
export function sheetOf(lesson: Lesson): Sheet | null {
  const perBar = lesson.band?.beatsPerBar ?? 4;
  const lead = lesson.band?.startBeat ?? 0;
  const starts: number[] = [];
  let total = 0;
  for (const step of lesson.steps) {
    starts.push(total);
    total += step.beats;
  }
  // Bar zero is the pickup when there is one; its beats sit at its far end.
  const offset = lead > 0 ? perBar - lead : 0;
  const barAt = (beat: number) => Math.floor((beat + offset + 1e-6) / perBar);
  const posAt = (beat: number) => beat + offset - barAt(beat) * perBar;

  // A note is spelled by its place in the chord under it, so the flat 7th of
  // C7 is Bb even in a key that otherwise reads in sharps.
  const nameAt = (i: number, midi: Midi) => {
    const region = [...(lesson.harmony ?? [])].reverse().find((r) => r.fromStep <= i);
    return region ? spellInChord(region.symbol, midi, lesson.spelling) : pitchClassName(midi, lesson.spelling);
  };

  const eventsOf = (hand: Hand): StaffEvent[] => {
    const isHand = (i: number, j: number) => (lesson.steps[i].hands?.[j] ?? lesson.steps[i].hand) === hand;
    const events: StaffEvent[] = [];
    lesson.steps.forEach((step, i) => {
      const struck = step.notes.filter((_, j) => isHand(i, j) && !step.tied?.[j]);
      if (struck.length === 0) return;
      // It sounds for as long as the steps after it carry it on as a tie.
      let to = i + 1;
      while (
        to < lesson.steps.length &&
        struck.every((n) => lesson.steps[to].notes.some((m, j) => m === n && isHand(to, j) && lesson.steps[to].tied?.[j]))
      ) {
        to++;
      }
      let from = written(starts[i]);
      const end = Math.max(from + 0.25, written(to < starts.length ? starts[to] : total));
      while (from < end - 1e-6) {
        const bar = barAt(from);
        const stop = Math.min(end, (bar + 1) * perBar - offset);
        events.push({
          bar,
          pos: posAt(from),
          beats: stop - from,
          ...glyphFor(stop - from),
          notes: [...struck].sort((a, b) => a - b).map((midi) => ({ midi, step: place(nameAt(i, midi), midi).step, sign: null })),
          tied: stop < end - 1e-6,
          fromStep: i,
          toStep: to,
        });
        from = stop;
      }
    });

    // There is no key signature, so every sharp or flat is written, once a bar
    // on each staff, and a natural is written when the same line goes back.
    let bar = -1;
    let state = new Map<number, "#" | "b" | null>();
    for (const event of events) {
      if (event.bar !== bar) {
        bar = event.bar;
        state = new Map();
      }
      for (const note of event.notes) {
        const { accidental } = place(nameAt(event.fromStep, note.midi), note.midi);
        const before = state.get(note.step) ?? null;
        if (accidental !== before) note.sign = accidental ?? "n";
        state.set(note.step, accidental);
      }
    }
    return events;
  };

  const events = eventsOf("right");
  if (events.length === 0) return null;

  return {
    bars: barAt(total - 1e-3) + 1,
    beatsPerBar: perBar,
    pickup: lead > 0,
    events,
    left: eventsOf("left"),
    chords: (lesson.harmony ?? []).map((region) => {
      // A chord pushed onto the "and" before the bar is still written on the bar.
      const beat = Math.round(starts[region.fromStep] ?? 0);
      return { bar: barAt(beat), pos: posAt(beat), symbol: region.symbol };
    }),
    barOfStep: starts.map((s) => barAt(s)),
  };
}
