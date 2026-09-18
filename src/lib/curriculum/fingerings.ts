// Right hand major scale fingerings, one octave ascending. Descending is the
// same numbers backwards. These are the standard ones every method book gives.

import type { Finger } from "@/lib/lessons/types";
import type { KeyName } from "@/lib/lessons/transpose";

export const MAJOR_RH: Record<KeyName, Finger[]> = {
  C: [1, 2, 3, 1, 2, 3, 4, 5],
  G: [1, 2, 3, 1, 2, 3, 4, 5],
  D: [1, 2, 3, 1, 2, 3, 4, 5],
  A: [1, 2, 3, 1, 2, 3, 4, 5],
  E: [1, 2, 3, 1, 2, 3, 4, 5],
  B: [1, 2, 3, 1, 2, 3, 4, 5],
  F: [1, 2, 3, 4, 1, 2, 3, 4],
  Bb: [4, 1, 2, 3, 1, 2, 3, 4],
  Eb: [3, 1, 2, 3, 4, 1, 2, 3],
  Ab: [3, 4, 1, 2, 3, 1, 2, 3],
  Db: [2, 3, 1, 2, 3, 4, 1, 2],
  Gb: [2, 3, 4, 1, 2, 3, 1, 2],
};
