// The arranger: chords and a tune in, a playable lesson out.
//
// A chart is three streams on a grid of ticks: the chords, the tune, and the
// comping hits. Each option rewrites one stream, then the streams are rendered
// back into steps, with a note that carries on across a step boundary marked as
// tied rather than struck again. Everything is rule based and deterministic.
// Sounding right comes from voice leading and from keeping every note of the
// tune inside its chord, not from any freedom in the generation.

import { chordTones, parseChord, snapToChord, stepInSet, type Chord } from "@/lib/music/chords";
import { describeMove, spellInChord } from "@/lib/music/harmony";
import { pitchClass, type Midi, type Spelling } from "@/lib/music/notes";
import { voice, type VoicingStyle } from "@/lib/music/voicings";
import { reharmonise, type ChartChord, type Reharm } from "@/lib/lessons/reharm";
import type { BandChart, Hand, HarmonyRegion, LessonStep } from "@/lib/lessons/types";
import type { Style } from "@/lib/tunes/types";
import { bassLine, guitarComp } from "./bass";
import { ensemble } from "./ensemble";

export type VoicingChoice = "written" | VoicingStyle;
export type MelodyChoice = "written" | "arpeggio" | "enclosure" | "scaleRun";
export type RhythmChoice = "written" | "held" | "charleston" | "anticipate" | "fill";
/**
 * Who plays what. written: the left hand has the chord, the right the tune.
 * melodyTop: the left hand has the root, and the right hand fills the chord in
 * under the tune. stride: the left hand alternates bass and chord on the beat.
 * solo: the right hand alone, and the band has the chords.
 */
export type TextureChoice = "written" | "melodyTop" | "stride" | "solo";

