import { nameToMidi } from "@/lib/music/notes";
import type { ChartBar, MelodyNote, ParsedTune, Tune } from "./types";

function splitBars(text: string): string[] {
  return text
    .split("|")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function parseForm(form: string, beatsPerBar: number): ChartBar[] {
  const bars: ChartBar[] = [];
  for (const raw of splitBars(form)) {
    if (raw === "%") {
      const prev = bars[bars.length - 1];
      if (!prev) throw new Error("A chart cannot start with %");
      bars.push({ chords: prev.chords.map((c) => ({ ...c })) });
      continue;
    }
    const symbols = raw.split(/\s+/);
    if (symbols.length > beatsPerBar) throw new Error(`Too many chords in bar: ${raw}`);
    // Two chords split the bar; three or four take a beat each.
    const share = symbols.length === 2 ? beatsPerBar / 2 : beatsPerBar / symbols.length;
    bars.push({ chords: symbols.map((symbol) => ({ symbol, beats: share })) });
  }
  return bars;
}

/**
 * The melody's first pipe marks bar one. Anything before it is a pickup and
 * gets negative start times, which is what the arranger expects.
 */
export function parseMelody(text: string): { notes: MelodyNote[]; pickupBeats: number } {
  const segments = text.split("|").map((s) => s.trim());
  const pickup = segments[0];
  const pickupBeats = pickup
    ? pickup.split(/\s+/).reduce((sum, tok) => sum + Number(tok.split(":")[1] ?? 1), 0)
    : 0;
  const notes: MelodyNote[] = [];
  let t = -pickupBeats;
  for (const segment of segments) {
    if (!segment) continue;
    for (const tok of segment.split(/\s+/)) {
      const [head, beatsRaw, label] = tok.split(":");
      const beats = Number(beatsRaw ?? 1);
      if (!Number.isFinite(beats) || beats <= 0) throw new Error(`Bad melody token: ${tok}`);
      if (head !== "r") notes.push({ start: t, beats, midi: nameToMidi(head), label });
      t += beats;
    }
  }
  return { notes, pickupBeats };
}

export function parseTune(tune: Tune): ParsedTune {
  const beatsPerBar = tune.meter ?? 4;
  const bars = parseForm(tune.form, beatsPerBar);
  const { notes, pickupBeats } = tune.melody ? parseMelody(tune.melody) : { notes: [], pickupBeats: 0 };
  return { bars, beatsPerBar, pickupBeats, melody: notes };
}
