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

const LOW = 36; // C2
const HIGH = 55; // G3

function near(pc: number, around: Midi): Midi {
  let m = around - ((pitchClass(around) - pc + 12) % 12);
  if (around - m > 6) m += 12;
  while (m < LOW) m += 12;
  while (m > HIGH) m -= 12;
  return m;
}

function root(chord: Chord, around: Midi): Midi {
  return near(chord.rootPc, around);
}

/** Half step below or above, or the fifth: whichever gives a line, not a jump. */
function approach(next: Chord, from: Midi, prevRoot: Midi): Midi {
  const target = root(next, from);
  const options = [target - 1, target + 1, near(pitchClass(next.rootPc + 7), target)];
  const ok = options.filter((m) => m >= LOW && m <= HIGH && m !== from && m !== prevRoot);
  return ok.sort((a, b) => Math.abs(a - from) - Math.abs(b - from))[0] ?? target;
}

export function bassLine(chords: BassChord[], style: Style, beatsPerBar: number): (Midi | null)[] {
  const out: (Midi | null)[] = [];
  let last: Midi = 45; // A2: a sensible place to start
  chords.forEach((entry, i) => {
    const chord = parseChord(entry.symbol);
    const next = parseChord(chords[(i + 1) % chords.length].symbol);
    const r = root(chord, last);
    const d = chord.degrees;
    const fifth = near(pitchClass(chord.rootPc + d[5]), r);
    const third = near(pitchClass(chord.rootPc + d[3]), r);
    for (let b = 0; b < entry.beats; b++) {
      const lastBeat = b === entry.beats - 1;
      const inBar = (out.length % beatsPerBar);
      let note: Midi | null;
      if (style === "ballad") {
        note = inBar === 0 ? r : inBar === beatsPerBar / 2 ? fifth : null;
      } else if (style === "bossa") {
        // Root, then fifth on the "and of two" territory, simplified to beats.
        note = inBar === 0 || inBar === 1 ? r : fifth;
      } else if (b === 0) {
        note = r;
      } else if (lastBeat && entry.beats > 1) {
        note = approach(next, out[out.length - 1] ?? r, r);
      } else {
        note = b % 2 === 1 ? third : fifth;
        // Walk in one direction rather than bounce.
        if (b === 2 && (out[out.length - 1] ?? r) > note) note = near(pitchClass(note), r + 5);
      }
      out.push(note);
      if (note !== null) last = note;
    }
  });
  return out;
}