export interface Variation {
  voicing: VoicingChoice;
  reharm: Reharm;
  melody: MelodyChoice;
  rhythm: RhythmChoice;
  texture: TextureChoice;
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

function compHits(
  comp: NoteEvent[],
  chords: ChartChord[],
  rhythm: RhythmChoice,
  chart: Chart,
  melody: NoteEvent[],
): Hit[] {
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
  if (density === "fill") {
    // Only the changes are kept from the bar grid. Then one hit in each hole:
    // the first beat on which the tune starts nothing, as long as the tune has
    // moved since the left hand last played.
    const onsets = melody.map((e) => e.start);
    let lastHit = -Infinity;
    let lastOnset = -Infinity;
    for (let b = from; b < total; b += TPB) {
      for (const o of onsets) if (o <= b) lastOnset = Math.max(lastOnset, o);
      if (chords.some((c) => c.start === b)) {
        lastHit = b;
        continue;
      }
      times.delete(b);
      const quiet = !onsets.some((o) => o >= b && o < b + TPB);
      if (quiet && lastOnset >= lastHit) {
        times.set(b, chordAt(chords, b));
        lastHit = b;
      }
    }
  }
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

/**
 * The chord in close position with `top` as its highest note: the inversion a
 * melody note asks for. Null when the note is not the root, 3rd, 5th or 7th,
 * since a passing note is played alone.
 */
export function closeUnder(chord: Chord, top: Midi): Midi[] | null {
  const pcs = (["R", "3", "5", "7"] as const).map((d) => pitchClass(chord.rootPc + chord.degrees[d]));
  if (!pcs.includes(pitchClass(top))) return null;
  const below = pcs.filter((pc) => pc !== pitchClass(top)).map((pc) => top - pitchClass(top - pc));
  return [...below.sort((a, b) => a - b), top];
}

/**
 * The right hand fills the chord in under the tune on the notes that carry
 * it: a chord change, beat one or three, or anything held two beats. The notes
 * in between, and any note that is not in the chord, stay single.
 */
function blockUnder(melody: NoteEvent[], chords: ChartChord[], chart: Chart): NoteEvent[] {
  const bar = ticks(chart.beatsPerBar);
  const strong = chart.beatsPerBar === 4 ? [0, 2 * TPB] : [0];
  return melody.map((e) => {
    if (e.notes.length !== 1 || e.start < chart.startTick) return e;
    const c = chordAt(chords, e.start);
    // A note held over a change would carry the old chord into the new one.
    if (end(e) > end(c)) return e;
    const carries = c.start === e.start || strong.includes((e.start - chart.startTick) % bar) || e.len >= 2 * TPB;
    const block = carries ? closeUnder(parseChord(c.symbol), e.notes[0]) : null;
    return block ? { ...e, notes: block } : e;
  });
}

/**
 * Drop 2 under a tune. Each close chord the right hand holds under a melody
 * note gives its second voice from the top to the left hand, an octave down.
 * The tune stays on top, which is what drop 2 is for, and no hand is asked for
 * a tenth.
 */
function dropSecond(blocks: NoteEvent[], chart: Chart): { right: NoteEvent[]; left: NoteEvent[]; full: NoteEvent[] } {
  const right: NoteEvent[] = [];
  const left: NoteEvent[] = [];
  const full: NoteEvent[] = [];
  for (const e of blocks) {
    const dropped = e.notes.length === 4 ? e.notes[2] - 12 : null;
    if (dropped === null || dropped < chart.range.low) {
      right.push(e);
      continue;
    }
    right.push({ ...e, notes: [e.notes[0], e.notes[1], e.notes[3]] });
    left.push({ start: e.start, len: e.len, notes: [dropped] });
    full.push({ start: e.start, len: e.len, notes: [dropped, e.notes[0], e.notes[1], e.notes[3]] });
  }
  return { right, left, full };
}

/** The chord's root in the bass octave, from about C2 up. */
function bassNote(pc: number, chart: Chart): Midi {
  const floor = Math.max(36, chart.range.low);
  return floor + pitchClass(pc - floor);
}

/**
 * Stride: bass on one and three, chord on two and four; in three, bass on one
 * and chord on two and three. The bass on three is the 5th when the chord has
 * not changed, so the left hand swings between root and fifth.
 */
function strideHits(chords: ChartChord[], chart: Chart): { bass: NoteEvent[]; hits: Hit[] } {
  const bass: NoteEvent[] = [];
  const hits: Hit[] = [];
  for (let b = chart.startTick; b < chart.total; b += TPB) {
    const c = chordAt(chords, b);
    const beat = ((b - chart.startTick) / TPB) % chart.beatsPerBar;
    const len = Math.min(TPB, chart.total - b);
    if (beat === 0 || (chart.beatsPerBar === 4 && beat === 2)) {
      const chord = parseChord(c.symbol);
      const pc = beat === 2 && c.start < b ? chord.rootPc + chord.degrees[5] : chord.rootPc;
      bass.push({ start: b, len, notes: [bassNote(pc, chart)] });
    } else {
      hits.push({ start: b, len, chord: c });
    }
  }
  return { bass, hits };
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
      (fresh ? `${symbol}, ${spellInChord(symbol, fresh.notes[fresh.notes.length - 1], spelling)} on top` : symbol);
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
  const shaped = shapeMelody(chart.melody, chords, v.melody, chart);
  // Drop 2 is a ninth or a tenth wide, so it is a two-handed voicing. Under a
  // tune it harmonises the tune; with no tune the hands share a comped chord.
  // Stride has the left hand busy already, and falls back to shells.
  const drop2 = v.voicing === "drop2" && v.texture === "written";
  const harmonised = drop2 && shaped.length > 0;
  let melody = v.texture === "melodyTop" || harmonised ? blockUnder(shaped, chords, chart) : shaped;
  const stride = v.texture === "stride" ? strideHits(chords, chart) : null;
  const hits =
    stride ? stride.hits : v.texture === "solo" || harmonised ? [] : compHits(comp, chords, v.rhythm, chart, melody);
  // What the left hand plays, and the chord shapes whose moves are described:
  // the left hand's chords, or with the melody on top, the right hand's.
  let left: NoteEvent[];
  let shapes: { chord: ChartChord; notes: Midi[] }[];
  if (v.texture === "melodyTop") {
    left = hits.map((h) => ({ start: h.start, len: h.len, notes: [bassNote(parseChord(h.chord.symbol).rootPc, chart)] }));
    shapes = melody.filter((e) => e.notes.length > 1).map((e) => ({ chord: chordAt(chords, e.start), notes: e.notes }));
  } else if (harmonised) {
    const split = dropSecond(melody, chart);
    melody = split.right;
    left = split.left;
    shapes = split.full.map((e) => ({ chord: chordAt(chords, e.start), notes: e.notes }));
  } else {
    const voiced = voiceHits(hits, v.voicing === "drop2" && !drop2 ? "shell" : v.voicing, melody, chart);
    shapes = hits.map((h, k) => ({ chord: h.chord, notes: voiced[k].notes }));
    if (drop2) {
      // No tune: the left hand takes the dropped voice, the right the rest.
      left = voiced.map((e) => ({ ...e, notes: e.notes.slice(0, 1) }));
      melody = voiced.filter((e) => e.notes.length > 1).map((e) => ({ ...e, notes: e.notes.slice(1) }));
    } else {
      left = stride ? [...stride.bass, ...voiced] : voiced;
    }
  }

  // An anticipated chord starts its region on the push, so the analysis and
  // the degrees on the keys change when the chord is actually heard.
  const regionStarts = chords.map((c) => {
    const first = hits.find((h) => h.chord === c);
    return first && first.start < c.start ? first.start : c.start;
  });
  const { steps, times } = render(melody, left, chords, regionStarts, chart.spelling, chart.total);

  const keepMove = v.voicing === "written" && v.reharm === "written" && v.texture === "written";
  // Otherwise the move is read off the chords as generated: the last shape of
  // the chord before against the first shape of this one.
  const moveInto = (c: ChartChord): string | undefined => {
    const k = shapes.findIndex((s) => s.chord === c);
    if (k < 1) return undefined;
    return describeMove(
      { symbol: shapes[k - 1].chord.symbol, notes: shapes[k - 1].notes },
      { symbol: c.symbol, notes: shapes[k].notes },
      chart.spelling,
    );
  };
  const reharmonised = chords.some((c) => !c.written);
  const startBeat = chart.startTick / TPB;
  const sounding = chords
    .filter((c) => end(c) > chart.startTick)
    .map((c) => ({ symbol: c.symbol, beats: (end(c) - Math.max(c.start, chart.startTick)) / TPB }));
  const bass = chart.bass && !reharmonised ? chart.bass : bassLine(sounding, chart.style, chart.beatsPerBar);

  return {
    steps,
    harmony: chords.map((c, i) => ({
      fromStep: Math.max(0, times.indexOf(regionStarts[i])),
      symbol: c.symbol,
      numeral: c.numeral,
      role: c.role,
      move: keepMove && c.move ? c.move : moveInto(c),
    })),
    band: {
      startBeat,
      beatsPerBar: chart.beatsPerBar,
      bass,
      comp: guitarComp(sounding),
      ensemble: ensemble(sounding, chart.beatsPerBar),
    },
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
