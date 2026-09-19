// A bass line from the chords. Walking bass is a small set of habits: the root
// on one, a chord tone on two and three, and something on four that leans into
// the next root by a half step or from the fifth. That is enough to sound like
// a bassist who knows the tune, which is all a practice band needs.

import { parseChord, type Chord } from "@/lib/music/chords";
import { pitchClass, type Midi } from "@/lib/music/notes";
import type { Style } from "@/lib/tunes/types";

/** One chord per stretch of beats, already in playing order. */
export interface BassChord {
  symbol: string;
  beats: number;
}

/** Where the line may go. The band's bass has C2 to G3; a left hand walking
 *  under a tune is given whatever room the tune leaves. */
export interface BassRange {
  low: Midi;
  high: Midi;
}

const BAND: BassRange = { low: 36, high: 55 };

function near(pc: number, around: Midi, { low, high }: BassRange): Midi {
  let m = around - ((pitchClass(around) - pc + 12) % 12);
  if (around - m > 6) m += 12;
  while (m < low) m += 12;
  while (m > high) m -= 12;
  return m;
}

function root(chord: Chord, around: Midi, range: BassRange): Midi {
  return near(chord.rootPc, around, range);
}

/** Half step below or above, or the fifth: whichever gives a line, not a jump. */
function approach(next: Chord, from: Midi, prevRoot: Midi, range: BassRange): Midi {
  const target = root(next, from, range);
  const options = [target - 1, target + 1, near(pitchClass(next.rootPc + 7), target, range)];
  const ok = options.filter((m) => m >= range.low && m <= range.high && m !== from && m !== prevRoot);
  return ok.sort((a, b) => Math.abs(a - from) - Math.abs(b - from))[0] ?? target;
}

/**
 * Rhythm guitar the way a swing band has it: the 3rd and 7th of the chord,
 * four to the bar, each pair placed as close to the last as it will go.
 */
export function guitarComp(chords: BassChord[]): Midi[][] {
  const out: Midi[][] = [];
  let around: Midi = 57; // A3, above the bass and under the tune
  for (const entry of chords) {
    const chord = parseChord(entry.symbol);
    const place = (degree: 3 | 7) => {
      let m = around - ((pitchClass(around) - pitchClass(chord.rootPc + chord.degrees[degree]) + 12) % 12);
      if (around - m > 6) m += 12;
      return m;
    };
    const notes = [place(3), place(7)].sort((a, b) => a - b);
    // Drift back towards home rather than following the chords off the neck.
    around = Math.round((notes[0] + notes[1]) / 2 + (57 - (notes[0] + notes[1]) / 2) * 0.25);
    for (let b = 0; b < entry.beats; b++) out.push(notes);
  }
  return out;
}

export function bassLine(
  chords: BassChord[],
  style: Style,
  beatsPerBar: number,
  range: BassRange = BAND,
): (Midi | null)[] {
  const out: (Midi | null)[] = [];
  let last: Midi = 45; // A2: a sensible place to start
  chords.forEach((entry, i) => {
    const chord = parseChord(entry.symbol);
    const next = parseChord(chords[(i + 1) % chords.length].symbol);
    const r = root(chord, last, range);
    const d = chord.degrees;
    const fifth = near(pitchClass(chord.rootPc + d[5]), r, range);
    const third = near(pitchClass(chord.rootPc + d[3]), r, range);
    for (let b = 0; b < entry.beats; b++) {
      const lastBeat = b === entry.beats - 1;
      const inBar = (out.length % beatsPerBar);
      let note: Midi | null;
      if (style === "ballad") {
        // A chord that arrives in the middle of the bar gets its root too.
        note = inBar === 0 || b === 0 ? r : inBar === beatsPerBar / 2 ? fifth : null;
      } else if (style === "bossa") {
        // Root, then fifth on the "and of two" territory, simplified to beats.
        note = inBar === 0 || inBar === 1 ? r : fifth;
      } else if (b === 0) {
        note = r;
      } else if (lastBeat && entry.beats > 1) {
        note = approach(next, out[out.length - 1] ?? r, r, range);
      } else if (inBar === 0 && entry.beats > 2 * beatsPerBar) {
        // A chord that lasts for bars comes home on each downbeat, or a modal
        // tune would never hear its root again.
        note = r;
      } else {
        note = b % 2 === 1 ? third : fifth;
        // Walk in one direction rather than bounce.
        if (b === 2 && (out[out.length - 1] ?? r) > note) note = near(pitchClass(note), r + 5, range);
      }
      out.push(note);
      if (note !== null) last = note;
    }
  });
  return out;
}
