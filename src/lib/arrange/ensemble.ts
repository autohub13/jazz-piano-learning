// The rest of the band: a vibraphone and a horn section over the rhythm
// section. They trade four-bar phrases the way a small big band would, vibes
// first and horns answering, so the colour changes as the form goes round and
// neither is ever on top of the other.

import { parseChord, type Chord } from "@/lib/music/chords";
import type { BandHit } from "@/lib/lessons/types";
import { pitchClass, type Midi } from "@/lib/music/notes";
import type { BassChord } from "./bass";

const PHRASE_BARS = 4;
/** The swung "and", as a fraction of the beat. */
const AND = 2 / 3;

function closest(pc: number, around: Midi): Midi {
  let m = around - ((pitchClass(around) - pitchClass(pc) + 12) % 12);
  if (around - m > 6) m += 12;
  return m;
}

function voiced(chord: Chord, degrees: readonly (3 | 7 | 9)[], around: Midi): Midi[] {
  return degrees.map((d) => closest(chord.rootPc + chord.degrees[d], around)).sort((a, b) => a - b);
}

export function ensemble(chords: BassChord[], beatsPerBar: number): { vibes: BandHit[]; horns: BandHit[] } {
  const vibes: BandHit[] = [];
  const horns: BandHit[] = [];
  const phrase = PHRASE_BARS * beatsPerBar;

  // One entry per beat, so a chord can be asked for anywhere.
  const perBeat: Chord[] = [];
  for (const entry of chords) {
    const chord = parseChord(entry.symbol);
    for (let b = 0; b < entry.beats; b++) perBeat.push(chord);
  }

  // A chord is struck where it starts and again every two bars it lasts, and
  // cut at the end of the phrase, where the other section takes over.
  let from = 0;
  while (from < perBeat.length) {
    const chord = perBeat[from];
    const withVibes = Math.floor(from / phrase) % 2 === 0;
    const phraseEnd = (Math.floor(from / phrase) + 1) * phrase;
    // The horns' last bar is its own figure, so nothing is held into it.
    const lastBar = phraseEnd - beatsPerBar;
    const cut = !withVibes && from < lastBar ? lastBar : phraseEnd;
    const limit = Math.min(perBeat.length, from + 2 * beatsPerBar, cut);
    let to = from + 1;
    while (to < limit && perBeat[to] === chord) to++;

    if (withVibes) {
      // Vibes high, above the tune: 3rd, 7th and 9th.
      vibes.push({ beat: from, beats: to - from, notes: voiced(chord, [3, 7, 9], 79) });
    } else {
      if (from >= lastBar && beatsPerBar === 4) {
        // The phrase ends with a punctuation: a stab on one and a push on the
        // and of two, which the drum fill answers on four.
        if (from % beatsPerBar === 0) {
          const push = perBeat[from + 2] ?? chord;
          horns.push({ beat: from, beats: 0.5, notes: voiced(chord, [3, 7], 64) });
          horns.push({ beat: from + 1 + AND, beats: 1 + (1 - AND), notes: voiced(push, [3, 7], 64) });
        }
      } else {
        // Long guide tones under the tune, with a breath before the next.
        horns.push({ beat: from, beats: to - from - 0.25, notes: voiced(chord, [3, 7], 64) });
      }
    }
    from = to;
  }
  return { vibes, horns };
}
