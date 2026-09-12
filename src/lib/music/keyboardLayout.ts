// Keyboard geometry. Every key is absolutely positioned in percent inside one
// relative container, rather than a flex row of white keys with an overlay of
// black ones. Both layers then derive from a single whiteWidth value, the
// keyboard is responsive with no DOM measurement, and z-index handles overlap.

import { isBlackKey, pitchClass, type Midi } from "./notes";

const BLACK_W_RATIO = 0.62; // black key width as a fraction of a white key
export const BLACK_H_RATIO = 0.62; // and its height

// On a real piano the black keys are not centred on the white-key seams. These
// nudges, in units of black-key width, restore the real offsets. Cosmetic.
const BLACK_NUDGE: Record<number, number> = {
  1: -0.1, // C#
  3: 0.1, // D#
  6: -0.13, // F#
  8: 0, // G#
  10: 0.13, // A#
};

export interface KeyLayout {
  midi: Midi;
  isBlack: boolean;
  leftPct: number;
  widthPct: number;
}

export interface KeyboardLayout {
  /** Whites first then blacks, so paint order alone puts blacks on top. */
  keys: KeyLayout[];
  whiteCount: number;
}

export function buildKeyboardLayout(low: Midi, high: Midi): KeyboardLayout {
  // One pass to count whites and record, for each black key, the index of the
  // white key immediately below it.
  const whites: Midi[] = [];
  const blacks: { midi: Midi; whiteIndexBelow: number }[] = [];

  for (let midi = low; midi <= high; midi++) {
    if (isBlackKey(midi)) {
      blacks.push({ midi, whiteIndexBelow: whites.length - 1 });
    } else {
      whites.push(midi);
    }
  }

  const whiteCount = whites.length;
  const whiteW = 100 / whiteCount;
  const blackW = whiteW * BLACK_W_RATIO;

  const keys: KeyLayout[] = whites.map((midi, i) => ({
    midi,
    isBlack: false,
    leftPct: i * whiteW,
    widthPct: whiteW,
  }));

  for (const { midi, whiteIndexBelow } of blacks) {
    // The seam between the white below and the white above.
    const boundary = (whiteIndexBelow + 1) * whiteW;
    const nudge = (BLACK_NUDGE[pitchClass(midi)] ?? 0) * blackW;
    keys.push({
      midi,
      isBlack: true,
      leftPct: boundary - blackW / 2 + nudge,
      widthPct: blackW,
    });
  }

  return { keys, whiteCount };
}
