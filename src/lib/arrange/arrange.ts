// The arranger: chords and a tune in, a playable lesson out.
//
// A chart is three streams on a grid of ticks: the chords, the tune, and the
// comping hits. Each option rewrites one stream, then the streams are rendered
// back into steps, with a note that carries on across a step boundary marked as
// tied rather than struck again. Everything is rule based and deterministic.
// Sounding right comes from voice leading and from keeping every note of the
// tune inside its chord, not from any freedom in the generation.

import { chordTones, parseChord, snapToChord, stepInSet } from "@/lib/music/chords";
import { pitchClass, pitchClassName, type Midi, type Spelling } from "@/lib/music/notes";
import { voice, type VoicingStyle } from "@/lib/music/voicings";
import { reharmonise, type ChartChord, type Reharm } from "@/lib/lessons/reharm";
import type { BandChart, Hand, HarmonyRegion, LessonStep } from "@/lib/lessons/types";
import type { Style } from "@/lib/tunes/types";
import { bassLine } from "./bass";

export type VoicingChoice = "written" | VoicingStyle;
export type MelodyChoice = "written" | "arpeggio" | "enclosure" | "scaleRun";
export type RhythmChoice = "written" | "held" | "charleston" | "anticipate";

export interface Variation {
  voicing: VoicingChoice;
  reharm: Reharm;
  melody: MelodyChoice;
  rhythm: RhythmChoice;
}

/** Ticks per beat. Twelve holds both the swung eighth (8 + 4) and the triplet. */
export const TPB = 12;
/** The swung "and": the last third of the beat. */
const AND = 8;

export function ticks(beats: number): number {
  return Math.round(beats * TPB);
}

export interface NoteEvent {
  start: number;
  len: number;
  notes: Midi[];
  /** A lyric, kept on the note it was written for. */
  label?: string;
}

export interface Chart {
  chords: ChartChord[];
  melody: NoteEvent[];
  /** Length in ticks. */
  total: number;
  beatsPerBar: number;
  /** Tick at which bar one starts; the pickup is before it. */
  startTick: number;
  range: { low: Midi; high: Midi };
  spelling: Spelling;
  style: Style;
  /** An authored bass line to keep when the chords are unchanged. */
  bass?: (Midi | null)[];
}

function end(e: { start: number; len: number }): number {
  return e.start + e.len;
}

export function chordAt(chords: readonly ChartChord[], tick: number): ChartChord {
  let found = chords[0];
  for (const c of chords) if (c.start <= tick) found = c;
  return found;
}

function shapeMelody(events: NoteEvent[], chords: ChartChord[], choice: MelodyChoice, chart: Chart): NoteEvent[] {
  // Over a chord the reharmonisation put there, the written tune is bent onto
  // the new chord wherever the two clash.
  const fitted = events.map((e) => {
    const chord = chordAt(chords, e.start);
    if (chord.written) return e;
    const c = parseChord(chord.symbol);
    return { ...e, notes: e.notes.map((n) => snapToChord(c, n)) };
  });
  if (choice === "written" || fitted.length === 0) return fitted;

  const pitches = fitted.flatMap((e) => e.notes);
  const lo = Math.max(chart.range.low, Math.min(...pitches) - 2);
  const hi = Math.min(chart.range.high, Math.max(...pitches) + 2);

  const out: NoteEvent[] = [];
  fitted.forEach((e, i) => {
    const next = fitted[i + 1];
    // Only a note that runs straight into a single next note can lead to it.
    const target =
      next && next.start === end(e) && next.notes.length === 1 && e.notes.length === 1 ? next.notes[0] : null;
    if (target === null || e.len < 2 * AND) {
      out.push(e);
      return;
    }

    if (choice === "enclosure") {
      // The scale step above, then the half step below, then the target, as a
      // triplet at the end of the note before.
      const goal = parseChord(chordAt(chords, next.start).symbol);
      const upper = stepInSet(goal, goal.scale, target, 1);
      if (upper > chart.range.high || target - 1 < chart.range.low) {
        out.push(e);
        return;
      }
      out.push(
        { ...e, len: e.len - AND },
        { start: end(e) - AND, len: AND / 2, notes: [upper] },
        { start: end(e) - AND / 2, len: AND / 2, notes: [target - 1] },
      );
      return;
    }

    // Arpeggio or scale run on swung eighths, walking towards the next note
    // and turning back rather than passing it.
    const grid: number[] = [];
    for (let g = e.start + AND; g < end(e); g++) {
      if (g % TPB === 0 || g % TPB === AND) grid.push(g);
    }
    if (grid.length === 0) {
      out.push(e);
      return;
    }
    out.push({ ...e, len: grid[0] - e.start });
    let cur = e.notes[0];
    let dir: 1 | -1 = target >= cur ? 1 : -1;
    grid.forEach((g, k) => {
      const chord = parseChord(chordAt(chords, g).symbol);
      const set = choice === "arpeggio" ? chordTones(chord) : chord.scale;
      let n = stepInSet(chord, set, cur, dir);
      if (n === target) {
        // Arriving early would strike the target twice. Go one past it and
        // come back into it instead, which is how a line circles a note.
        n = stepInSet(chord, set, n, dir);
      } else if ((dir === 1 && n > target) || (dir === -1 && n < target)) {
        dir = dir === 1 ? -1 : 1;
        n = stepInSet(chord, set, cur, dir);
      }
      if (n > hi || n < lo) {
        dir = dir === 1 ? -1 : 1;
        n = stepInSet(chord, set, cur, dir);
      }
      cur = n;
      out.push({ start: g, len: (grid[k + 1] ?? end(e)) - g, notes: [n] });
    });
  });
  return out;
}

