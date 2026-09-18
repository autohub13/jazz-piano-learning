import type { KeyName } from "@/lib/lessons/transpose";

export type Style = "swing" | "ballad" | "bossa" | "blues";

/**
 * A tune is a chord chart, written as text, plus an optional melody. Every
 * arrangement of it is generated, so authoring a tune is writing what a lead
 * sheet says and nothing more.
 */
export interface Tune {
  slug: string;
  title: string;
  /** Public domain or traditional only. Absent means chords only. */
  composer?: string;
  year?: number;
  key: KeyName;
  style: Style;
  bpm: { min: number; default: number; max: number };
  /** Bars between pipes, one chord or two per bar ("Dm7 G7"), "%" repeats the
   *  bar before. Lines are systems and mean nothing to the parser. */
  form: string;
  /** "C4:1 E4:1 G4:2 | r:4 |" tokens of note:beats, r for a rest. A leading
   *  pickup is written before the first pipe and counted as such. */
  melody?: string;
  /** Beats per bar. */
  meter?: 3 | 4;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /** One line for the library card. */
  blurb: string;
}

export interface ChartBar {
  chords: { symbol: string; beats: number }[];
}

export interface MelodyNote {
  /** In beats from the first full bar. Negative during a pickup. */
  start: number;
  beats: number;
  midi: number;
  /** A lyric or the note as written, for the cue line. */
  label?: string;
}

export interface ParsedTune {
  bars: ChartBar[];
  beatsPerBar: number;
  pickupBeats: number;
  melody: MelodyNote[];
}