interface Hit {
  start: number;
  len: number;
  chord: ChartChord;
}

function compHits(comp: NoteEvent[], chords: ChartChord[], rhythm: RhythmChoice, chart: Chart): Hit[] {
  const { total } = chart;
  if (rhythm === "written" && comp.length > 0) {
    // The written hits, split wherever the reharmonisation changed chord
    // underneath one.
    const hits: Hit[] = [];
    for (const e of comp) {
      const cuts = [e.start, ...chords.map((c) => c.start).filter((s) => s > e.start && s < end(e)), end(e)];
      for (let k = 0; k < cuts.length - 1; k++) {
        hits.push({ start: cuts[k], len: cuts[k + 1] - cuts[k], chord: chordAt(chords, cuts[k]) });
      }
    }
    return hits;
  }

  // Generated comping starts at bar one, so a pickup stays bare.
  const from = chart.startTick;
  const bar = ticks(chart.beatsPerBar);
  const times = new Map<number, ChartChord>();
  const density = rhythm === "written" ? (chart.style === "ballad" ? "held" : "charleston") : rhythm;
  for (let b = from; b < total; b += bar) {
    times.set(b, chordAt(chords, b));
    // Charleston: one, and the and of two.
    const push = b + TPB + AND;
    if (density === "charleston" && push < total) times.set(push, chordAt(chords, push));
  }
  for (const c of chords) if (c.start >= from) times.set(c.start, c);
  if (density === "anticipate") {
    // Each change arrives on the and of the beat before, and rings over it.
    for (const c of chords) {
      const early = c.start - (TPB - AND);
      if (early > from) {
        times.delete(c.start);
        times.set(early, c);
      }
    }
  }
  const starts = [...times.keys()].sort((a, b) => a - b);
  return starts.map((s, k) => ({ start: s, len: (starts[k + 1] ?? total) - s, chord: times.get(s)! }));
}

function voiceHits(hits: Hit[], style: VoicingChoice, melody: NoteEvent[], chart: Chart): NoteEvent[] {
  let prev: Midi[] | null = null;
  let prevChord: ChartChord | null = null;
  return hits.map((hit) => {
    const over = melody.filter((e) => e.start < end(hit) && end(e) > hit.start).flatMap((e) => e.notes);
    const ceiling = over.length > 0 ? Math.min(...over) - 1 : chart.range.high;
    let notes: Midi[];
    if (style === "written" && hit.chord.voicing) {
      notes = hit.chord.voicing;
    } else if (hit.chord === prevChord && prev && Math.max(...prev) <= ceiling) {
      // A chord struck again keeps its shape.
      notes = prev;
    } else {
      notes = voice(parseChord(hit.chord.symbol), style === "written" ? "shell" : style, {
        prev,
        low: chart.range.low,
        high: chart.range.high,
        ceiling,
      });
    }
    prev = notes;
    prevChord = hit.chord;
    return { start: hit.start, len: hit.len, notes };
  });
}

function render(
  melody: NoteEvent[],
  comp: NoteEvent[],
  chords: ChartChord[],
  regionStarts: number[],
  spelling: Spelling,
  total: number,
) {
  const cuts = new Set<number>([0, total, ...regionStarts]);
  for (const e of [...melody, ...comp]) {
    cuts.add(e.start);
    cuts.add(Math.min(end(e), total));
  }
  const times = [...cuts].filter((t) => t >= 0 && t <= total).sort((a, b) => a - b);

  const steps: LessonStep[] = [];
  for (let k = 0; k < times.length - 1; k++) {
    const a = times[k];
    const sounding = (e: NoteEvent) => e.start <= a && a < end(e);
    const mel = melody.filter(sounding);
    const top = new Set(mel.flatMap((e) => e.notes));
    const notes: Midi[] = [];
    const hands: Hand[] = [];
    const tied: boolean[] = [];
    for (const e of comp.filter(sounding)) {
      for (const n of e.notes) {
        if (top.has(n) || notes.includes(n)) continue;
        notes.push(n);
        hands.push("left");
        tied.push(e.start < a);
      }
    }
    for (const e of mel) {
      for (const n of e.notes) {
        notes.push(n);
        hands.push("right");
        tied.push(e.start < a);
      }
    }
    let region = 0;
    regionStarts.forEach((s, i) => {
      if (s <= a) region = i;
    });
    const symbol = chords[region].symbol;
    const fresh = mel.find((e) => e.start === a);
    const label =
      fresh?.label ??
      (fresh ? `${symbol}, ${pitchClassName(fresh.notes[fresh.notes.length - 1], spelling)} on top` : symbol);
    // A rest: nothing sounding at all. Kept as a silent step so time passes.
    steps.push({
      notes,
      beats: (times[k + 1] - a) / TPB,
      label,
      hands,
      tied: tied.some(Boolean) ? tied : undefined,
    });
  }
  return { steps, times };
}

export interface Arrangement {
  steps: LessonStep[];
  harmony: HarmonyRegion[];
  band: BandChart;
}

export function arrange(chart: Chart, v: Variation, comp: NoteEvent[] = []): Arrangement {
  const chords = reharmonise(chart.chords, v.reharm, TPB, chart.spelling);
  const melody = shapeMelody(chart.melody, chords, v.melody, chart);
  const hits = compHits(comp, chords, v.rhythm, chart);
  const voiced = voiceHits(hits, v.voicing, melody, chart);

  // An anticipated chord starts its region on the push, so the analysis and
  // the degrees on the keys change when the chord is actually heard.
  const regionStarts = chords.map((c) => {
    const first = hits.find((h) => h.chord === c);
    return first && first.start < c.start ? first.start : c.start;
  });
  const { steps, times } = render(melody, voiced, chords, regionStarts, chart.spelling, chart.total);

  const keepMove = v.voicing === "written" && v.reharm === "written";
  const reharmonised = chords.some((c) => !c.written);
  const startBeat = chart.startTick / TPB;
  const bass =
    chart.bass && !reharmonised
      ? chart.bass
      : bassLine(
          chords
            .filter((c) => end(c) > chart.startTick)
            .map((c) => ({ symbol: c.symbol, beats: (end(c) - Math.max(c.start, chart.startTick)) / TPB })),
          chart.style,
          chart.beatsPerBar,
        );

  return {
    steps,
    harmony: chords.map((c, i) => ({
      fromStep: Math.max(0, times.indexOf(regionStarts[i])),
      symbol: c.symbol,
      numeral: c.numeral,
      role: c.role,
      move: keepMove ? c.move : undefined,
    })),
    band: { startBeat, beatsPerBar: chart.beatsPerBar, bass },
  };
}

/** Roman numeral of a chord in a key, for the analysis chips. */
export function numeralFor(symbol: string, keyPc: number): string {
  const c = parseChord(symbol);
  const step = pitchClass(c.rootPc - keyPc);
  const names = ["I", "bII", "II", "bIII", "III", "IV", "#IV", "V", "bVI", "VI", "bVII", "VII"];
  const base = names[step];
  const minor = c.quality === "m7" || c.quality === "m6" || c.quality === "m7b5" || c.quality === "dim7";
  const numeral = minor ? base.toLowerCase() : base;
  if (c.quality === "m7b5") return `${numeral}ø`;
  if (c.quality === "dim7") return `${numeral}°`;
  if (c.quality === "7" && step !== 7) return `${numeral}7`;
  return numeral;
}

/**
 * A guide tone line: the 3rd or 7th of each chord, whichever is nearer the
 * note before, held for the chord. It is the skeleton every bebop line hangs
 * on, and the melody variations can embellish it like any other tune.
 */
export function guideToneMelody(chords: readonly ChartChord[], around: Midi): NoteEvent[] {
  let prev = around;
  return chords.map((c) => {
    const chord = parseChord(c.symbol);
    const options = [chord.degrees[3], chord.degrees[7]].map((d) => {
      const pc = pitchClass(chord.rootPc + d);
      let m = prev - ((pitchClass(prev) - pc + 12) % 12);
      if (prev - m > 6) m += 12;
      return m;
    });
    const note = options.sort((a, b) => Math.abs(a - prev) - Math.abs(b - prev))[0];
    prev = note;
    return { start: c.start, len: c.len, notes: [note] };
  });
}
